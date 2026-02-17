import { useEffect, useState, useCallback } from 'react';
import { getWebSocketManager, MessageType, WebSocketMessage } from '@/lib/websocket-manager';

interface UseWebSocketOptions {
  url?: string;
  autoConnect?: boolean;
  messageTypes?: MessageType[];
}

export function useWebSocket({
  url,
  autoConnect = true,
  messageTypes = [],
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    const manager = getWebSocketManager(url || process.env.NEXT_PUBLIC_WS_URL);

    // Only try to connect if we have a URL
    if (!url && !process.env.NEXT_PUBLIC_WS_URL) {
      console.warn('[useWebSocket] No WebSocket URL provided');
      return;
    }

    manager
      .connect()
      .then(() => {
        setIsConnected(true);
        setError(null);
      })
      .catch((err) => {
        console.error('[useWebSocket] Connection failed:', err);
        setError(err);
      });

    // Set up message listeners
    const unsubscribers: (() => void)[] = [];

    if (messageTypes.length > 0) {
      messageTypes.forEach((type) => {
        const unsubscribe = manager.on(type, (message) => {
          setMessages((prev) => [...prev, message].slice(-100)); // Keep last 100 messages
        });
        unsubscribers.push(unsubscribe);
      });
    }

    // Listen for connection status changes
    const checkConnection = setInterval(() => {
      setIsConnected(manager.isConnected());
    }, 5000);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
      clearInterval(checkConnection);
    };
  }, [autoConnect, url]);

  const send = useCallback((message: Omit<WebSocketMessage, 'timestamp'>) => {
    const manager = getWebSocketManager(url);
    manager.send(message);
  }, [url]);

  const subscribe = useCallback(
    (type: MessageType, handler: (message: WebSocketMessage) => void) => {
      const manager = getWebSocketManager(url);
      return manager.on(type, handler);
    },
    [url]
  );

  const unsubscribe = useCallback(
    (type: MessageType, handler: (message: WebSocketMessage) => void) => {
      const manager = getWebSocketManager(url);
      manager.off(type, handler);
    },
    [url]
  );

  return {
    isConnected,
    messages,
    error,
    send,
    subscribe,
    unsubscribe,
  };
}

// Hook for subscribing to specific message types
export function useWebSocketMessages(messageTypes: MessageType[], url?: string) {
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);

  useEffect(() => {
    const manager = getWebSocketManager(url);

    if (!manager.isConnected() && url) {
      manager
        .connect()
        .catch((err) => console.error('[useWebSocketMessages] Connection failed:', err));
    }

    const unsubscribers = messageTypes.map((type) =>
      manager.on(type, (message) => {
        setMessages((prev) => [...prev, message].slice(-50)); // Keep last 50 messages
      })
    );

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [messageTypes, url]);

  return messages;
}

// Hook for live voting updates
export function useLiveVotes(eventId?: string) {
  const messages = useWebSocketMessages(['vote'], undefined);

  const votes = messages
    .filter((m) => m.type === 'vote' && (!eventId || m.data.eventId === eventId))
    .map((m) => m.data);

  return votes;
}

// Hook for live alerts
export function useLiveAlerts() {
  const messages = useWebSocketMessages(['live-alert'], undefined);

  const alerts = messages
    .filter((m) => m.type === 'live-alert')
    .map((m) => m.data);

  return alerts;
}

// Hook for notifications
export function useWebSocketNotifications() {
  const messages = useWebSocketMessages(['notification'], undefined);

  const notifications = messages
    .filter((m) => m.type === 'notification')
    .map((m) => m.data);

  return notifications;
}
