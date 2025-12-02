/**
 * WebSocket Integration Tests
 * Tests WebSocket server functionality, authentication, and event broadcasting
 */

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const WebSocketServer = require('../websocket/server');
const logger = require('../utils/logger');

// Mock logger to reduce noise
jest.mock('../utils/logger', () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

describe('WebSocket Server', () => {
  let wsServer;
  let wss;
  const WS_PORT = 8765;
  const JWT_SECRET = 'test-secret';
  const TEST_USER_ID = 'user-123';
  const TEST_BULL_PEN_ID = 'room-456';

  beforeAll(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    wsServer = new WebSocketServer(WS_PORT);
    wsServer.start();
    wss = wsServer.wss;
  });

  afterAll(() => {
    wss.close();
  });

  describe('Connection and Authentication', () => {
    test('should accept WebSocket connection', (done) => {
      const ws = new WebSocket(`ws://localhost:${WS_PORT}`);
      
      ws.on('open', () => {
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        done();
      });

      ws.on('error', (err) => {
        done(err);
      });
    });

    test('should authenticate with valid JWT token', (done) => {
      const token = jwt.sign({ userId: TEST_USER_ID }, JWT_SECRET);
      const ws = new WebSocket(`ws://localhost:${WS_PORT}`);

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'auth', data: { token } }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'auth_success') {
          expect(message.data.userId).toBe(TEST_USER_ID);
          ws.close();
          done();
        }
      });

      ws.on('error', (err) => {
        done(err);
      });
    });

    test('should reject connection without authentication', (done) => {
      const ws = new WebSocket(`ws://localhost:${WS_PORT}`);
      let closed = false;

      ws.on('open', () => {
        // Don't send auth, wait for timeout
      });

      ws.on('close', (code, reason) => {
        if (!closed) {
          closed = true;
          expect(code).toBe(1008);
          done();
        }
      });

      ws.on('error', () => {
        // Expected
      });

      // Timeout after 6 seconds
      setTimeout(() => {
        if (!closed) {
          ws.close();
          done();
        }
      }, 6000);
    });

    test('should reject invalid JWT token', (done) => {
      const ws = new WebSocket(`ws://localhost:${WS_PORT}`);
      let closed = false;

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'auth', data: { token: 'invalid-token' } }));
      });

      ws.on('close', (code) => {
        if (!closed) {
          closed = true;
          expect(code).toBe(1008);
          done();
        }
      });

      ws.on('error', () => {
        // Expected
      });
    });
  });

  describe('Room Subscriptions', () => {
    test('should subscribe to room after authentication', (done) => {
      const token = jwt.sign({ userId: TEST_USER_ID }, JWT_SECRET);
      const ws = new WebSocket(`ws://localhost:${WS_PORT}`);

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'auth', data: { token } }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'auth_success') {
          ws.send(JSON.stringify({ 
            type: 'subscribe_room', 
            data: { bullPenId: TEST_BULL_PEN_ID } 
          }));
          
          // Verify subscription
          const subscribers = wsServer.getRoomManager().getSubscribers(TEST_BULL_PEN_ID);
          expect(subscribers.length).toBe(1);
          expect(subscribers[0].userId).toBe(TEST_USER_ID);
          
          ws.close();
          done();
        }
      });

      ws.on('error', (err) => {
        done(err);
      });
    });

    test('should unsubscribe from room', (done) => {
      const token = jwt.sign({ userId: TEST_USER_ID }, JWT_SECRET);
      const ws = new WebSocket(`ws://localhost:${WS_PORT}`);
      let subscribed = false;

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'auth', data: { token } }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'auth_success' && !subscribed) {
          subscribed = true;
          ws.send(JSON.stringify({ 
            type: 'subscribe_room', 
            data: { bullPenId: TEST_BULL_PEN_ID } 
          }));
          
          // Unsubscribe
          setTimeout(() => {
            ws.send(JSON.stringify({ 
              type: 'unsubscribe_room', 
              data: { bullPenId: TEST_BULL_PEN_ID } 
            }));
            
            const subscribers = wsServer.getRoomManager().getSubscribers(TEST_BULL_PEN_ID);
            expect(subscribers.length).toBe(0);
            
            ws.close();
            done();
          }, 100);
        }
      });

      ws.on('error', (err) => {
        done(err);
      });
    });
  });

  describe('Broadcasting', () => {
    test('should broadcast message to room subscribers', (done) => {
      const token = jwt.sign({ userId: TEST_USER_ID }, JWT_SECRET);
      const ws = new WebSocket(`ws://localhost:${WS_PORT}`);
      let subscribed = false;

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'auth', data: { token } }));
      });

      ws.on('message', (data) => {
        const message = JSON.parse(data);
        
        if (message.type === 'auth_success' && !subscribed) {
          subscribed = true;
          ws.send(JSON.stringify({ 
            type: 'subscribe_room', 
            data: { bullPenId: TEST_BULL_PEN_ID } 
          }));
          
          // Broadcast message
          setTimeout(() => {
            wsServer.broadcastToRoom(TEST_BULL_PEN_ID, {
              type: 'test_event',
              data: { message: 'Hello' }
            });
          }, 100);
        } else if (message.type === 'test_event') {
          expect(message.data.message).toBe('Hello');
          ws.close();
          done();
        }
      });

      ws.on('error', (err) => {
        done(err);
      });
    });
  });

  describe('Room Manager', () => {
    test('should track room statistics', () => {
      const roomManager = wsServer.getRoomManager();
      const stats = roomManager.getStats();
      
      expect(stats).toHaveProperty('totalRooms');
      expect(stats).toHaveProperty('totalUsers');
      expect(stats).toHaveProperty('roomDetails');
      expect(Array.isArray(stats.roomDetails)).toBe(true);
    });
  });
});

