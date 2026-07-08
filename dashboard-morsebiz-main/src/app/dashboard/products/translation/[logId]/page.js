'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import {
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  FileText,
  Loader2,
  Database,
  Table as TableIcon,
  Clock,
  ArrowLeft,
  Languages,
  Bot,
  Activity
} from 'lucide-react';
import { buildApiUrl } from '@/config/api';
import Cookies from 'js-cookie';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import TranslationConfirmationDialog from '@/components/TranslationConfirmationDialog';
import globalWebSocketManager from '@/services/globalWebSocketManager';

export default function TranslationLogPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const logId = params.logId;

  const [loading, setLoading] = useState(true);
  const [translationLog, setTranslationLog] = useState(null);
  const [isAddingToQueue, setIsAddingToQueue] = useState(false);
  const [error, setError] = useState(null);
  const [progressLogs, setProgressLogs] = useState([]);
  const [currentProgress, setCurrentProgress] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Helper function to safely format timestamp
  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return 'Unknown time';
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid time';
      return date.toLocaleTimeString();
    } catch (error) {
      return 'Unknown time';
    }
  };

  // Subscribe to global WebSocket translation events
  useEffect(() => {
    if (logId && user) {
      // Subscribe to translation events for this logId using global WebSocket
      const callbacks = {
        onQueued: (data) => {
          // Update status immediately via WebSocket
          if (data.logId === logId) {
            setTranslationLog(prev => ({
              ...prev,
              processStatus: 'queued',
              jobId: data.jobId,
              queuePosition: data.queuePosition,
              estimatedWaitTime: data.estimatedWaitTime
            }));
            
            // Add to progress logs only if not just a position update
            setProgressLogs(prev => {
              const isPositionUpdate = prev.some(log => 
                log.type === 'queued' && log.data?.jobId === data.jobId
              );
              
              if (!isPositionUpdate || data.message?.includes('updated')) {
                return [...prev, {
                  id: `${Date.now()}-${Math.random()}`,
                  type: 'queued',
                  message: data.message || `Translation queued at position ${data.queuePosition}`,
                  timestamp: new Date(),
                  data: { 
                    queuePosition: data.queuePosition, 
                    jobId: data.jobId,
                    estimatedWaitTime: data.estimatedWaitTime 
                  }
                }];
              }
              return prev;
            });
            
            setLastUpdate(Date.now());
          }
        },
        onProgress: (data) => {
          // Update status immediately without API call (only if not completed)
          if (data.logId === logId && !isCompleted) {
            setTranslationLog(prev => ({
              ...prev,
              processStatus: 'processing',
              progress: data.progress,
              message: data.message,
              stats: data.stats
            }));
            
            // Update current progress
            setCurrentProgress({
              percentage: data.progress || 0,
              message: data.message,
              stats: data.stats
            });
            
            // Add to progress logs (prevent duplicates and don't add if completed)
            setProgressLogs(prev => {
              // Check if this exact message already exists
              const isDuplicate = prev.some(log => 
                log.message === data.message && 
                log.type === 'progress' &&
                Math.abs(new Date(log.timestamp).getTime() - new Date().getTime()) < 3000 // Within 3 seconds
              );
              
              if (!isDuplicate) {
                return [...prev, {
                  id: `${Date.now()}-${Math.random()}`,
                  type: 'progress',
                  message: data.message,
                  timestamp: new Date(),
                  data: { progress: data.progress, stats: data.stats }
                }];
              }
              return prev;
            });
          }
          
          setLastUpdate(Date.now());
        },
        onComplete: (data) => {
          // Update status immediately (only if not already completed)
          if (data.logId === logId && !isCompleted) {
            // Mark as completed to prevent further progress updates
            setIsCompleted(true);
            
            setTranslationLog(prev => ({
              ...prev,
              processStatus: 'completed',
              processingResults: data.results,
              completedAt: new Date()
            }));
            
            // Clear current progress
            setCurrentProgress(null);
            
            // Add final completion log and mark all progress as 100%
            setProgressLogs(prev => {
              // Mark all existing progress logs as 100% to show completed icons
              const updatedLogs = prev.map(log => {
                if (log.type === 'progress' && log.data) {
                  return {
                    ...log,
                    data: {
                      ...log.data,
                      progress: 100
                    }
                  };
                }
                return log;
              });
              
              // Check if completion log already exists to prevent duplicates
              const completionExists = updatedLogs.some(log => 
                log.type === 'success' && log.message.includes('Translation completed!')
              );
              
              if (!completionExists) {
                return [...updatedLogs, {
                  id: `${Date.now()}-${Math.random()}`,
                  type: 'success',
                  message: `Translation completed! ${data.results?.updatedProducts || 0} products translated successfully`,
                  timestamp: new Date(),
                  data: data.results
                }];
              }
              return updatedLogs; // Return updated logs even if completion log exists
            });
            
            setLoading(false);
            setLastUpdate(Date.now());
          }
        },
        onError: (error) => {
          // Update status immediately
          if (error.logId === logId) {
            const statusType = error.status === 'cancelled' ? 'cancelled' : 'failed';
            
            setTranslationLog(prev => ({
              ...prev,
              processStatus: statusType,
              error: error.message
            }));
            
            // Clear current progress and mark as completed
            setCurrentProgress(null);
            setIsCompleted(true);
            
            // Add error/cancellation log and mark all progress as 100%
            setProgressLogs(prev => {
              // Mark all existing progress logs as 100%
              const updatedLogs = prev.map(log => {
                if (log.type === 'progress' && log.data) {
                  return {
                    ...log,
                    data: {
                      ...log.data,
                      progress: 100
                    }
                  };
                }
                return log;
              });
              
              // Add final error/cancellation log (prevent duplicates)
              const errorExists = updatedLogs.some(log => 
                log.type === 'error' && (
                  log.message.includes('Translation cancelled:') || 
                  log.message.includes('Translation failed:')
                )
              );
              
              if (!errorExists) {
                return [...updatedLogs, {
                  id: `${Date.now()}-${Math.random()}`,
                  type: 'error',
                  message: statusType === 'cancelled' ? 
                    `Translation cancelled: ${error.message}` : 
                    `Translation failed: ${error.message}`,
                  timestamp: new Date(),
                  data: { error: error.error }
                }];
              }
              return updatedLogs;
            });
          }
          
          setLastUpdate(Date.now());
        }
      };

      globalWebSocketManager.subscribeToTranslationEvents(logId, callbacks);

      // Cleanup subscription on component unmount
      return () => {
        // Note: Global WebSocket manager handles cleanup automatically
      };
    }
  }, [logId, user]);

  // Auto refresh for processing/queued status - WebSocket handles real-time updates
  useEffect(() => {
    if (translationLog && (translationLog.processStatus === 'processing' || translationLog.processStatus === 'queued')) {
      // Just update lastUpdate timestamp to show activity
      const refreshInterval = setInterval(() => {
        setLastUpdate(Date.now());
      }, 5000); // Update timestamp every 5 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [translationLog?.processStatus]);

  // Fetch translation log data - Initial load only
  useEffect(() => {
    if (logId) {
      fetchTranslationLog(false, true); // Initial data fetch via API with isInitialLoad flag
    }
  }, [logId]);

  const fetchTranslationLog = async (isAutoRefresh = false, isInitialLoad = false) => {
    try {
      setLoading(isInitialLoad); // Only show loading on initial load
      if (!isAutoRefresh && !isInitialLoad) {
        setLoading(true);
      }
      
      const token = Cookies.get('adminToken');
      const response = await fetch(buildApiUrl(`/api/dashboard/product-translation/logs/${logId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch translation log');
      }

      const result = await response.json();
      if (result.success) {
        const prevStatus = translationLog?.processStatus;
        setTranslationLog(result.data);

        // Load progress logs from database if available
        if (result.data.progressLogs && Array.isArray(result.data.progressLogs)) {
          // Ensure timestamps are properly formatted Date objects and unique IDs
          const formattedLogs = result.data.progressLogs.map((log, index) => ({
            ...log,
            id: log.id || `db-${index}-${Date.now()}-${Math.random()}`, // Ensure unique ID
            timestamp: new Date(log.timestamp)
          }));
          setProgressLogs(formattedLogs);
          
          // Check if translation is completed to set completion state
          if (result.data.processStatus === 'completed') {
            setIsCompleted(true);
            setCurrentProgress(null);
          }
        } else {
          // Initialize empty progress logs if none exist
          setProgressLogs([]);
        }
        
        // Show toast when status changes
        if (isAutoRefresh && prevStatus && prevStatus !== result.data.processStatus) {
          if (result.data.processStatus === 'completed') {
            toast.success('Translation completed successfully!');
          } else if (result.data.processStatus === 'failed') {
            toast.error('Translation failed!');
          } else if (result.data.processStatus === 'processing') {
            toast.info('Translation processing started...');
          }
        }
        
      } else {
        throw new Error(result.message || 'Failed to fetch translation log');
      }
    } catch (error) {
      if (!isAutoRefresh) {
        setError(error.message);
        toast.error('Failed to load translation data');
      }
    } finally {
      if (!isAutoRefresh || isInitialLoad) {
        setLoading(false);
      }
    }
  };

  // Show confirmation dialog
  const handleTranslateClick = () => {
    // Check if translation is already completed
    if (translationLog.processStatus === 'completed') {
      toast.error('This translation has already been completed');
      return;
    }

    // Check if there are valid products to translate
    const validProductCount = translationLog.validProducts ? translationLog.validProducts.length : translationLog.validRows || 0;

    if (!translationLog || validProductCount === 0) {
      toast.error('No valid products found to add to queue');
      return;
    }

    setShowConfirmDialog(true);
  };

  // Handle adding to queue with AI option
  const handleConfirmTranslation = async (aiTranslationEnabled) => {
    setShowConfirmDialog(false);
    setIsAddingToQueue(true);

    try {
      const token = Cookies.get('adminToken');
      const response = await fetch(buildApiUrl('/api/dashboard/product-translation/final-translation'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          translationLogId: logId,
          aiTranslationEnabled 
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Show success message with product count and AI status
        const validProductCount = translationLog.validProducts ? translationLog.validProducts.length : translationLog.validRows || 0;
        const productCount = result.data?.totalProducts || validProductCount;
        const aiMessage = aiTranslationEnabled ? ' (with AI Translation)' : '';

        // Show job information if available
        if (result.data && result.data.jobId) {
          const jobId = result.data.jobId;
        }

        // Refresh the translation log data to get updated status
        await fetchTranslationLog();

      } else {
        throw new Error(result.message || 'Failed to add to queue');
      }
    } catch (error) {
      // Error handling without console logs
    } finally {
      setIsAddingToQueue(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading translation data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="px-0 space-y-6">
          {/* Sticky Header */}
          <div className="sticky top-16 left-0 lg:left-64 right-0 z-30 bg-background py-2">
            <div className="container mx-auto">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold truncate">
                  <span className="hidden sm:inline">Product Translation</span>
                  <span className="sm:hidden">Translation</span>
                </h1>
              </div>
            </div>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (!translationLog) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="px-0 space-y-6">
          {/* Sticky Header */}
          <div className="sticky top-16 left-0 lg:left-64 right-0 z-30 bg-background py-2">
            <div className="container mx-auto">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold truncate">
                  <span className="hidden sm:inline">Product Translation</span>
                  <span className="sm:hidden">Translation</span>
                </h1>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No translation data found for Log ID: {logId}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <RoleProtectedRoute allowedRoles={['super-admin', 'admin']}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="px-0 space-y-6">
          {/* Sticky Header */}
          <div className="sticky top-16 left-0 lg:left-64 right-0 z-30 bg-background py-2">
            <div className="container mx-auto">
              <div className="flex items-center justify-between gap-2 md:gap-4">
                {/* Left Section - Back Button and Title */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Back Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.back()}
                    className="h-8 w-8 p-0 hover:bg-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>

                  {/* Title with ID */}
                  <div className="flex flex-col gap-1">
                    <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold truncate">
                      <span className="hidden sm:inline">Product Translation</span>
                      <span className="sm:hidden">Translation</span>
                    </h1>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {logId}
                    </div>
                  </div>
                </div>

                {/* Right Section - Add to Queue Button or Status */}
                <div className="flex items-center gap-2">
                  {translationLog.processStatus === 'completed' ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Translation Completed</span>
                      <span className="sm:hidden">Done</span>
                    </div>
                  ) : translationLog.processStatus === 'processing' ? (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Processing Translation...</span>
                      <span className="sm:hidden">Processing...</span>
                    </div>
                  ) : translationLog.processStatus === 'failed' ? (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Translation Failed</span>
                      <span className="sm:hidden">Failed</span>
                    </div>
                  ) : (
                    ((translationLog.validProducts && translationLog.validProducts.length > 0) ||
                      (translationLog.validRows && translationLog.validRows > 0)) && (
                      <Button
                        onClick={handleTranslateClick}
                        disabled={isAddingToQueue}
                        className="flex items-center gap-2 text-xs sm:text-sm h-8"
                        size="sm"
                      >
                        {isAddingToQueue ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="hidden sm:inline">Adding to Queue...</span>
                            <span className="sm:hidden">Adding...</span>
                          </>
                        ) : (
                          <>
                            <Languages className="h-4 w-4" />
                            <span className="hidden sm:inline">Translate Data</span>
                            <span className="sm:hidden">Translate</span>
                          </>
                        )}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Translation Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5" />
                Translation Summary
              </CardTitle>
              <CardDescription>
                File: {translationLog.fileName} • Uploaded by: {translationLog.uploadedBy} •
                Date: {new Date(translationLog.uploadedAt).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {translationLog.totalRows || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Rows</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {translationLog.processStatus === 'completed' ?
                      (translationLog.translatedCount ||
                        (translationLog.validRows ? (translationLog.validRows - (translationLog.duplicateRows || 0)) : 0) ||
                        (translationLog.validProducts ? translationLog.validProducts.length : 0) ||
                        0) :
                      (translationLog.validRows || (translationLog.validProducts ? translationLog.validProducts.length : 0))
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {translationLog.processStatus === 'completed' ? 'Translated' : 'Valid Rows'}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {translationLog.invalidRows || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Invalid Rows</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {translationLog.duplicateRows || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Duplicates</div>
                </div>
              </div>

              {/* Languages */}
              {translationLog.languages && translationLog.languages.length > 0 && (
                <div className="mt-4 flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Languages:</span>
                  {translationLog.languages.map((lang, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {lang.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Process Status */}
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm font-medium">Status:</span>
                <Badge variant={
                  translationLog.processStatus === 'completed' ? 'default' :
                    translationLog.processStatus === 'validated' ? 'secondary' : 'destructive'
                }>
                  {translationLog.processStatus === 'completed' ? 'Translated' :
                    translationLog.processStatus === 'validated' ? 'Ready to Translate' :
                      translationLog.processStatus}
                </Badge>
                {translationLog.processStatus === 'completed' && translationLog.completedAt && (
                  <span className="text-sm text-muted-foreground ml-2">
                    • Translated on {new Date(translationLog.completedAt).toLocaleString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Translation Progress Section */}
          {(translationLog.processStatus === 'queued' || translationLog.processStatus === 'processing' || progressLogs.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Translation Progress
                </CardTitle>
                <CardDescription>
                  Real-time translation progress and status updates
                </CardDescription>
              </CardHeader>
              <CardContent>
               
                {/* Current Progress Bar */}
                {currentProgress && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {currentProgress.message}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {currentProgress.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${currentProgress.percentage}%` }}
                      ></div>
                    </div>
                    {currentProgress.stats && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        {currentProgress.stats.translated && (
                          <span>Translated: {currentProgress.stats.translated} | </span>
                        )}
                        {currentProgress.stats.total && (
                          <span>Total: {currentProgress.stats.total} | </span>
                        )}
                        {currentProgress.stats.remaining && (
                          <span>Remaining: {currentProgress.stats.remaining}</span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Progress Log */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {progressLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                      <div className="flex-shrink-0 mt-0.5">
                        {log.type === 'queued' && (
                          isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Clock className="h-4 w-4 text-blue-600" />
                          )
                        )}
                        {log.type === 'progress' && (
                          log.data?.progress === 100 ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                          )
                        )}
                        {log.type === 'success' && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {log.type === 'error' && (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{log.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatTimestamp(log.timestamp)}
                        </p>
                        {log.data && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {log.data.queuePosition && (
                              <span>Queue Position: {log.data.queuePosition}</span>
                            )}
                            {log.data.estimatedWaitTime && (
                              <span> | Est. Wait: {log.data.estimatedWaitTime}</span>
                            )}
                            {log.data.progress && (
                              <span>Progress: {log.data.progress}%</span>
                            )}
                            {log.data.stats && (
                              <div className="mt-1">
                                {log.data.stats.translated && (
                                  <span>Translated: {log.data.stats.translated} </span>
                                )}
                                {log.data.stats.total && (
                                  <span>| Total: {log.data.stats.total} </span>
                                )}
                                {log.data.stats.remaining && (
                                  <span>| Remaining: {log.data.stats.remaining}</span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {progressLogs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No progress updates yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* All Products Table - Valid & Invalid */}
          {translationLog.validationResults && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TableIcon className="h-5 w-5" />
                  Translation Products Data
                </CardTitle>
                <CardDescription>
                  All products from uploaded file - valid and invalid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-2 border-r">#</th>
                          <th className="text-left p-2 border-r">Part Number</th>
                          <th className="text-left p-2 border-r">Languages</th>
                          <th className="text-left p-2 border-r">Status</th>
                          <th className="text-left p-2">Error/Info</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Valid Items */}
                        {translationLog.validationResults.validItems && translationLog.validationResults.validItems.slice(0, 30).map((item, index) => (
                          <tr key={`valid-${index}`} className="border-b hover:bg-muted/50">
                            <td className="p-2 border-r font-mono text-xs">{item.rowIndex}</td>
                            <td className="p-2 border-r font-mono text-xs">{item.partNumber}</td>
                            <td className="p-2 border-r text-xs">
                              <div className="flex gap-1 flex-wrap">
                                {item.translations && Object.keys(item.translations).map((lang) => (
                                  <Badge key={lang} variant="outline" className="text-xs">
                                    {lang.toUpperCase()}
                                  </Badge>
                                ))}
                              </div>
                            </td>
                            <td className="p-2 border-r">
                              <Badge variant="default" className="text-xs">
                                Valid
                              </Badge>
                            </td>
                            <td className="p-2 text-xs text-green-600">
                              Ready for translation
                            </td>
                          </tr>
                        ))}
                        
                        {/* Invalid Items */}
                        {translationLog.validationResults.invalidItems && translationLog.validationResults.invalidItems.slice(0, 30).map((item, index) => (
                          <tr key={`invalid-${index}`} className="border-b hover:bg-muted/50">
                            <td className="p-2 border-r font-mono text-xs">{item.rowIndex}</td>
                            <td className="p-2 border-r font-mono text-xs">{item.data?.partNumber || 'N/A'}</td>
                            <td className="p-2 border-r text-xs">
                              <Badge variant="outline" className="text-xs text-muted-foreground">
                                N/A
                              </Badge>
                            </td>
                            <td className="p-2 border-r">
                              <Badge variant="destructive" className="text-xs">
                                Invalid
                              </Badge>
                            </td>
                            <td className="p-2 text-xs text-red-600">
                              {item.error}
                            </td>
                          </tr>
                        ))}

                        {/* Show more indicator */}
                        {((translationLog.validationResults.validItems?.length || 0) + (translationLog.validationResults.invalidItems?.length || 0)) > 60 && (
                          <tr>
                            <td colSpan="5" className="p-2 text-center text-muted-foreground text-xs">
                              ... and {((translationLog.validationResults.validItems?.length || 0) + (translationLog.validationResults.invalidItems?.length || 0)) - 60} more products
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion Message */}
          {translationLog.processStatus === 'completed' && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  This translation has been completed successfully. {
                    translationLog.translatedCount ||
                    (translationLog.validRows ? (translationLog.validRows - (translationLog.duplicateRows || 0)) : 0) ||
                    (translationLog.validProducts ? translationLog.validProducts.length : 0) ||
                    0
                  } products were translated.
                  {translationLog.duplicateRows > 0 && (
                    <> {translationLog.duplicateRows} products were skipped (duplicates).</>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Translation Confirmation Dialog */}
        <TranslationConfirmationDialog
          isOpen={showConfirmDialog}
          onClose={() => setShowConfirmDialog(false)}
          onConfirm={handleConfirmTranslation}
          isProcessing={isAddingToQueue}
          translationData={{
            validProducts: translationLog?.validProducts,
            validRows: translationLog?.validRows,
            fileName: translationLog?.fileName,
            languages: translationLog?.languages
          }}
        />
      </div>
    </RoleProtectedRoute>
  );
}
