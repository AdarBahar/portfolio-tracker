/**
 * Production End-to-End Testing Suite
 * Tests WebSocket integration with Trade Room services
 */

const WebSocket = require('ws');
const http = require('http');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:4000';
const WS_URL = process.env.WS_URL || 'ws://localhost:4001';
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

describe('Production E2E Tests - WebSocket Integration', () => {
  let wsServer;
  let apiServer;
  let testToken;
  let testUserId = 'test-user-123';
  let testBullPenId = 'test-room-123';

  beforeAll(async () => {
    // Generate test JWT token
    testToken = jwt.sign(
      { userId: testUserId, email: 'test@example.com' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    logger.log('Test token generated:', testToken.substring(0, 20) + '...');
  });

  describe('WebSocket Connection', () => {
    test('should establish WebSocket connection', (done) => {
      const ws = new WebSocket(WS_URL);
      
      ws.on('open', () => {
        logger.log('✓ WebSocket connection established');
        expect(ws.readyState).toBe(WebSocket.OPEN);
        ws.close();
        done();
      });

      ws.on('error', (err) => {
        logger.error('✗ WebSocket connection failed:', err.message);
        done(err);
      });

      setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          done(new Error('Connection timeout'));
        }
      }, 5000);
    });

    test('should authenticate with JWT token', (done) => {
      const ws = new WebSocket(WS_URL);
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'auth',
          token: testToken
        }));
      });

      ws.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'auth_success') {
          logger.log('✓ JWT authentication successful');
          expect(msg.userId).toBe(testUserId);
          ws.close();
          done();
        }
      });

      ws.on('error', (err) => {
        logger.error('✗ Authentication failed:', err.message);
        done(err);
      });

      setTimeout(() => done(new Error('Auth timeout')), 5000);
    });

    test('should subscribe to room', (done) => {
      const ws = new WebSocket(WS_URL);
      let authenticated = false;
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'auth',
          token: testToken
        }));
      });

      ws.on('message', (data) => {
        const msg = JSON.parse(data);
        
        if (msg.type === 'auth_success' && !authenticated) {
          authenticated = true;
          ws.send(JSON.stringify({
            type: 'subscribe_room',
            bullPenId: testBullPenId
          }));
        }
        
        if (msg.type === 'subscribe_success') {
          logger.log('✓ Room subscription successful');
          expect(msg.bullPenId).toBe(testBullPenId);
          ws.close();
          done();
        }
      });

      ws.on('error', (err) => {
        logger.error('✗ Room subscription failed:', err.message);
        done(err);
      });

      setTimeout(() => done(new Error('Subscription timeout')), 5000);
    });
  });

  describe('WebSocket Message Broadcasting', () => {
    test('should broadcast order_executed event', (done) => {
      const ws = new WebSocket(WS_URL);
      let authenticated = false;
      let subscribed = false;
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'auth',
          token: testToken
        }));
      });

      ws.on('message', (data) => {
        const msg = JSON.parse(data);
        
        if (msg.type === 'auth_success' && !authenticated) {
          authenticated = true;
          ws.send(JSON.stringify({
            type: 'subscribe_room',
            bullPenId: testBullPenId
          }));
        }
        
        if (msg.type === 'subscribe_success' && !subscribed) {
          subscribed = true;
          logger.log('✓ Ready to receive broadcasts');
        }
        
        if (msg.type === 'order_executed') {
          logger.log('✓ Received order_executed broadcast:', msg.data);
          expect(msg.data.symbol).toBeDefined();
          expect(msg.data.quantity).toBeDefined();
          ws.close();
          done();
        }
      });

      ws.on('error', (err) => {
        logger.error('✗ Broadcast test failed:', err.message);
        done(err);
      });

      setTimeout(() => done(new Error('Broadcast timeout')), 10000);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid token gracefully', (done) => {
      const ws = new WebSocket(WS_URL);
      
      ws.on('open', () => {
        ws.send(JSON.stringify({
          type: 'auth',
          token: 'invalid-token'
        }));
      });

      ws.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'auth_error') {
          logger.log('✓ Invalid token handled correctly');
          ws.close();
          done();
        }
      });

      ws.on('error', (err) => {
        logger.error('✗ Error handling test failed:', err.message);
        done(err);
      });

      setTimeout(() => done(new Error('Error handling timeout')), 5000);
    });

    test('should handle connection loss gracefully', (done) => {
      const ws = new WebSocket(WS_URL);
      
      ws.on('open', () => {
        logger.log('✓ Connection established, closing...');
        ws.close();
      });

      ws.on('close', () => {
        logger.log('✓ Connection closed gracefully');
        done();
      });

      ws.on('error', (err) => {
        logger.error('✗ Connection loss test failed:', err.message);
        done(err);
      });

      setTimeout(() => done(new Error('Connection loss timeout')), 5000);
    });
  });
});

