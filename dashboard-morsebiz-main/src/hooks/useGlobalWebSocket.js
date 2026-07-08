import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import globalWebSocketManager from '@/services/globalWebSocketManager';

// Global WebSocket connection hook - use this in app layout or main component
export const useGlobalWebSocket = () => {
  const { user } = useSelector((state) => state.auth);
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    socketId: null
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    let statusInterval;

    if (user) {
      // Connect when user is authenticated
      const connectWebSocket = async () => {
        try {
          setError(null);
          await globalWebSocketManager.connect();
          
          // Update connection status periodically
          statusInterval = setInterval(() => {
            setConnectionStatus(globalWebSocketManager.getStatus());
          }, 1000);
          
        } catch (err) {
          setError(err.message);
          console.error('Global WebSocket connection failed:', err);
        }
      };

      connectWebSocket();
    } else {
      // Disconnect when user logs out
      globalWebSocketManager.disconnect();
      setConnectionStatus({
        isConnected: false,
        isConnecting: false,
        reconnectAttempts: 0,
        socketId: null
      });
    }

    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
      
      // Don't disconnect here, let it persist across route changes
      // globalWebSocketManager.disconnect();
    };
  }, [user]);

  // Cleanup on app unmount
  useEffect(() => {
    return () => {
      globalWebSocketManager.disconnect();
    };
  }, []);

  return {
    connectionStatus,
    error,
    isConnected: connectionStatus.isConnected,
    socket: globalWebSocketManager.getSocket(),
    manager: globalWebSocketManager
  };
};

// Hook for import real-time updates
export const useImportWebSocket = (logId, onDataUpdate = null) => {
  const [importStatus, setImportStatus] = useState({
    status: 'idle',
    progress: 0,
    message: '',
    lastUpdate: null,
    jobId: null
  });
  
  const callbackRef = useRef(onDataUpdate);
  callbackRef.current = onDataUpdate;

  useEffect(() => {
    if (!logId || !globalWebSocketManager.isSocketConnected()) return;

    const callbacks = {
      onProgress: (data) => {
        console.log('📦 Import progress:', data);
        const newStatus = {
          status: 'processing',
          progress: data.progress || 0,
          message: data.message || 'Processing...',
          lastUpdate: new Date(data.timestamp),
          jobId: data.jobId
        };
        setImportStatus(newStatus);
        
        if (callbackRef.current) {
          callbackRef.current(data);
        }
      },
      
      onComplete: (data) => {
        console.log('✅ Import completed:', data);
        const newStatus = {
          status: 'completed',
          progress: 100,
          message: data.message || 'Import completed successfully!',
          lastUpdate: new Date(data.timestamp),
          jobId: data.jobId
        };
        setImportStatus(newStatus);
        
        if (callbackRef.current) {
          callbackRef.current(data);
        }
      },
      
      onError: (data) => {
        console.error('❌ Import error:', data);
        const newStatus = {
          status: 'error',
          progress: 0,
          message: data.error || 'Import failed',
          lastUpdate: new Date(data.timestamp),
          jobId: data.jobId
        };
        setImportStatus(newStatus);
        
        if (callbackRef.current) {
          callbackRef.current(data);
        }
      }
    };

    globalWebSocketManager.subscribeToImportEvents(logId, callbacks);

    return () => {
      // Cleanup specific to this logId
      globalWebSocketManager.unsubscribe('import:progress');
      globalWebSocketManager.unsubscribe('import:complete');
      globalWebSocketManager.unsubscribe('import:error');
    };
  }, [logId]);

  return importStatus;
};

