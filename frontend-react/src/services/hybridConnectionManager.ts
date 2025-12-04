/**
 * Hybrid Connection Manager
 * Tries WebSocket first, falls back to polling if it fails
 * Provides unified interface for both connection types
 */

import { websocketService } from './websocketService';
import { pollingService } from './pollingService';

type EventCallback = (data: any) => void;
type ConnectionCallback = (connected: boolean, mode: 'websocket' | 'polling') => void;

interface ConnectionStatus {
  connected: boolean;
  mode: 'websocket' | 'polling' | 'offline';
  wsConnected: boolean;
  pollingActive: boolean;
}

class HybridConnectionManager {
  private connectionStatus: ConnectionStatus = {
    connected: false,
    mode: 'offline',
    wsConnected: false,
    pollingActive: false,
  };
  private connectionListeners: ConnectionCallback[] = [];
  private wsConnectionUnsubscribe: (() => void) | null = null;
  private pollingConnectionUnsubscribe: (() => void) | null = null;
  private activeRooms: Set<number> = new Set();

  /**
   * Initialize hybrid connection
   * Tries WebSocket first, falls back to polling
   */
  async connect(token: string): Promise<'websocket' | 'polling'> {
    console.log('[HybridConnection] Attempting to connect...');

    try {
      // Try WebSocket first
      websocketService.setSuppressReconnect(false); // Allow reconnection attempts
      await websocketService.connect(token);
      this.updateConnectionStatus('websocket');
      console.log('[HybridConnection] Connected via WebSocket');
      return 'websocket';
    } catch (wsError) {
      // Suppress WebSocket reconnection attempts since we're using polling fallback
      websocketService.setSuppressReconnect(true);

      // Fall back to polling (silently, no error logging)
      this.updateConnectionStatus('polling');
      console.log('[HybridConnection] Connected via polling');
      return 'polling';
    }
  }

  /**
   * Disconnect from both WebSocket and polling
   */
  disconnect(): void {
    console.log('[HybridConnection] Disconnecting...');

    // Suppress WebSocket reconnection attempts
    websocketService.setSuppressReconnect(true);

    // Disconnect WebSocket
    if (this.wsConnectionUnsubscribe) {
      this.wsConnectionUnsubscribe();
      this.wsConnectionUnsubscribe = null;
    }
    websocketService.disconnect();

    // Stop polling
    if (this.pollingConnectionUnsubscribe) {
      this.pollingConnectionUnsubscribe();
      this.pollingConnectionUnsubscribe = null;
    }
    pollingService.stopAllPolling();

    this.activeRooms.clear();
    this.updateConnectionStatus('offline');
  }

  /**
   * Subscribe to a room for updates
   */
  subscribeToRoom(bullPenId: number): void {
    if (this.activeRooms.has(bullPenId)) {
      return; // Already subscribed
    }

    this.activeRooms.add(bullPenId);

    if (this.connectionStatus.mode === 'websocket') {
      websocketService.subscribeToRoom(bullPenId);
    } else if (this.connectionStatus.mode === 'polling') {
      pollingService.startPolling(bullPenId);
    }

    console.log(`[HybridConnection] Subscribed to room ${bullPenId} via ${this.connectionStatus.mode}`);
  }

  /**
   * Unsubscribe from a room
   */
  unsubscribeFromRoom(bullPenId: number): void {
    if (!this.activeRooms.has(bullPenId)) {
      return;
    }

    this.activeRooms.delete(bullPenId);

    if (this.connectionStatus.mode === 'websocket') {
      websocketService.unsubscribeFromRoom(bullPenId);
    } else if (this.connectionStatus.mode === 'polling') {
      pollingService.stopPolling(bullPenId);
    }

    console.log(`[HybridConnection] Unsubscribed from room ${bullPenId}`);
  }

  /**
   * Subscribe to events
   */
  on(type: string, callback: EventCallback): () => void {
    if (this.connectionStatus.mode === 'websocket') {
      return websocketService.on(type, callback);
    } else {
      return pollingService.on(type, callback);
    }
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
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectionStatus.connected;
  }

  /**
   * Get connection status
   */
  getStatus(): ConnectionStatus {
    return { ...this.connectionStatus };
  }

  /**
   * Update connection status and notify listeners
   */
  private updateConnectionStatus(mode: 'websocket' | 'polling' | 'offline'): void {
    this.connectionStatus = {
      connected: mode !== 'offline',
      mode,
      wsConnected: mode === 'websocket',
      pollingActive: mode === 'polling',
    };

    // Notify listeners
    this.connectionListeners.forEach(cb => {
      cb(this.connectionStatus.connected, mode as 'websocket' | 'polling');
    });

    // Subscribe to connection changes from underlying services
    if (mode === 'websocket' && !this.wsConnectionUnsubscribe) {
      this.wsConnectionUnsubscribe = websocketService.onConnectionChange((connected) => {
        if (!connected) {
          console.warn('[HybridConnection] WebSocket disconnected, switching to polling');
          this.switchToPolling();
        }
      });
    } else if (mode === 'polling' && !this.pollingConnectionUnsubscribe) {
      this.pollingConnectionUnsubscribe = pollingService.onConnectionChange((connected) => {
        if (!connected && this.activeRooms.size === 0) {
          this.updateConnectionStatus('offline');
        }
      });
    }
  }

  /**
   * Switch from WebSocket to polling
   */
  private switchToPolling(): void {
    console.log('[HybridConnection] Switching to polling mode');
    this.updateConnectionStatus('polling');

    // Restart polling for all active rooms
    this.activeRooms.forEach(roomId => {
      pollingService.startPolling(roomId);
    });
  }
}

export const hybridConnectionManager = new HybridConnectionManager();

