/**
 * WebSocket Service for Trade Room Real-time Updates
 * Handles connection, reconnection, and event management
 */

type EventCallback = (data: any) => void;
type ConnectionCallback = (connected: boolean) => void;

interface EventListeners {
  [key: string]: EventCallback[];
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private eventListeners: EventListeners = {};
  private connectionListeners: ConnectionCallback[] = [];
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isIntentionallyClosed = false;

  constructor() {
    this.url = this.getWebSocketUrl();
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${hostname}${port}`;
  }

  /**
   * Connect to WebSocket server
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.token = token;
        this.isIntentionallyClosed = false;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected');
          this.reconnectAttempts = 0;
          
          // Send authentication
          this.send('auth', { token });
          
          // Notify listeners
          this.connectionListeners.forEach(cb => cb(true));
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            const { type, data } = message;
            
            if (type && this.eventListeners[type]) {
              this.eventListeners[type].forEach(callback => callback(data));
            }
          } catch (err) {
            console.error('[WebSocket] Failed to parse message:', err);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          this.connectionListeners.forEach(cb => cb(false));
          
          if (!this.isIntentionallyClosed) {
            this.attemptReconnect();
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Send message to server
   */
  send(type: string, data: any = {}): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('[WebSocket] Not connected, cannot send message');
      return;
    }

    try {
      this.ws.send(JSON.stringify({ type, data }));
    } catch (err) {
      console.error('[WebSocket] Failed to send message:', err);
    }
  }

  /**
   * Subscribe to event
   */
  on(type: string, callback: EventCallback): () => void {
    if (!this.eventListeners[type]) {
      this.eventListeners[type] = [];
    }

    this.eventListeners[type].push(callback);

    // Return unsubscribe function
    return () => {
      this.eventListeners[type] = this.eventListeners[type].filter(cb => cb !== callback);
    };
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(callback: ConnectionCallback): () => void {
    this.connectionListeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[WebSocket] Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.token && !this.isIntentionallyClosed) {
        this.connect(this.token).catch(err => {
          console.error('[WebSocket] Reconnection failed:', err);
        });
      }
    }, delay);
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

