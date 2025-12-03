/**
 * WebSocket Server for Trade Room Real-time Updates
 * Handles connections, authentication, and message routing
 */

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const RoomManager = require('./roomManager');

class WebSocketServer {
  constructor(port = 4001, httpServer = null) {
    this.port = port;
    this.httpServer = httpServer;
    this.wss = null;
    this.roomManager = new RoomManager();
    this.clients = new Map(); // userId -> Set of WebSocket connections
  }

  /**
   * Start the WebSocket server
   * If httpServer is provided, attach WebSocket to it (for Phusion Passenger compatibility)
   * Otherwise, create a standalone WebSocket server on the specified port
   */
  start() {
    // If httpServer is provided, attach WebSocket to it (Phusion Passenger mode)
    if (this.httpServer) {
      // Attach WebSocket to specific path on the HTTP server
      // Use the same base path as the REST API for consistency
      const basePath = process.env.API_BASE_PATH || '';
      const wsPath = `${basePath}/ws`;

      logger.log(`[WebSocket] Attempting to attach to HTTP server...`);
      logger.log(`[WebSocket] API_BASE_PATH: ${basePath}`);
      logger.log(`[WebSocket] WebSocket path: ${wsPath}`);
      logger.log(`[WebSocket] HTTP server: ${this.httpServer ? 'provided' : 'not provided'}`);

      this.wss = new WebSocket.Server({ server: this.httpServer, path: wsPath });

      logger.log(`[WebSocket] Server attached to HTTP server at path: ${wsPath}`);
      logger.log(`[WebSocket] WebSocket server ready to accept connections`);
    } else {
      // Standalone mode: create WebSocket server on specified port
      this.wss = new WebSocket.Server({ port: this.port });
      logger.log(`[WebSocket] Server started on port ${this.port}`);
    }

    this.wss.on('connection', (ws, req) => {
      logger.log(`[WebSocket] ✅ NEW CONNECTION ESTABLISHED`);
      logger.log(`[WebSocket] Request URL: ${req.url}`);
      logger.log(`[WebSocket] Request headers:`, {
        upgrade: req.headers.upgrade,
        connection: req.headers.connection,
        'sec-websocket-key': req.headers['sec-websocket-key'],
        'sec-websocket-version': req.headers['sec-websocket-version']
      });

      // Set timeout for authentication (5 seconds)
      const authTimeout = setTimeout(() => {
        if (!ws.userId) {
          logger.warn('[WebSocket] Authentication timeout, closing connection');
          ws.close(1008, 'Authentication timeout');
        }
      }, 5000);

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleMessage(ws, message, authTimeout);
        } catch (err) {
          logger.error('[WebSocket] Failed to parse message:', err);
          ws.send(JSON.stringify({ type: 'error', data: { message: 'Invalid message format' } }));
        }
      });

      ws.on('close', () => {
        clearTimeout(authTimeout);
        this.handleDisconnect(ws);
      });

      ws.on('error', (err) => {
        logger.error('[WebSocket] Connection error:', err);
      });
    });
  }

  /**
   * Handle incoming messages
   */
  handleMessage(ws, message, authTimeout) {
    const { type, data } = message;

    if (type === 'auth') {
      this.handleAuth(ws, data, authTimeout);
    } else if (type === 'subscribe_room') {
      this.handleSubscribeRoom(ws, data);
    } else if (type === 'unsubscribe_room') {
      this.handleUnsubscribeRoom(ws, data);
    } else {
      logger.warn(`[WebSocket] Unknown message type: ${type}`);
    }
  }

  /**
   * Handle authentication
   */
  handleAuth(ws, data, authTimeout) {
    try {
      const { token } = data;
      if (!token) {
        ws.close(1008, 'No token provided');
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      ws.userId = decoded.userId;
      clearTimeout(authTimeout);

      // Track client connection
      if (!this.clients.has(ws.userId)) {
        this.clients.set(ws.userId, new Set());
      }
      this.clients.get(ws.userId).add(ws);

      logger.log(`[WebSocket] User ${ws.userId} authenticated`);
      ws.send(JSON.stringify({ type: 'auth_success', data: { userId: ws.userId } }));
    } catch (err) {
      logger.error('[WebSocket] Authentication failed:', err.message);
      ws.close(1008, 'Authentication failed');
    }
  }

  /**
   * Handle room subscription
   */
  handleSubscribeRoom(ws, data) {
    if (!ws.userId) {
      ws.send(JSON.stringify({ type: 'error', data: { message: 'Not authenticated' } }));
      return;
    }

    const { bullPenId } = data;
    if (!bullPenId) {
      ws.send(JSON.stringify({ type: 'error', data: { message: 'bullPenId required' } }));
      return;
    }

    this.roomManager.subscribe(bullPenId, ws.userId, ws);
    logger.log(`[WebSocket] User ${ws.userId} subscribed to room ${bullPenId}`);
  }

  /**
   * Handle room unsubscription
   */
  handleUnsubscribeRoom(ws, data) {
    if (!ws.userId) return;

    const { bullPenId } = data;
    if (!bullPenId) return;

    this.roomManager.unsubscribe(bullPenId, ws.userId);
    logger.log(`[WebSocket] User ${ws.userId} unsubscribed from room ${bullPenId}`);
  }

  /**
   * Handle client disconnect
   */
  handleDisconnect(ws) {
    if (!ws.userId) return;

    // Remove from room subscriptions
    this.roomManager.unsubscribeAll(ws.userId);

    // Remove from clients map
    const userConnections = this.clients.get(ws.userId);
    if (userConnections) {
      userConnections.delete(ws);
      if (userConnections.size === 0) {
        this.clients.delete(ws.userId);
      }
    }

    logger.log(`[WebSocket] User ${ws.userId} disconnected`);
  }

  /**
   * Broadcast message to room subscribers
   */
  broadcastToRoom(bullPenId, message) {
    const subscribers = this.roomManager.getSubscribers(bullPenId);
    subscribers.forEach(({ ws }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Send message to specific user
   */
  sendToUser(userId, message) {
    const userConnections = this.clients.get(userId);
    if (userConnections) {
      userConnections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(message));
        }
      });
    }
  }

  /**
   * Get room manager for external access
   */
  getRoomManager() {
    return this.roomManager;
  }
}

module.exports = WebSocketServer;

