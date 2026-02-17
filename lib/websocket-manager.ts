export type MessageType = 'vote' | 'leaderboard-update' | 'live-alert' | 'notification' | 'subscription' | 'error';

export interface WebSocketMessage {
  type: MessageType;
  data: any;
  timestamp: string;
}

export type MessageHandler = (message: WebSocketMessage) => void;

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private handlers: Map<MessageType, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;

  constructor(url: string) {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('[WebSocket] Connected');
          this.reconnectAttempts = 0;
          this.isIntentionallyClosed = false;

          // Start ping to keep connection alive
          this.startPing();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Error parsing message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] Disconnected');
          this.stopPing();

          if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private scheduleReconnect() {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    console.log(`[WebSocket] Scheduling reconnect attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch((error) => {
        console.error('[WebSocket] Reconnect failed:', error);
      });
    }, delay);
  }

  private startPing() {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
      }
    }, 30000); // Ping every 30 seconds
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handleMessage(message: WebSocketMessage) {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error(`[WebSocket] Error in handler for ${message.type}:`, error);
        }
      });
    }
  }

  on(type: MessageType, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(type);
      if (handlers) {
        handlers.delete(handler);
      }
    };
  }

  off(type: MessageType, handler: MessageHandler) {
    const handlers = this.handlers.get(type);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  send(message: Omit<WebSocketMessage, 'timestamp'>) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          ...message,
          timestamp: new Date().toISOString(),
        })
      );
    } else {
      console.warn('[WebSocket] Not connected, cannot send message');
    }
  }

  disconnect() {
    this.isIntentionallyClosed = true;
    this.stopPing();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  getStatus(): 'connecting' | 'connected' | 'disconnected' {
    if (!this.ws) return 'disconnected';
    if (this.ws.readyState === WebSocket.OPEN) return 'connected';
    if (this.ws.readyState === WebSocket.CONNECTING) return 'connecting';
    return 'disconnected';
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export function getWebSocketManager(url?: string): WebSocketManager {
  if (!wsManager && url) {
    wsManager = new WebSocketManager(url);
  }
  return wsManager!;
}
