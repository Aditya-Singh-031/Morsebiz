'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  AlertTriangle,
  FileText,
  Loader2,
  ChevronDown,
  X,
  Table as TableIcon,
  History,
  Eye,
  Calendar,
  User,
  Filter,
  Search,
  FolderOpen,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { buildApiUrl } from '@/config/api';
import Cookies from 'js-cookie';
import { DataTable } from '@/components/ui/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import globalWebSocketManager from '@/services/globalWebSocketManager';

export default function ImportProductsPage() {
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [isValidating, setIsValidating] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [importLogId, setImportLogId] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [validatedData, setValidatedData] = useState(null);
  
  // Brand selection states
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState('');

  // Import logs state
  const [importLogs, setImportLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsPagination, setLogsPagination] = useState({
    current: 1,
    total: 1,
    limit: 10
  });
  const [logsFilter, setLogsFilter] = useState({
    status: 'all',
    uploadedBy: 'all'
  });
  const [realTimeUpdates, setRealTimeUpdates] = useState(new Map()); // Track real-time status updates

  // Fetch brands and import logs on component mount
  useEffect(() => {
    fetchBrands();
    fetchImportLogs();
  }, []);

  // Subscribe to global WebSocket for import updates
  useEffect(() => {
    if (user) {
      // Subscribe to general import events to update the logs list
      const callbacks = {
        onQueued: (data) => {
          console.log('🔄 Import Queued:', {
            logId: data.logId,
            jobId: data.jobId,
            queuePosition: data.queuePosition,
            message: data.message
          });
          
          // Update real-time status for this logId
          setRealTimeUpdates(prev => new Map(prev.set(data.logId, {
            processStatus: 'queued',
            lastUpdated: new Date(),
            jobId: data.jobId,
            queuePosition: data.queuePosition,
            ...data
          })));
          
          toast.success(data.message || 'Import queued successfully!');
        },
        onComplete: (data) => {
          console.log('✅ Import Completed Successfully:', {
            logId: data.logId,
            message: data.message,
            results: data.results,
            jobId: data.jobId
          });
          
          const successMessage = data.results 
            ? `Import completed! ${data.results.insertedProducts} products imported, ${data.results.duplicateProducts} duplicates skipped`
            : `Import completed for ${data.logId}`;
            
          toast.success(successMessage, { duration: 5000 });
          
          // Update real-time status for this logId
          setRealTimeUpdates(prev => new Map(prev.set(data.logId, {
            processStatus: 'completed',
            lastUpdated: new Date(),
            results: data.results,
            ...data
          })));
          
          // Also refresh import logs to get latest data
          setTimeout(() => fetchImportLogs(), 1000);
        },
        onError: (error) => {
          console.error('❌ Import Failed:', {
            logId: error.logId,
            message: error.message,
            error: error.error,
            jobId: error.jobId
          });
          
          toast.error(`Import failed: ${error.message}`, { 
            duration: 8000 
          });
          
          // Update real-time status for this logId
          if (error.logId) {
            setRealTimeUpdates(prev => new Map(prev.set(error.logId, {
              processStatus: 'failed',
              lastUpdated: new Date(),
              error: error.message
            })));
          }
          
          // Refresh import logs to show error status
          fetchImportLogs();
        },
        onProgress: (data) => {
          console.log('📊 Import Progress Update:', {
            logId: data.logId,
            progress: data.progress,
            message: data.message,
            stats: data.stats,
            jobId: data.jobId
          });
          
          // Remove progress toasts - only show in UI
          
          // Update real-time status for this logId
          if (data.logId) {
            setRealTimeUpdates(prev => new Map(prev.set(data.logId, {
              processStatus: 'processing',
              lastUpdated: new Date(),
              progress: data.progress || 0,
              message: data.message,
              stats: data.stats,
              ...data
            })));
          }
        }
      };

      // Subscribe to admin room events for import completion notifications
      globalWebSocketManager.subscribeToAdminEvents(callbacks);

      // Cleanup subscription on component unmount
      return () => {
        console.log('Cleaning up import events subscription');
        // Global WebSocket manager handles cleanup automatically
      };
    }
  }, [user]);

  // Subscribe to specific import logId updates
  const subscribeToImportUpdates = (logId) => {
    if (logId && user) {
      const callbacks = {
        onProgress: (data) => {
          console.log(`Import progress for ${logId}:`, data);
          // Update specific row in import logs if needed
          fetchImportLogs();
        },
        onComplete: (data) => {
          console.log(`Import completed for ${logId}:`, data);
          toast.success(`Import ${logId} completed successfully!`);
          fetchImportLogs();
        },
        onError: (error) => {
          console.error(`Import error for ${logId}:`, error);
          toast.error(`Import ${logId} failed: ${error.message}`);
          fetchImportLogs();
        }
      };

      globalWebSocketManager.subscribeToImportEvents(logId, callbacks);
    }
  };

  // Fetch brands from API
  const fetchBrands = async () => {
    setLoadingBrands(true);
    try {
      const token = Cookies.get('adminToken');
      const response = await fetch(buildApiUrl('/api/dashboard/brands'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }

      const result = await response.json();
      console.log('Brands API Response:', result); // Debug log
      
      if (result.success && Array.isArray(result.data)) {
        console.log('Setting brands:', result.data); // Debug log
        setBrands(result.data);
      } else {
        console.log('Invalid brands response structure:', result); // Debug log
        setBrands([]);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast.error('Failed to load brands');
      setBrands([]);
    } finally {
      setLoadingBrands(false);
    }
  };

  // Handle brand selection (single selection)
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setShowBrandDropdown(false);
    setBrandSearchTerm('');
  };

  // Clear selected brand
  const clearBrand = () => {
    setSelectedBrand(null);
  };

  // Filter brands based on search term
  const filteredBrands = brands.filter(brand =>
    brand && brand.title && brand.title.toLowerCase().includes(brandSearchTerm.toLowerCase())
  );

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  // Validate file and set it
  const validateAndSetFile = (file) => {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return;
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      return;
    }
    
    setSelectedFile(file);
    setUploadResult(null);
  };

  // Download sample Excel file
  const handleDownloadSample = async () => {
    if (!selectedBrand) {
      return;
    }

    setIsDownloading(true);
    try {
      const token = Cookies.get('adminToken');
      const brandIds = [selectedBrand.slug];
      
      const response = await fetch(buildApiUrl('/api/dashboard/products/import/sample-excel'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ brandIds })
      });

      if (!response.ok) {
        throw new Error('Failed to download sample file');
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `product-import-sample-${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Sample file downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download sample file');
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle file validation
  const handleValidation = async () => {
    if (!selectedFile) {
      return;
    }

    setIsValidating(true);
    setValidationResult(null);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('excelFile', selectedFile);

      const token = Cookies.get('adminToken');
      const response = await fetch(buildApiUrl('/api/dashboard/products/import/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok) {
        // Show success message
        toast.success(result.message);
        
        // Set the import log ID for final import
        setImportLogId(result.data.logId);
        
        // Redirect to the import log page
        router.push(`/dashboard/products/import/${result.data.logId}`);
      } else {
        throw new Error(result.message || 'Validation failed');
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error(error.message || 'Failed to validate file');
    } finally {
      setIsValidating(false);
    }
  };

  // Handle final import with queue system
  const handleFinalImport = async () => {
    if (!importLogId) {
      return;
    }

    setIsImporting(true);

    try {
      const token = Cookies.get('adminToken');
      const response = await fetch(buildApiUrl(`/api/dashboard/products/import/final-import`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ importLogId })
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message);
        
        // Start monitoring the job status
        const jobId = result.data.jobId;
        monitorJobStatus(jobId);
        
      } else {
        throw new Error(result.message || 'Failed to add import job to queue');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to start import process');
      setIsImporting(false);
    }
  };

  // Monitor job status
  const monitorJobStatus = async (jobId) => {
    const token = Cookies.get('adminToken');
    
    const checkStatus = async () => {
      try {
        const response = await fetch(buildApiUrl(`/api/dashboard/products/import/job-status/${jobId}`), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          const job = result.data;
          
          // Check if monitoring should stop
          if (job.shouldStopMonitoring) {
            console.log('Stopping monitoring as requested by backend');
            if (job.status === 'completed') {
              setIsImporting(false);
              setUploadResult({
                message: 'Products imported successfully',
                data: {
                  totalProcessed: job.statistics?.totalItems || 0,
                  insertedCount: job.statistics?.successfulItems || 0,
                  successful: job.statistics?.successfulItems || 0,
                  duplicatesCount: job.statistics?.duplicateItems || 0,
                  duplicates: job.statistics?.duplicateItems || 0,
                  errorsCount: job.statistics?.failedItems || 0,
                  failed: job.statistics?.failedItems || 0,
                  warningsCount: 0
                }
              });
              
              const successCount = job.statistics?.successfulItems || 0;
              toast.success(`Import completed! ${successCount} products imported successfully`);
              
              // Reset form
              setSelectedFile(null);
              setValidationResult(null);
              setImportLogId(null);
              const fileInput = document.getElementById('file-upload');
              if (fileInput) fileInput.value = '';
            } else if (job.status === 'failed') {
              setIsImporting(false);
              toast.error(`Import failed: ${job.error?.message || job.error || 'Unknown error'}`);
            }
            return; // Stop monitoring
          }
          
          if (job.status === 'completed') {
            setIsImporting(false);
            setUploadResult({
              message: 'Products imported successfully',
              data: {
                totalProcessed: job.statistics?.totalItems || 0,
                insertedCount: job.statistics?.successfulItems || 0,
                successful: job.statistics?.successfulItems || 0,
                duplicatesCount: job.statistics?.duplicateItems || 0,
                duplicates: job.statistics?.duplicateItems || 0,
                errorsCount: job.statistics?.failedItems || 0,
                failed: job.statistics?.failedItems || 0,
                warningsCount: 0
              }
            });
            
            const successCount = job.statistics?.successfulItems || 0;
            toast.success(`Import completed! ${successCount} products imported successfully`);
            
            // Reset form
            setSelectedFile(null);
            setValidationResult(null);
            setImportLogId(null);
            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.value = '';
            
            // Refresh import logs to show updated status
            fetchImportLogs(logsPagination?.current || 1);
            
          } else if (job.status === 'failed') {
            setIsImporting(false);
            toast.error(`Import failed: ${job.error?.message || job.error || 'Unknown error'}`);
            
          } else if (job.status === 'processing') {
            // Update progress if available
            if (job.progress) {
              console.log(`Processing: ${job.progress.percentage}% - ${job.progress.currentStep}`);
            }
            // Continue monitoring
            setTimeout(checkStatus, 2000);
            
          } else {
            // Job is queued, continue monitoring
            if (job.queuePosition) {
              console.log(`Job queued at position: ${job.queuePosition}`);
            }
            setTimeout(checkStatus, 1000);
          }
        } else {
          // If job not found, stop monitoring
          if (result.message === 'Job not found') {
            console.log('Job not found, stopping monitoring');
            setIsImporting(false);
            toast.error('Import job not found');
            return;
          }
          throw new Error(result.message || 'Failed to get job status');
        }
      } catch (error) {
        console.error('Job status check error:', error);
        setIsImporting(false);
        toast.error('Failed to monitor import progress');
      }
    };
    
    // Start monitoring
    checkStatus();
  };

  // Fetch import logs with specific filter (to avoid state timing issues)
  const fetchImportLogsWithFilter = async (page = 1, filterOverride = null) => {
    if (!user || !['super-admin', 'admin'].includes(user.role)) {
      console.log('User not authorized for import logs:', user?.role);
      return;
    }

    const currentFilter = filterOverride || logsFilter;
    console.log('Fetching import logs for page:', page, 'with filters:', currentFilter);
    setLoadingLogs(true);
    try {
      const token = Cookies.get('adminToken');
      const limit = logsPagination?.limit || 10;
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        status: currentFilter?.status || 'all',
        uploadedBy: currentFilter?.uploadedBy || 'all'
      });

      const url = buildApiUrl(`/api/dashboard/products/import/import-logs?${params}`);
      console.log('Fetching from URL:', url);
      console.log('URL params breakdown:', {
        page: page.toString(),
        limit: limit.toString(), 
        status: currentFilter?.status || 'all',
        uploadedBy: currentFilter?.uploadedBy || 'all'
      });
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      if (result.success) {
        setImportLogs(result.data || []);
        setLogsPagination(prev => ({
          ...prev,
          ...result.pagination,
          limit: limit
        }));
        console.log('Successfully loaded', result.data?.length || 0, 'import logs');
        console.log('Loaded logs processStatus values:', result.data?.map(log => log.processStatus));
      } else {
        throw new Error(result.message || 'Failed to fetch import logs');
      }
    } catch (error) {
      console.error('Error fetching import logs:', error);
      toast.error('Failed to load import history: ' + error.message);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Fetch import logs
  const fetchImportLogs = async (page = 1) => {
    return fetchImportLogsWithFilter(page, null);
  };

  // Handle log row click
  const handleLogClick = (logId) => {
    router.push(`/dashboard/products/import/${logId}`);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    console.log('Filter change:', key, '=', value);
    const newFilter = { ...logsFilter, [key]: value };
    console.log('New filter state:', newFilter);
    setLogsFilter(newFilter);
    // Reset to page 1 when filter changes and refetch
    setLogsPagination(prev => ({ ...prev, current: 1 }));
    
    // Use the new filter state directly in the API call to avoid timing issues
    fetchImportLogsWithFilter(1, newFilter);
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'validated':
        return 'secondary';
      case 'queued':
        return 'outline';
      case 'processing':
        return 'outline';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };



  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-0 space-y-6">
        {/* Sticky Header */}
        <div className="sticky top-16 left-0 lg:left-64 right-0 z-30 bg-background py-2">
          <div className="container mx-auto">
            <div className="flex items-center justify-between gap-2 md:gap-4">
              {/* Left Section - Back Button and Title */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold truncate">
                    <span className="hidden sm:inline">Import Products</span>
                    <span className="sm:hidden">Import</span>
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto">{/* Content wrapper */}

      {/* Permission Check */}
      {user && !['super-admin', 'admin'].includes(user.role) && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to import products. Only Super Admins and Admins can perform bulk imports.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {user && ['super-admin', 'admin'].includes(user.role) && (
        <div 
          className="grid gap-6 md:grid-cols-2"
          onClick={(e) => {
            // Close brand dropdown when clicking outside
            if (!e.target.closest('.brand-dropdown-container')) {
              setShowBrandDropdown(false);
            }
          }}
        >
          {/* Download Sample */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Download Sample Template
              </CardTitle>
              <CardDescription>
                Select brands and download a sample Excel file with real data from those brands
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Brand Selection */}
              <div className="space-y-2 brand-dropdown-container">
                <Label htmlFor="brand-select">Select Brand</Label>
                <div className="relative">
                  <div
                    className="min-h-[40px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-pointer flex items-center justify-between"
                    onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                  >
                    <div className="flex items-center">
                      {!selectedBrand ? (
                        <span className="text-muted-foreground">Select a brand...</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{selectedBrand.title}</span>
                          <X
                            className="h-4 w-4 cursor-pointer hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearBrand();
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </div>

                  {/* Dropdown */}
                  {showBrandDropdown && (
                    <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-hidden">
                      {/* Search */}
                      <div className="p-2 border-b">
                        <Input
                          placeholder="Search brands..."
                          value={brandSearchTerm}
                          onChange={(e) => setBrandSearchTerm(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      
                      {/* Brand List */}
                      <div className="max-h-48 overflow-y-auto">
                        {loadingBrands ? (
                          <div className="p-4 text-center">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground mt-2">Loading brands...</p>
                          </div>
                        ) : filteredBrands.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No brands found
                          </div>
                        ) : (
                          filteredBrands.map((brand) => {
                            const isSelected = selectedBrand && selectedBrand._id === brand._id;
                            return (
                              <div
                                key={brand._id}
                                className={`p-2 cursor-pointer hover:bg-accent flex items-center gap-2 ${
                                  isSelected ? 'bg-accent' : ''
                                }`}
                                onClick={() => handleBrandSelect(brand)}
                              >
                                <div className={`w-4 h-4 border rounded-full flex items-center justify-center ${
                                  isSelected ? 'bg-primary border-primary' : 'border-input'
                                }`}>
                                  {isSelected && <div className="w-2 h-2 bg-primary-foreground rounded-full" />}
                                </div>
                                <span className="text-sm">{brand.title}</span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Selected count */}
                {selectedBrand && (
                  <p className="text-xs text-muted-foreground">
                    1 brand selected
                  </p>
                )}
              </div>

              <Button 
                onClick={handleDownloadSample}
                disabled={isDownloading || !selectedBrand}
                className="w-full"
                variant="outline"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Download Sample Excel
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Upload File */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Excel File
              </CardTitle>
              <CardDescription>
                Select an Excel file (.xlsx or .xls) to import products
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    {selectedFile ? selectedFile.name : 'Drop your Excel file here, or click to browse'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports .xlsx and .xls files up to 50MB
                  </p>
                </div>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Label
                  htmlFor="file-upload"
                  className="mt-4 inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                >
                  Choose File
                </Label>
              </div>

              {/* Validation Button */}
              <Button 
                onClick={handleValidation}
                disabled={!selectedFile || isValidating}
                className="w-full"
                variant="outline"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Validate File
                  </>
                )}
              </Button>


            </CardContent>
          </Card>
        </div>
      )}

      {/* Validation Results */}
      {validationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-500" />
              Validation Results
            </CardTitle>
            <CardDescription>
              Review the validation results before proceeding with the import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {validationResult.summary.totalRows}
                </div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {validationResult.summary.validRows}
                </div>
                <div className="text-sm text-muted-foreground">Valid Rows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {validationResult.summary.invalidRows}
                </div>
                <div className="text-sm text-muted-foreground">Invalid Rows</div>
              </div>
              <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          {validationResult.summary.duplicateRows + (validationResult.summary.existingRows || 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Duplicates/Existing</div>
                      </div>
            </div>

            {/* Validation Results Table */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-2 border-b">
                <h3 className="font-medium">Validation Details</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 sticky top-0">
                    <tr>
                      <th className="text-left p-2 border-r">Row</th>
                      <th className="text-left p-2 border-r">Part Number</th>
                      <th className="text-left p-2 border-r">Title</th>
                      <th className="text-left p-2 border-r">Brand</th>
                      <th className="text-left p-2 border-r">Status</th>
                      <th className="text-left p-2">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationResult.validationResults.map((row, index) => (
                       <tr key={index} className={`border-b ${
                         row.status === 'Valid' ? 'bg-green-50' : 
                         row.isDuplicate || row.status === 'Existing' ? 'bg-yellow-50' : 
                         'bg-red-50'
                       }`}>
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
                           {row.issues.length > 0 ? (
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
                             <span className="text-green-600">No issues</span>
                           )}
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Final Import Button */}
            {validationResult.summary.validRows > 0 && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleFinalImport}
                  disabled={isImporting}
                  className="px-8"
                  size="lg"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Import Queue...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Add to Import Queue ({validationResult.summary.validRows} Products)
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadResult && (
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Import Results
            </CardTitle>
            <CardDescription>
              {uploadResult.message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {uploadResult.data.totalProcessed || 0}
                </div>
                <div className="text-sm text-muted-foreground">Total Processed</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {uploadResult.data.insertedCount || uploadResult.data.successful || 0}
                </div>
                <div className="text-sm text-muted-foreground">Successfully Imported</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                <div className="text-3xl font-bold text-yellow-600 mb-1">
                  {uploadResult.data.duplicatesCount || uploadResult.data.duplicates || 0}
                </div>
                <div className="text-sm text-muted-foreground">Duplicates Skipped</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border shadow-sm">
                <div className="text-3xl font-bold text-red-600 mb-1">
                  {uploadResult.data.errorsCount || uploadResult.data.failed || 0}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3 p-4 bg-white rounded-lg border shadow-sm">
              <div className="flex justify-between items-center text-sm font-medium">
                <span>Import Progress</span>
                <span className="text-green-600">
                  {uploadResult.data.insertedCount || uploadResult.data.successful || 0} / {uploadResult.data.totalProcessed || 0}
                </span>
              </div>
              <Progress 
                value={
                  (uploadResult.data.totalProcessed || 0) > 0 
                    ? Math.round(((uploadResult.data.insertedCount || uploadResult.data.successful || 0) / (uploadResult.data.totalProcessed || 1)) * 100)
                    : 0
                } 
                className="w-full h-3"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Success Rate: {
                    (uploadResult.data.totalProcessed || 0) > 0 
                      ? Math.round(((uploadResult.data.insertedCount || uploadResult.data.successful || 0) / (uploadResult.data.totalProcessed || 1)) * 100)
                      : 0
                  }%
                </span>
                <span>
                  {uploadResult.data.duplicatesCount || uploadResult.data.duplicates || 0} duplicates, {uploadResult.data.errorsCount || uploadResult.data.failed || 0} errors
                </span>
              </div>
            </div>

            {/* Detailed Breakdown */}
            {((uploadResult.data.duplicatesCount || uploadResult.data.duplicates || 0) > 0 || 
              (uploadResult.data.errorsCount || uploadResult.data.failed || 0) > 0 || 
              (uploadResult.data.warningsCount || 0) > 0) && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Detailed Breakdown
                </h4>
                
                {/* Success Summary */}
                {(uploadResult.data.insertedCount || uploadResult.data.successful || 0) > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-700">
                      {uploadResult.data.insertedCount || uploadResult.data.successful || 0} products successfully imported
                    </span>
                  </div>
                )}

                {/* Duplicates */}
                {(uploadResult.data.duplicatesCount || uploadResult.data.duplicates || 0) > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-yellow-700">
                        {uploadResult.data.duplicatesCount || uploadResult.data.duplicates || 0} duplicate products skipped
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground ml-6">
                      These products already exist in the database and were not imported again.
                    </div>
                  </div>
                )}

                {/* Errors */}
                {(uploadResult.data.errorsCount || uploadResult.data.failed || 0) > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-medium text-red-700">
                        {uploadResult.data.errorsCount || uploadResult.data.failed || 0} products failed to import
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground ml-6">
                      These products had validation errors or database issues.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => {
                  setUploadResult(null);
                  setSelectedFile(null);
                  setValidationResult(null);
                  setImportLogId(null);
                  const fileInput = document.getElementById('file-upload');
                  if (fileInput) fileInput.value = '';
                }}
                variant="outline"
                className="flex-1"
              >
                Import Another File
              </Button>
              {(uploadResult.data.insertedCount || uploadResult.data.successful || 0) > 0 && (
                <Button
                  onClick={() => {
                    // Navigate to products list or refresh
                    window.location.href = '/dashboard/products';
                  }}
                  className="flex-1"
                >
                  View Imported Products
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validated Data Table */}
      {validatedData && validatedData.length > 0 && (
        <DataTable 
          data={validatedData}
          title="Imported Products Data"
          description="All successfully imported products with validated data structure"
        />
      )}

      {/* Import History Section */}
      {user && ['super-admin', 'admin'].includes(user.role) && (
        <Card className='mt-5'>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Import History
            </CardTitle>
            <CardDescription>
              View and manage previous product import attempts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Status:</Label>
                <select
                  value={logsFilter.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="text-sm border rounded px-2 py-1 h-8"
                >
                  <option value="all">All Status</option>
                  <option value="validated">Validated</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setLogsFilter({ status: 'all', uploadedBy: 'all' });
                  fetchImportLogs(1);
                }}
                className="h-8 px-3 text-xs"
              >
                <Filter className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>

            {/* Import Logs Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Log ID</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead className="w-24 text-center">Total</TableHead>
                    <TableHead className="w-24 text-center">Valid</TableHead>
                    <TableHead className="w-24 text-center">Invalid</TableHead>
                    <TableHead className="w-28">Status</TableHead>
                    <TableHead className="w-32">Uploaded By</TableHead>
                    <TableHead className="w-40">Date</TableHead>
                    <TableHead className="w-20">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingLogs ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><div className="h-4 bg-muted animate-pulse rounded"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted animate-pulse rounded"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted animate-pulse rounded mx-auto w-8"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted animate-pulse rounded mx-auto w-8"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted animate-pulse rounded mx-auto w-8"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted animate-pulse rounded w-16"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted animate-pulse rounded"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted animate-pulse rounded"></div></TableCell>
                        <TableCell><div className="h-4 bg-muted animate-pulse rounded w-8"></div></TableCell>
                      </TableRow>
                    ))
                  ) : importLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No import history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    importLogs.map((log) => (
                      <TableRow 
                        key={log.logId}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleLogClick(log.logId)}
                      >
                        <TableCell className="font-mono text-xs">{log.logId}</TableCell>
                        <TableCell className="font-medium max-w-48 truncate" title={log.fileName}>
                          {log.fileName}
                        </TableCell>
                        <TableCell className="text-center">{log.totalRows}</TableCell>
                        <TableCell className="text-center text-green-600">{log.validRows}</TableCell>
                        <TableCell className="text-center text-red-600">{log.invalidRows}</TableCell>
                        <TableCell>
                          {(() => {
                            // Check if there's a real-time update for this log
                            const realtimeUpdate = realTimeUpdates.get(log.logId);
                            const currentStatus = realtimeUpdate?.processStatus || log.processStatus;
                            const progress = realtimeUpdate?.progress;
                            
                            return (
                              <div className="flex items-center gap-2">
                                <Badge variant={getStatusBadgeVariant(currentStatus)} className="text-xs">
                                  {currentStatus === 'completed' ? 'Imported' : 
                                   currentStatus === 'validated' ? 'Ready' : 
                                   currentStatus === 'queued' ? 'In Queue' :
                                   currentStatus === 'processing' ? (
                                     <div className="flex items-center gap-1">
                                       <Loader2 className="h-3 w-3 animate-spin" />
                                       Processing
                                     </div>
                                   ) :
                                   currentStatus === 'failed' ? 'Failed' :
                                   currentStatus}
                                </Badge>
                                {currentStatus === 'processing' && progress !== undefined && (
                                  <span className="text-xs text-muted-foreground">
                                    {progress}%
                                  </span>
                                )}
                                {realtimeUpdate && (
                                  <span className="text-xs text-green-500" title="Real-time update">
                                    ●
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-sm">{log.uploadedBy}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(log.uploadedAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs mt-1">
                            {new Date(log.uploadedAt).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLogClick(log.logId);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {logsPagination && logsPagination.total > 1 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((logsPagination.current - 1) * (logsPagination.limit || 10)) + 1} to {Math.min(logsPagination.current * (logsPagination.limit || 10), logsPagination.totalItems || 0)} of {logsPagination.totalItems || 0} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={logsPagination.current === 1}
                    onClick={() => fetchImportLogs((logsPagination.current || 1) - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {logsPagination.current || 1} of {logsPagination.total || 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={logsPagination.current === logsPagination.total}
                    onClick={() => fetchImportLogs((logsPagination.current || 1) + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
        </div>
      </div>
    </div>
  );
}