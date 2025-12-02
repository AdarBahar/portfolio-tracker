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
      this.wss = new WebSocket.Server({ server: this.httpServer });
    } else {
      // Standalone mode: create WebSocket server on specified port
      this.wss = new WebSocket.Server({ port: this.port });
    }

    this.wss.on('connection', (ws) => {
      logger.log(`[WebSocket] New connection attempt`);
      
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

    logger.log(`[WebSocket] Server started on port ${this.port}`);
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

