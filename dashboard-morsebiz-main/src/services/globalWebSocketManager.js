import { io } from 'socket.io-client';
import config from '@/config/config';
import Cookies from 'js-cookie';
import { toast } from 'sonner';

class GlobalWebSocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.eventListeners = new Map();
    this.subscriptions = new Set();
    this.connectionPromise = null;
  }

  // Initialize and connect to WebSocket
  async connect() {
    if (this.isConnected || this.isConnecting) {

      return this.connectionPromise || Promise.resolve(this.socket);
    }

    this.connectionPromise = this._createConnection();
    return this.connectionPromise;
  }

  // Create WebSocket connection
  async _createConnection() {
    try {
      const token = Cookies.get('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      this.isConnecting = true;

      this.socket = io(config.WEBSOCKET_URL, {
        auth: {
          token: token
        },
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionDelay: this.reconnectDelay,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: this.maxReconnectAttempts,
        timeout: 20000,
        path: '/socket.io',
        secure: true,
        withCredentials: true,
        forceNew: true,
        query: { token: token }
      });

      await this._setupEventHandlers();
      await this._waitForConnection();


      return this.socket;

    } catch (error) {

      this.isConnecting = false;
      this.connectionPromise = null;
      throw error;
    }
  }

  // Setup event handlers
  _setupEventHandlers() {
    return new Promise((resolve, reject) => {
      // Connection success
      this.socket.on('connect', () => {

        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.connectionPromise = null;
        resolve();
      });

      // Connection success confirmation
      this.socket.on('connection:success', (data) => {
        // Silent connection - no toast notification
      });

      // Connection error
      this.socket.on('connect_error', (error) => {

        this.isConnecting = false;
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          // Silent error - no toast notification
          reject(error);
        }
      });

      // Disconnection
      this.socket.on('disconnect', (reason) => {

        this.isConnected = false;
        this.isConnecting = false;
        // Silent disconnect - no toast notification
      });

      // Reconnection
      this.socket.on('reconnect', () => {
      
        this.isConnected = true;
        this.reconnectAttempts = 0;
        // Silent reconnection - no toast notification
      });

      // Pong response
      this.socket.on('pong', (data) => {

      });

      // Room joined/left confirmations
      this.socket.on('room:joined', (data) => {

      });

      this.socket.on('room:left', (data) => {

      });

      // System notifications
      this.socket.on('system:alert', (data) => {
        const { message, level = 'info' } = data;
        
        switch (level) {
          case 'error':
            toast.error(message);
            break;
          case 'warning':
            toast.warning(message);
            break;
          case 'success':
            toast.success(message);
            break;
          default:
            toast.info(message);
        }
      });

      this.socket.on('system:shutdown', (data) => {
        toast.warning(data.message || 'Server maintenance in progress');
      });

      // User notifications
      this.socket.on('user:update', (data) => {

        // Handle user profile updates
      });

      // Set connection timeout
      setTimeout(() => {
        if (!this.isConnected) {
          reject(new Error('Connection timeout'));
        }
      }, 20000);
    });
  }

  // Wait for connection to be established
  _waitForConnection() {
    return new Promise((resolve) => {
      if (this.isConnected) {
        resolve();
      } else {
        this.socket.once('connect', () => {
          resolve();
        });
      }
    });
  }

  // Subscribe to specific events
  subscribe(eventName, callback) {
    if (!this.socket) {
      return;
    }

    // Store listener for cleanup
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, new Set());
    }
    this.eventListeners.get(eventName).add(callback);

    // Add socket listener
    this.socket.on(eventName, callback);
    this.subscriptions.add(eventName);
  }

  // Unsubscribe from specific events
  unsubscribe(eventName, callback = null) {
    if (!this.socket) return;

    if (callback) {
      // Remove specific callback
      this.socket.off(eventName, callback);
      const listeners = this.eventListeners.get(eventName);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.eventListeners.delete(eventName);
          this.subscriptions.delete(eventName);
        }
      }
    } else {
      // Remove all callbacks for this event
      this.socket.off(eventName);
      this.eventListeners.delete(eventName);
      this.subscriptions.delete(eventName);
    }


  }

  // Join a room
  joinRoom(roomName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join-room', roomName);

    }
  }

  // Leave a room
  leaveRoom(roomName) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave-room', roomName);

    }
  }

  // Send ping
  ping() {
    if (this.socket && this.isConnected) {
      this.socket.emit('ping');
    }
  }

  // Import event subscriptions
  subscribeToImportEvents(logId, callbacks = {}) {
    // Subscribe to import:queued event
    this.subscribe('import:queued', (data) => {

      if (data.logId === logId && callbacks.onQueued) {
        callbacks.onQueued(data);
      }
    });

    // Subscribe to import:progress event
    this.subscribe('import:progress', (data) => {

      if (data.logId === logId && callbacks.onProgress) {
        callbacks.onProgress(data);
      }
    });

    // Subscribe to import:complete event
    this.subscribe('import:complete', (data) => {

      if (data.logId === logId && callbacks.onComplete) {
        callbacks.onComplete(data);
      }
    });

    // Subscribe to import:error event
    this.subscribe('import:error', (data) => {

      if (data.logId === logId && callbacks.onError) {
        callbacks.onError(data);
      }
    });


  }

  // Translation event subscriptions
  subscribeToTranslationEvents(logId, callbacks = {}) {
    // Subscribe to translation:queued event
    this.subscribe('translation:queued', (data) => {
      if (data.logId === logId && callbacks.onQueued) {
        callbacks.onQueued(data);
      }
    });

    // Subscribe to translation:progress event
    this.subscribe('translation:progress', (data) => {
      if (data.logId === logId && callbacks.onProgress) {
        callbacks.onProgress(data);
      }
    });

    // Subscribe to translation:complete event
    this.subscribe('translation:complete', (data) => {
      if (data.logId === logId && callbacks.onComplete) {
        callbacks.onComplete(data);
      }
    });

    // Subscribe to translation:error event
    this.subscribe('translation:error', (data) => {
      if (data.logId === logId && callbacks.onError) {
        callbacks.onError(data);
      }
    });
  }

  // Queue event subscriptions
  subscribeToQueueEvents(callbacks = {}) {
    this.subscribe('queue:update', (data) => {
      if (callbacks.onQueueUpdate) {
        callbacks.onQueueUpdate(data);
      }
    });


  }

  // Admin event subscriptions
  subscribeToAdminEvents(callbacks = {}) {
    this.joinRoom('admin');

    this.subscribe('admin:import-queued', (data) => {
      if (callbacks.onQueued) {
        callbacks.onQueued(data);
      }
    });

    this.subscribe('admin:import-complete', (data) => {
      if (callbacks.onImportComplete) {
        callbacks.onImportComplete(data);
      }
    });

    

    this.subscribe('admin:user-update', (data) => {
      if (callbacks.onUserUpdate) {
        callbacks.onUserUpdate(data);
      }
    });


  }

  // Clean up all subscriptions
  cleanup() {
    // Remove all event listeners
    this.eventListeners.forEach((callbacks, eventName) => {
      this.socket?.off(eventName);
    });
    
    this.eventListeners.clear();
    this.subscriptions.clear();
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.socket) {
      this.cleanup();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      isConnecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
      socketId: this.socket?.id || null,
      subscriptions: Array.from(this.subscriptions)
    };
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }

  // Check if connected
  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

// Export singleton instance
const globalWebSocketManager = new GlobalWebSocketManager();
export default globalWebSocketManager;