// Hook for translation real-time updates
export const useTranslationWebSocket = (logId, onDataUpdate = null) => {
  const [translationStatus, setTranslationStatus] = useState({
    status: 'idle',
    progress: 0,
    message: '',
    lastUpdate: null,
    jobId: null,
    aiEnabled: false
  });
  
  const callbackRef = useRef(onDataUpdate);
  callbackRef.current = onDataUpdate;

  useEffect(() => {
    if (!logId || !globalWebSocketManager.isSocketConnected()) return;

    const callbacks = {
      onProgress: (data) => {
        console.log('🌐 Translation progress:', data);
        const newStatus = {
          status: 'processing',
          progress: data.progress || 0,
          message: data.message || 'Translating...',
          lastUpdate: new Date(data.timestamp),
          jobId: data.jobId,
          aiEnabled: data.aiEnabled || false
        };
        setTranslationStatus(newStatus);
        
        if (callbackRef.current) {
          callbackRef.current(data);
        }
      },
      
      onComplete: (data) => {
        console.log('✅ Translation completed:', data);
        const newStatus = {
          status: 'completed',
          progress: 100,
          message: data.message || 'Translation completed successfully!',
          lastUpdate: new Date(data.timestamp),
          jobId: data.jobId,
          aiEnabled: data.aiEnabled || false
        };
        setTranslationStatus(newStatus);
        
        if (callbackRef.current) {
          callbackRef.current(data);
        }
      },
      
      onError: (data) => {
        console.error('❌ Translation error:', data);
        const newStatus = {
          status: 'error',
          progress: 0,
          message: data.error || 'Translation failed',
          lastUpdate: new Date(data.timestamp),
          jobId: data.jobId,
          aiEnabled: data.aiEnabled || false
        };
        setTranslationStatus(newStatus);
        
        if (callbackRef.current) {
          callbackRef.current(data);
        }
      }
    };

    globalWebSocketManager.subscribeToTranslationEvents(logId, callbacks);

    return () => {
      // Cleanup specific to this logId
      globalWebSocketManager.unsubscribe('translation:progress');
      globalWebSocketManager.unsubscribe('translation:complete');
      globalWebSocketManager.unsubscribe('translation:error');
    };
  }, [logId]);

  return translationStatus;
};

// Hook for queue updates
export const useQueueWebSocket = (onQueueUpdate = null) => {
  const [queueStatus, setQueueStatus] = useState({
    totalJobs: 0,
    processingJobs: 0,
    completedJobs: 0,
    failedJobs: 0,
    lastUpdate: null
  });
  
  const callbackRef = useRef(onQueueUpdate);
  callbackRef.current = onQueueUpdate;

  useEffect(() => {
    if (!globalWebSocketManager.isSocketConnected()) return;

    const callbacks = {
      onQueueUpdate: (data) => {
        console.log('⏳ Queue update:', data);
        setQueueStatus({
          ...data,
          lastUpdate: new Date()
        });
        
        if (callbackRef.current) {
          callbackRef.current(data);
        }
      }
    };

    globalWebSocketManager.subscribeToQueueEvents(callbacks);

    return () => {
      globalWebSocketManager.unsubscribe('queue:update');
    };
  }, []);

  return queueStatus;
};

// Hook for admin events
export const useAdminWebSocket = (callbacks = {}) => {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!globalWebSocketManager.isSocketConnected()) return;

    const adminCallbacks = {
      onImportComplete: (data) => {
        if (callbacksRef.current.onImportComplete) {
          callbacksRef.current.onImportComplete(data);
        }
      },
      onTranslationComplete: (data) => {
        if (callbacksRef.current.onTranslationComplete) {
          callbacksRef.current.onTranslationComplete(data);
        }
      },
      onUserUpdate: (data) => {
        if (callbacksRef.current.onUserUpdate) {
          callbacksRef.current.onUserUpdate(data);
        }
      }
    };

    globalWebSocketManager.subscribeToAdminEvents(adminCallbacks);

    return () => {
      globalWebSocketManager.leaveRoom('admin');
      globalWebSocketManager.unsubscribe('admin:import-complete');
      globalWebSocketManager.unsubscribe('admin:translation-complete');
      globalWebSocketManager.unsubscribe('admin:user-update');
    };
  }, []);

  return {
    manager: globalWebSocketManager
  };
};