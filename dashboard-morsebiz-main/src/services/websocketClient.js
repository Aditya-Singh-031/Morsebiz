import { io } from 'socket.io-client';
import config from '@/config/config';
import Cookies from 'js-cookie';

class WebSocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.eventHandlers = new Map();
  }

  // Initialize WebSocket connection
  connect() {
    if (this.socket && this.isConnected) {
      console.log('WebSocket already connected');
      return this.socket;
    }

    try {
      const token = Cookies.get('adminToken');
      
      if (!token) {
        console.warn('No auth token found, cannot connect to WebSocket');
        return null;
      }

      this.socket = io(config.WEBSOCKET_URL, {
        auth: {
          token: token
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts
      });

      this.setupEventHandlers();
      console.log('🔌 Attempting WebSocket connection...');

      return this.socket;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      return null;
    }
  }

  // Setup default event handlers
  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('🔥 WebSocket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('pong', (data) => {
      console.log('🏓 Pong received:', data);
    });
  }

  // Subscribe to import events
  subscribeToImportEvents(logId, callbacks = {}) {
    if (!this.socket) return;

    // Import progress updates
    this.socket.on('import:progress', (data) => {
      if (data.logId === logId && callbacks.onProgress) {
        callbacks.onProgress(data);
      }
    });

    // Import completion
    this.socket.on('import:complete', (data) => {
      if (data.logId === logId && callbacks.onComplete) {
        callbacks.onComplete(data);
      }
    });

    // Import error
    this.socket.on('import:error', (data) => {
      if (data.logId === logId && callbacks.onError) {
        callbacks.onError(data);
      }
    });

    console.log(`📦 Subscribed to import events for logId: ${logId}`);
  }

  // Subscribe to translation events
  subscribeToTranslationEvents(logId, callbacks = {}) {
    if (!this.socket) return;

    // Translation progress updates
    this.socket.on('translation:progress', (data) => {
      if (data.logId === logId && callbacks.onProgress) {
        callbacks.onProgress(data);
      }
    });

    // Translation completion
    this.socket.on('translation:complete', (data) => {
      if (data.logId === logId && callbacks.onComplete) {
        callbacks.onComplete(data);
      }
    });

    // Translation error
    this.socket.on('translation:error', (data) => {
      if (data.logId === logId && callbacks.onError) {
        callbacks.onError(data);
      }
    });

    console.log(`🌐 Subscribed to translation events for logId: ${logId}`);
  }

  // Unsubscribe from events
  unsubscribeFromEvents() {
    if (!this.socket) return;

    this.socket.off('import:progress');
    this.socket.off('import:complete');
    this.socket.off('import:error');
    this.socket.off('translation:progress');
    this.socket.off('translation:complete');
    this.socket.off('translation:error');

    console.log('🔕 Unsubscribed from all events');
  }

  // Join specific room
  joinRoom(roomName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-room', roomName);
      console.log(`🚪 Joined room: ${roomName}`);
    }
  }

  // Leave specific room
  leaveRoom(roomName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-room', roomName);
      console.log(`👋 Left room: ${roomName}`);
    }
  }

  // Send ping to check connection
  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping');
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.unsubscribeFromEvents();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      console.log('🔌 WebSocket disconnected manually');
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id || null
    };
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
const websocketClient = new WebSocketClient();
export default websocketClient;