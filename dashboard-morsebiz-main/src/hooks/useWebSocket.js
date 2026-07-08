import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import websocketClient from '@/services/websocketClient';
import { toast } from 'sonner';

// Hook for WebSocket connection management
export const useWebSocket = () => {
  const { user } = useSelector((state) => state.auth);
  const [connectionStatus, setConnectionStatus] = useState({
    isConnected: false,
    reconnectAttempts: 0,
    socketId: null
  });

  useEffect(() => {
    if (user) {
      // Connect when user is authenticated
      websocketClient.connect();
      
      // Update connection status periodically
      const statusInterval = setInterval(() => {
        setConnectionStatus(websocketClient.getConnectionStatus());
      }, 1000);

      return () => {
        clearInterval(statusInterval);
      };
    }

    return () => {
      // Disconnect when user logs out
      websocketClient.disconnect();
    };
  }, [user]);

  return {
    connectionStatus,
    socket: websocketClient.getSocket(),
    connect: () => websocketClient.connect(),
    disconnect: () => websocketClient.disconnect(),
    ping: () => websocketClient.ping()
  };
};

// Hook for import real-time updates
export const useImportWebSocket = (logId, onDataUpdate = null) => {
  const socketRef = useRef(null);
  const [importStatus, setImportStatus] = useState({
    status: 'idle',
    progress: 0,
    message: '',
    lastUpdate: null
  });

  useEffect(() => {
    if (!logId) return;

    // Connect to WebSocket
    socketRef.current = websocketClient.connect();
    
    if (socketRef.current) {
      // Subscribe to import events
      websocketClient.subscribeToImportEvents(logId, {
        onProgress: (data) => {
          console.log('Import progress:', data);
          setImportStatus({
            status: 'processing',
            progress: data.progress || 0,
            message: data.message || 'Processing...',
            lastUpdate: new Date(data.timestamp)
          });
          
          if (onDataUpdate) {
            onDataUpdate(data);
          }
        },
        
        onComplete: (data) => {
          console.log('Import completed:', data);
          setImportStatus({
            status: 'completed',
            progress: 100,
            message: data.message || 'Import completed successfully!',
            lastUpdate: new Date(data.timestamp)
          });
          
          toast.success(data.message || 'Import completed successfully!');
          
          if (onDataUpdate) {
            onDataUpdate(data);
          }
        },
        
        onError: (data) => {
          console.error('Import error:', data);
          setImportStatus({
            status: 'error',
            progress: 0,
            message: data.error || 'Import failed',
            lastUpdate: new Date(data.timestamp)
          });
          
          toast.error(data.error || 'Import failed');
          
          if (onDataUpdate) {
            onDataUpdate(data);
          }
        }
      });
    }

    return () => {
      // Cleanup
      websocketClient.unsubscribeFromEvents();
    };
  }, [logId, onDataUpdate]);

  return importStatus;
};

// Hook for translation real-time updates
export const useTranslationWebSocket = (logId, onDataUpdate = null) => {
  const socketRef = useRef(null);
  const [translationStatus, setTranslationStatus] = useState({
    status: 'idle',
    progress: 0,
    message: '',
    lastUpdate: null
  });

  useEffect(() => {
    if (!logId) return;

    // Connect to WebSocket
    socketRef.current = websocketClient.connect();
    
    if (socketRef.current) {
      // Subscribe to translation events
      websocketClient.subscribeToTranslationEvents(logId, {
        onProgress: (data) => {
          console.log('Translation progress:', data);
          setTranslationStatus({
            status: 'processing',
            progress: data.progress || 0,
            message: data.message || 'Translating...',
            lastUpdate: new Date(data.timestamp)
          });
          
          if (onDataUpdate) {
            onDataUpdate(data);
          }
        },
        
        onComplete: (data) => {
          console.log('Translation completed:', data);
          setTranslationStatus({
            status: 'completed',
            progress: 100,
            message: data.message || 'Translation completed successfully!',
            lastUpdate: new Date(data.timestamp)
          });
          
          toast.success(data.message || 'Translation completed successfully!');
          
          if (onDataUpdate) {
            onDataUpdate(data);
          }
        },
        
        onError: (data) => {
          console.error('Translation error:', data);
          setTranslationStatus({
            status: 'error',
            progress: 0,
            message: data.error || 'Translation failed',
            lastUpdate: new Date(data.timestamp)
          });
          
          toast.error(data.error || 'Translation failed');
          
          if (onDataUpdate) {
            onDataUpdate(data);
          }
        }
      });
    }

    return () => {
      // Cleanup
      websocketClient.unsubscribeFromEvents();
    };
  }, [logId, onDataUpdate]);

  return translationStatus;
};