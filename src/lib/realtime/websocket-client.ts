/**
 * Real-time WebSocket Client for İ-EP.APP
 * Provides real-time messaging functionality for parent-teacher communication
 */

import React from 'react';
import { useAuth } from '@/lib/auth/auth-context';

export interface RealtimeMessage {
  id: string;
  type: 'new_message' | 'message_read' | 'user_typing' | 'thread_update';
  senderId: string;
  receiverId: string;
  threadId: string;
  content?: string;
  timestamp: string;
  metadata?: {
    senderName?: string;
    senderRole?: string;
    priority?: string;
  };
}

export interface WebSocketOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private currentReconnectAttempts: number = 0;
  private debug: boolean;
  private listeners: Map<string, ((message: RealtimeMessage) => void)[]> = new Map();
  private connectionListeners: ((status: 'connected' | 'disconnected' | 'error') => void)[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(options: WebSocketOptions = {}) {
    this.url = options.url || this.getWebSocketUrl();
    this.reconnectInterval = options.reconnectInterval || 3000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.debug = options.debug || false;
  }

  private getWebSocketUrl(): string {
    if (typeof window === 'undefined') return '';
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/ws`;
  }

  public connect(userId: string, tenantId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.log('WebSocket already connected');
      return;
    }

    try {
      const wsUrl = `${this.url}?userId=${userId}&tenantId=${tenantId}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.log('WebSocket connected');
        this.currentReconnectAttempts = 0;
        this.notifyConnectionListeners('connected');
        
        // Send authentication message
        this.send({
          type: 'auth',
          userId,
          tenantId,
          timestamp: new Date().toISOString()
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const message: RealtimeMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          this.log('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        this.log('WebSocket disconnected');
        this.notifyConnectionListeners('disconnected');
        this.attemptReconnect(userId, tenantId);
      };

      this.ws.onerror = (error) => {
        this.log('WebSocket error:', error);
        this.notifyConnectionListeners('error');
      };

    } catch (error) {
      this.log('Error creating WebSocket connection:', error);
      this.notifyConnectionListeners('error');
    }
  }

  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.currentReconnectAttempts = 0;
  }

  private attemptReconnect(userId: string, tenantId: string): void {
    if (this.currentReconnectAttempts >= this.maxReconnectAttempts) {
      this.log('Max reconnection attempts reached');
      return;
    }

    this.currentReconnectAttempts++;
    this.log(`Attempting to reconnect (${this.currentReconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect(userId, tenantId);
    }, this.reconnectInterval);
  }

  public send(data: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.log('WebSocket not connected, cannot send message');
    }
  }

  public sendMessage(threadId: string, receiverId: string, content: string, priority: string = 'normal'): void {
    this.send({
      type: 'send_message',
      threadId,
      receiverId,
      content,
      priority,
      timestamp: new Date().toISOString()
    });
  }

  public markAsRead(messageIds: string[], threadId: string): void {
    this.send({
      type: 'mark_read',
      messageIds,
      threadId,
      timestamp: new Date().toISOString()
    });
  }

  public sendTyping(threadId: string, receiverId: string): void {
    this.send({
      type: 'typing',
      threadId,
      receiverId,
      timestamp: new Date().toISOString()
    });
  }

  private handleMessage(message: RealtimeMessage): void {
    this.log('Received message:', message);
    
    const typeListeners = this.listeners.get(message.type) || [];
    const allListeners = this.listeners.get('*') || [];
    
    [...typeListeners, ...allListeners].forEach(listener => {
      try {
        listener(message);
      } catch (error) {
        this.log('Error in message listener:', error);
      }
    });
  }

  public on(type: string, listener: (message: RealtimeMessage) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, []);
    }
    this.listeners.get(type)!.push(listener);
  }

  public off(type: string, listener: (message: RealtimeMessage) => void): void {
    const typeListeners = this.listeners.get(type);
    if (typeListeners) {
      const index = typeListeners.indexOf(listener);
      if (index > -1) {
        typeListeners.splice(index, 1);
      }
    }
  }

  public onConnection(listener: (status: 'connected' | 'disconnected' | 'error') => void): void {
    this.connectionListeners.push(listener);
  }

  private notifyConnectionListeners(status: 'connected' | 'disconnected' | 'error'): void {
    this.connectionListeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        this.log('Error in connection listener:', error);
      }
    });
  }

  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  private log(...args: any[]): void {
    if (this.debug) {
      console.log('[WebSocketClient]', ...args);
    }
  }
}

// React Hook for WebSocket
export function useWebSocket() {
  const { user } = useAuth();
  const [client, setClient] = React.useState<WebSocketClient | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);

  React.useEffect(() => {
    if (!user?.id) return;

    const wsClient = new WebSocketClient({ debug: process.env.NODE_ENV === 'development' });
    
    wsClient.onConnection((status) => {
      setIsConnected(status === 'connected');
    });

    // Connect with user and tenant info
    const tenantId = 'demo-tenant'; // TODO: Get from auth context
    wsClient.connect(user.id, tenantId);
    
    setClient(wsClient);

    return () => {
      wsClient.disconnect();
    };
  }, [user?.id]);

  return {
    client,
    isConnected,
    sendMessage: client?.sendMessage.bind(client),
    markAsRead: client?.markAsRead.bind(client),
    sendTyping: client?.sendTyping.bind(client),
    on: client?.on.bind(client),
    off: client?.off.bind(client)
  };
}

// Singleton instance for global access
let globalWebSocketClient: WebSocketClient | null = null;

export function getGlobalWebSocketClient(): WebSocketClient {
  if (!globalWebSocketClient) {
    globalWebSocketClient = new WebSocketClient({ debug: process.env.NODE_ENV === 'development' });
  }
  return globalWebSocketClient;
}

export default WebSocketClient;