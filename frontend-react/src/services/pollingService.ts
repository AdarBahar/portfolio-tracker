/**
 * Polling Service for Trade Room Updates
 * Fallback when WebSocket is not available
 * Fetches updates from backend at regular intervals
 */

import { apiClient } from '@/lib/api';
import axios from 'axios';

type EventCallback = (data: any) => void;
type ConnectionCallback = (connected: boolean) => void;

interface EventListeners {
  [key: string]: EventCallback[];
}

interface RoomUpdate {
  type: string;
  data: any;
  timestamp: string;
}

class PollingService {
  private eventListeners: EventListeners = {};
  private connectionListeners: ConnectionCallback[] = [];
  private pollingIntervals: Map<number, ReturnType<typeof setInterval>> = new Map();
  private lastUpdateTimestamps: Map<number, string> = new Map();
  private pollingInterval = 3000; // 3 seconds
  private activeRooms = new Set<number>();

  /**
   * Start polling for a specific room
   */
  startPolling(bullPenId: number): void {
    if (this.pollingIntervals.has(bullPenId)) {
      return; // Already polling this room
    }

    this.activeRooms.add(bullPenId);
    this.connectionListeners.forEach(cb => cb(true));

    const interval = setInterval(() => {
      this.fetchRoomUpdates(bullPenId);
    }, this.pollingInterval);

    this.pollingIntervals.set(bullPenId, interval);
    console.log(`[Polling] Started polling for room ${bullPenId}`);
  }

  /**
   * Stop polling for a specific room
   */
  stopPolling(bullPenId: number): void {
    const interval = this.pollingIntervals.get(bullPenId);
    if (interval) {
      clearInterval(interval);
      this.pollingIntervals.delete(bullPenId);
      this.activeRooms.delete(bullPenId);
      console.log(`[Polling] Stopped polling for room ${bullPenId}`);
    }

    if (this.pollingIntervals.size === 0) {
      this.connectionListeners.forEach(cb => cb(false));
    }
  }

  /**
   * Stop all polling
   */
  stopAllPolling(): void {
    this.pollingIntervals.forEach((interval) => clearInterval(interval));
    this.pollingIntervals.clear();
    this.lastUpdateTimestamps.clear();
    this.activeRooms.clear();
    this.connectionListeners.forEach(cb => cb(false));
    console.log('[Polling] Stopped all polling');
  }

  /**
   * Fetch room updates from backend
   */
  private async fetchRoomUpdates(bullPenId: number): Promise<void> {
    try {
      const lastTimestamp = this.lastUpdateTimestamps.get(bullPenId);
      const url = lastTimestamp
        ? `/bull-pens/${bullPenId}/updates?since=${encodeURIComponent(lastTimestamp)}`
        : `/bull-pens/${bullPenId}/updates`;

      const response = await apiClient.get<RoomUpdate[]>(url);
      const updates = response.data;

      if (updates && updates.length > 0) {
        // Update the last timestamp
        const latestTimestamp = updates[updates.length - 1].timestamp;
        this.lastUpdateTimestamps.set(bullPenId, latestTimestamp);

        // Emit events for each update
        updates.forEach(update => {
          this.emitEvent(update.type, update.data);
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        console.warn(`[Polling] Failed to fetch updates for room ${bullPenId}:`, error);
      }
    }
  }

  /**
   * Emit event to listeners
   */
  private emitEvent(type: string, data: any): void {
    if (this.eventListeners[type]) {
      this.eventListeners[type].forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`[Polling] Error in event listener for ${type}:`, err);
        }
      });
    }
  }

  /**
   * Subscribe to events
   */
  on(type: string, callback: EventCallback): () => void {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }

    this.eventListeners[type].push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.eventListeners[type].indexOf(callback);
      if (index > -1) {
        this.eventListeners[type].splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to connection changes
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionListeners.push(callback);

    return () => {
      const index = this.connectionListeners.indexOf(callback);
      if (index > -1) {
        this.connectionListeners.splice(index, 1);
      }
    };
  }

  /**
   * Check if polling is active
   */
  isPolling(): boolean {
    return this.pollingIntervals.size > 0;
  }

  /**
   * Get polling status
   */
  getStatus(): { isPolling: boolean; activeRooms: number[] } {
    return {
      isPolling: this.isPolling(),
      activeRooms: Array.from(this.pollingIntervals.keys()),
    };
  }
}

export const pollingService = new PollingService();

