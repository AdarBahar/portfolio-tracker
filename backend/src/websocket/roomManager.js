/**
 * Room Manager for WebSocket Subscriptions
 * Manages room subscriptions and user tracking
 */

const logger = require('../utils/logger');

class RoomManager {
  constructor() {
    // Structure: { bullPenId: { userId: { ws, subscribedAt } } }
    this.rooms = new Map();
    // Structure: { userId: Set of bullPenIds }
    this.userRooms = new Map();
  }

  /**
   * Subscribe user to room
   */
  subscribe(bullPenId, userId, ws) {
    // Create room if doesn't exist
    if (!this.rooms.has(bullPenId)) {
      this.rooms.set(bullPenId, new Map());
    }

    const room = this.rooms.get(bullPenId);
    room.set(userId, {
      ws,
      subscribedAt: new Date(),
      lastHeartbeat: new Date()
    });

    // Track user's rooms
    if (!this.userRooms.has(userId)) {
      this.userRooms.set(userId, new Set());
    }
    this.userRooms.get(userId).add(bullPenId);

    logger.log(`[RoomManager] User ${userId} subscribed to room ${bullPenId} (total: ${room.size})`);
  }

  /**
   * Unsubscribe user from room
   */
  unsubscribe(bullPenId, userId) {
    const room = this.rooms.get(bullPenId);
    if (!room) return;

    room.delete(userId);

    // Clean up empty rooms
    if (room.size === 0) {
      this.rooms.delete(bullPenId);
    }

    // Remove from user's rooms
    const userRooms = this.userRooms.get(userId);
    if (userRooms) {
      userRooms.delete(bullPenId);
      if (userRooms.size === 0) {
        this.userRooms.delete(userId);
      }
    }

    logger.log(`[RoomManager] User ${userId} unsubscribed from room ${bullPenId}`);
  }

  /**
   * Unsubscribe user from all rooms
   */
  unsubscribeAll(userId) {
    const userRooms = this.userRooms.get(userId);
    if (!userRooms) return;

    userRooms.forEach(bullPenId => {
      const room = this.rooms.get(bullPenId);
      if (room) {
        room.delete(userId);
        if (room.size === 0) {
          this.rooms.delete(bullPenId);
        }
      }
    });

    this.userRooms.delete(userId);
    logger.log(`[RoomManager] User ${userId} unsubscribed from all rooms`);
  }

  /**
   * Get all subscribers for a room
   */
  getSubscribers(bullPenId) {
    const room = this.rooms.get(bullPenId);
    if (!room) return [];

    return Array.from(room.entries()).map(([userId, data]) => ({
      userId,
      ...data
    }));
  }

  /**
   * Get subscriber count for a room
   */
  getSubscriberCount(bullPenId) {
    const room = this.rooms.get(bullPenId);
    return room ? room.size : 0;
  }

  /**
   * Get all rooms user is subscribed to
   */
  getUserRooms(userId) {
    const userRooms = this.userRooms.get(userId);
    return userRooms ? Array.from(userRooms) : [];
  }

  /**
   * Check if user is subscribed to room
   */
  isSubscribed(bullPenId, userId) {
    const room = this.rooms.get(bullPenId);
    return room ? room.has(userId) : false;
  }

  /**
   * Get room statistics
   */
  getStats() {
    return {
      totalRooms: this.rooms.size,
      totalUsers: this.userRooms.size,
      roomDetails: Array.from(this.rooms.entries()).map(([bullPenId, room]) => ({
        bullPenId,
        subscribers: room.size
      }))
    };
  }

  /**
   * Update heartbeat for user in room
   */
  updateHeartbeat(bullPenId, userId) {
    const room = this.rooms.get(bullPenId);
    if (!room) return;

    const subscriber = room.get(userId);
    if (subscriber) {
      subscriber.lastHeartbeat = new Date();
    }
  }
}

module.exports = RoomManager;

