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
  Activity,
  Info,
  RefreshCw
} from 'lucide-react';
// Toast notifications removed - using progress logs instead
import { buildApiUrl } from '@/config/api';
import Cookies from 'js-cookie';
import RoleProtectedRoute from '@/components/RoleProtectedRoute';
import globalWebSocketManager from '@/services/globalWebSocketManager';

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

export default function ImportLogPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const logId = params.logId;

  const [loading, setLoading] = useState(true);
  const [importLog, setImportLog] = useState(null);
  const [isAddingToQueue, setIsAddingToQueue] = useState(false);
  const [error, setError] = useState(null);
  const [progressLogs, setProgressLogs] = useState([]);
  const [currentProgress, setCurrentProgress] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isCompleted, setIsCompleted] = useState(false);

  // Subscribe to global WebSocket import events
  useEffect(() => {
    if (logId && user) {
      // Subscribe to import events for this logId using global WebSocket
      const callbacks = {
        onQueued: (data) => {
          // Update status immediately via WebSocket - no API call needed
          if (data.logId === logId) {
            setImportLog(prev => {
              // Check if this is a position update or initial queue add
              const isPositionUpdate = prev?.processStatus === 'queued' && prev?.jobId === data.jobId;
              
              return {
                ...prev,
                processStatus: 'queued',
                jobId: data.jobId,
                queuePosition: data.queuePosition,
                estimatedWaitTime: data.estimatedWaitTime
              };
            });
            
            // Add to progress logs only if not just a position update
            setProgressLogs(prev => {
              const isPositionUpdate = prev.some(log => 
                log.type === 'queued' && log.data?.jobId === data.jobId
              );
              
              if (!isPositionUpdate || data.message?.includes('updated')) {
                return [...prev, {
                  id: Date.now(),
                  type: 'queued',
                  message: data.message || `Import queued at position ${data.queuePosition}`,
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
            
            // Update timestamp for activity indicator
            setLastUpdate(Date.now());
          }
        },
        onProgress: (data) => {
          // Update status immediately without API call (only if not completed)
          if (data.logId === logId && !isCompleted) {
            setImportLog(prev => ({
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
                  id: Date.now(),
                  type: 'progress',
                  message: data.message,
                  timestamp: new Date(),
                  data: { progress: data.progress, stats: data.stats }
                }];
              }
              return prev;
            });
          }
          
          // Progress updated via WebSocket - no API call needed
          setLastUpdate(Date.now());
        },
        onComplete: (data) => {
          // Update status immediately
          if (data.logId === logId) {
            // Mark as completed to prevent further progress updates
            setIsCompleted(true);
            
            setImportLog(prev => {
              return {
                ...prev,
                processStatus: 'completed',
                processingResults: data.results,
                completedAt: new Date()
              };
            });
            
            // Clear current progress
            setCurrentProgress(null);
            
            // Clear all processing/progress logs and add only final completion log
            setProgressLogs(prev => {
              // Keep only queued and error logs, remove all processing/progress logs
              const filteredLogs = prev.filter(log => 
                log.type === 'queued' || log.type === 'error'
              );
              
              // Add final completion log
              return [...filteredLogs, {
                id: Date.now(),
                type: 'success',
                message: `Import completed! ${data.results?.insertedProducts || 0} products imported successfully`,
                timestamp: new Date(),
                data: data.results
              }];
            });
            
            // Force re-render and refresh data
            setLoading(false);
            
            // Update completed via WebSocket - no API refresh needed
            setLastUpdate(Date.now());
          }
          
          // Toast removed - progress logs provide better feedback
          
          // Final results updated via WebSocket - no API call needed
          setLastUpdate(Date.now());
        },
        onError: (error) => {
          // Update status immediately
          if (error.logId === logId) {
            const statusType = error.status === 'cancelled' ? 'cancelled' : 'failed';
            
            setImportLog(prev => ({
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
              
              // Add final error/cancellation log
              return [...updatedLogs, {
                id: Date.now(),
                type: 'error',
                message: statusType === 'cancelled' ? 
                  `Import cancelled: ${error.message}` : 
                  `Import failed: ${error.message}`,
                timestamp: new Date(),
                data: { error: error.error }
              }];
            });
          }
          
          // Toast removed - progress logs provide better feedback
          
          // Error status updated via WebSocket - no API call needed
          setLastUpdate(Date.now());
        }
      };

      globalWebSocketManager.subscribeToImportEvents(logId, callbacks);

      // Cleanup subscription on component unmount
      return () => {
        // Note: Global WebSocket manager handles cleanup automatically
      };
    }
  }, [logId, user]);

  // Auto refresh for processing/queued status - WebSocket handles real-time updates
  useEffect(() => {
    if (importLog && (importLog.processStatus === 'processing' || importLog.processStatus === 'queued')) {
      // Just update lastUpdate timestamp to show activity
      const refreshInterval = setInterval(() => {
        setLastUpdate(Date.now());
      }, 5000); // Update timestamp every 5 seconds

      return () => clearInterval(refreshInterval);
    }
  }, [importLog?.processStatus]);

  // Fetch import log data - Initial load only
  useEffect(() => {
    if (logId) {
      fetchImportLog(false, true); // Initial data fetch via API with isInitialLoad flag
    }
  }, [logId]);



  const fetchImportLog = async (skipToast = false, isInitialLoad = false) => {
    try {
      setLoading(isInitialLoad); // Only show loading on initial load
      const token = Cookies.get('adminToken');
      const response = await fetch(buildApiUrl(`/api/dashboard/products/import/import-log/${logId}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch import log');
      }

      const result = await response.json();
      if (result.success) {

        // Toast notifications removed - progress logs provide comprehensive feedback

        setImportLog(result.data);

        // Load progress logs from database if available
        if (result.data.progressLogs && Array.isArray(result.data.progressLogs)) {
          // Ensure timestamps are properly formatted Date objects
          const formattedLogs = result.data.progressLogs.map(log => ({
            ...log,
            timestamp: new Date(log.timestamp) // Convert string to Date object if needed
          }));
          
          // If import is completed/failed/cancelled, mark all progress items as 100% completed
          if (result.data.processStatus === 'completed' || 
              result.data.processStatus === 'failed' || 
              result.data.processStatus === 'cancelled') {
            const completedLogs = formattedLogs.map(log => {
              // Update progress items to show 100% completion
              if (log.type === 'progress' && log.data) {
                return {
                  ...log,
                  data: {
                    ...log.data,
                    progress: 100 // Mark all progress items as 100%
                  }
                };
              }
              // Also mark queued logs as completed when import is finished
              if (log.type === 'queued') {
                return {
                  ...log,
                  data: {
                    ...log.data,
                    progress: 100 // Mark queued logs as 100% completed
                  }
                };
              }
              return log;
            });
            
            setProgressLogs(completedLogs);
            setIsCompleted(true);
          } else {
            setProgressLogs(formattedLogs);
          }
        }
      } else {
        throw new Error(result.message || 'Failed to fetch import log');
      }
    } catch (error) {
      setError(error.message);
      // Toast removed - error will be shown in UI via error state
    } finally {
      setLoading(false);
    }
  };

  // Handle adding to queue
  const handleAddToQueue = async () => {
    // Check if import is already completed
    if (importLog.processStatus === 'completed') {
      return;
    }

    // Check if there are valid products to import using processingResults or legacy fields
    const validProductCount = importLog.validProducts ? importLog.validProducts.length :
      importLog.validRows ||
      (importLog.processingResults ?
        (importLog.processingResults.totalProducts -
          importLog.processingResults.duplicateProducts -
          (importLog.processingResults.failedProducts || 0)) : 0);

    if (!importLog || validProductCount === 0) {
      return;
    }

    setIsAddingToQueue(true);

    try {
      const token = Cookies.get('adminToken');
      const response = await fetch(buildApiUrl('/api/dashboard/products/import/final-import'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ importLogId: logId })
      });

      const result = await response.json();

      if (response.ok) {
        // Success - status will be updated via WebSocket when queue processes
      } else {
        throw new Error(result.message || 'Failed to add to queue');
      }
    } catch (error) {
      // Error handling without toast - user will see status in UI
    } finally {
      setIsAddingToQueue(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading import data...</span>
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
                  <span className="hidden sm:inline">Import Products</span>
                  <span className="sm:hidden">Import</span>
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

  if (!importLog) {
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
                  <span className="hidden sm:inline">Import Products</span>
                  <span className="sm:hidden">Import</span>
                </h1>
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No import data found for Log ID: {logId}
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
                      <span className="hidden sm:inline">Import Products</span>
                      <span className="sm:hidden">Import</span>
                    </h1>
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {logId}
                    </div>
                  </div>
                </div>

                {/* Right Section - Add to Queue Button or Status */}
                <div className="flex items-center gap-2">
                  {importLog.processStatus === 'completed' ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Import Completed</span>
                      <span className="sm:hidden">Done</span>
                    </div>
                  ) : importLog.processStatus === 'queued' ? (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Clock className="h-4 w-4" />
                      <span className="hidden sm:inline">In Queue...</span>
                      <span className="sm:hidden">Queued</span>
                    </div>
                  ) : importLog.processStatus === 'processing' ? (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="hidden sm:inline">Processing Import...</span>
                      <span className="sm:hidden">Processing...</span>
                      <Button
                        variant="ghost"
                        size="sm" 
                        onClick={() => fetchImportLog()}
                        className="h-6 w-6 p-0 ml-2"
                      >
                        <RefreshCw className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : importLog.processStatus === 'failed' ? (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Import Failed</span>
                      <span className="sm:hidden">Failed</span>
                    </div>
                  ) : (
                    ((importLog.validProducts && importLog.validProducts.length > 0) ||
                      (importLog.validRows && importLog.validRows > 0) ||
                      (importLog.processingResults && (importLog.processingResults.totalProducts - importLog.processingResults.duplicateProducts - (importLog.processingResults.failedProducts || 0)) > 0)) && (
                      <Button
                        onClick={handleAddToQueue}
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
                            <Database className="h-4 w-4" />
                            <span className="hidden sm:inline">Import Data</span>
                            <span className="sm:hidden">Import</span>
                          </>
                        )}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

        {/* Import Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Import Summary
            </CardTitle>
            <CardDescription>
              File: {importLog.fileName} • Uploaded by: {importLog.uploadedBy} •
              Date: {new Date(importLog.uploadedAt).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {importLog.processingResults?.totalProducts || importLog.totalRows || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {importLog.processStatus === 'completed' ?
                    (importLog.processingResults?.insertedProducts ||
                      importLog.importedCount ||
                      (importLog.validRows ? (importLog.validRows - (importLog.duplicateRows || 0)) : 0) ||
                      (importLog.validProducts ? (importLog.validProducts.length - (importLog.duplicaterows || 0)) : 0) ||
                      0) :
                    (importLog.validRows || (importLog.validProducts ? importLog.validProducts.length : 0))
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  {importLog.processStatus === 'completed' ? 'Imported' : 'Valid Rows'}
                </div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {importLog.processingResults?.failedProducts || importLog.invalidRows || 0}
                </div>
                <div className="text-sm text-muted-foreground">Invalid Rows</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {importLog.processingResults?.duplicateProducts || importLog.duplicateRows || 0}
                </div>
                <div className="text-sm text-muted-foreground">Duplicates</div>
              </div>
            </div>

            {/* Process Status */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={
                importLog.processStatus === 'completed' ? 'default' :
                  importLog.processStatus === 'validated' ? 'secondary' :
                  importLog.processStatus === 'queued' ? 'outline' :
                  importLog.processStatus === 'processing' ? 'outline' :
                  importLog.processStatus === 'failed' ? 'destructive' :
                  'outline'
              }>
                {importLog.processStatus === 'completed' ? 'Imported' :
                  importLog.processStatus === 'validated' ? 'Ready to Import' :
                  importLog.processStatus === 'queued' ? 'In Queue' :
                  importLog.processStatus === 'processing' ? 'Processing Import' :
                  importLog.processStatus === 'failed' ? 'Import Failed' :
                    importLog.processStatus}
              </Badge>
              {importLog.processStatus === 'completed' && importLog.importedAt && (
                <span className="text-sm text-muted-foreground ml-2">
                  • Imported
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Validation Results Table */}
        {importLog.validationResults && importLog.validationResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TableIcon className="h-5 w-5" />
                Validation Results
              </CardTitle>
              <CardDescription>
                Detailed validation results for each row in the uploaded file
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
                        <th className="text-left p-2 border-r">Title</th>
                        <th className="text-left p-2 border-r">Brand</th>
                        <th className="text-left p-2 border-r">Status</th>
                        <th className="text-left p-2">Issues</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importLog.validationResults.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2 border-r font-mono text-xs">{row.rowIndex}</td>
                          <td className="p-2 border-r font-mono text-xs">{row.partNumber}</td>
                          <td className="p-2 border-r text-xs max-w-32 truncate" title={row.title}>{row.title}</td>
                          <td className="p-2 border-r text-xs max-w-24 truncate" title={row.brand}>{row.brand}</td>
                          <td className="p-2 border-r">
                            <Badge variant={
                              row.status === 'Valid' ? 'default' :
                                row.isDuplicate || row.status === 'Existing' ? 'secondary' :
                                  'destructive'
                            } className="text-xs">
                              {row.isDuplicate ? 'Duplicate' : row.status}
                            </Badge>
                          </td>
                          <td className="p-2 text-xs">
                            {row.issues && row.issues.length > 0 ? (
                              <div className="space-y-1">
                                {row.issues.map((issue, issueIndex) => (
                                  <div key={issueIndex} className={
                                    row.isDuplicate || issue.includes('already exists') ? 'text-yellow-600' : 'text-red-600'
                                  }>
                                    • {issue}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-green-600">✓ Valid</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}



        {/* Import Progress Section */}
        {(importLog.processStatus === 'queued' || importLog.processStatus === 'processing' || progressLogs.length > 0) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Import Progress
              </CardTitle>
              <CardDescription>
                Real-time import progress and status updates
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
                      {currentProgress.stats.inserted && (
                        <span>Inserted: {currentProgress.stats.inserted} | </span>
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
                            <span>Queue Position: {log.data.queuePosition} | </span>
                          )}
                          {(log.data.progress || (log.type === 'queued' && isCompleted)) && (
                            <span>Progress: {log.data.progress || (isCompleted ? 100 : 0)}% | </span>
                          )}
                          {log.data.insertedProducts && (
                            <span>Imported: {log.data.insertedProducts} products</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {progressLogs.length === 0 && importLog.processStatus === 'queued' && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Import queued</p>
                      <p className="text-xs text-muted-foreground">Waiting for processing to start...</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        </div>
      </div>
    </RoleProtectedRoute>
  );
}