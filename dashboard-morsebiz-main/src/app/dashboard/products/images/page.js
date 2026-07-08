'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import API_CONFIG from '@/config/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, ListTodo, ChevronDown, ChevronUp, ArrowLeft, Home, Slash } from 'lucide-react';

// Import Components
import {
  BrandSelectionCard,
  BreadcrumbNavigation,
  FoldersDisplayCard,
  FilesDisplayCard,
  ImportLogsDialog,
  Pagination,
  getFileIcon,
  formatFileSize,
  formatDate
} from './components';

const ProductImagesPage = () => {
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentView, setCurrentView] = useState('brands'); // 'brands', 'folders', 'files'
  const [loading, setLoading] = useState(false);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Part Number and Image Sync states
  const [currentFolderStatus, setCurrentFolderStatus] = useState({
    partNumberMatch: false,
    imageSynced: false,
    syncDetails: {}
  });
  
  // Pagination state for folders
  const [foldersCurrentPage, setFoldersCurrentPage] = useState(1);
  const [foldersTotalPages, setFoldersTotalPages] = useState(0);
  const [totalFolders, setTotalFolders] = useState(0);
  const [foldersHasNextPage, setFoldersHasNextPage] = useState(false);
  const [foldersHasPreviousPage, setFoldersHasPreviousPage] = useState(false);
  const [foldersPerPage] = useState(20);
  
  // Pagination state for files
  const [filesCurrentPage, setFilesCurrentPage] = useState(1);
  const [filesTotalPages, setFilesTotalPages] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [filesHasNextPage, setFilesHasNextPage] = useState(false);
  const [filesHasPreviousPage, setFilesHasPreviousPage] = useState(false);
  const [filesPerPage] = useState(50);
  const [isEstimated, setIsEstimated] = useState(false);
  
  // Brand dropdown states
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [brandSearchTerm, setBrandSearchTerm] = useState('');
  
  // Queue status states
  const [showQueueStatus, setShowQueueStatus] = useState(false);
  const [monitoringJobIds, setMonitoringJobIds] = useState(new Set());
  
  const { token } = useSelector((state) => state.auth);

  // Fetch brands for dropdown
  useEffect(() => {
    fetchBrands();
    
    // Cleanup on unmount
    return () => {
      setMonitoringJobIds(new Set());
    };
  }, []);

  const fetchBrands = async () => {
    try {
      setBrandsLoading(true);
      
      if (!token) {
        toast.error('Authentication required. Please login again.');
        setBrands([]);
        return;
      }
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/dashboard/brands?limit=1000&page=1`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data)) {
        setBrands(data.data);
      } else {
        toast.error('Invalid response format from brands API');
        setBrands([]);
      }
    } catch (error) {
      toast.error(`Failed to fetch brands: ${error.message}`);
      setBrands([]);
    } finally {
      setBrandsLoading(false);
    }
  };

  // Fetch files from Azure for selected brand with pagination
  const fetchBrandFolders = async (brandName, page = 1) => {
    if (!brandName) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/azure/list-folders/${encodeURIComponent(brandName)}?page=${page}&limit=${foldersPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch folders');
      }

      const data = await response.json();
      if (data.success) {
        setFolders(data.folders || []);
        setTotalFolders(data.totalFolders || 0);
        setFoldersCurrentPage(data.pagination?.currentPage || page);
        setFoldersTotalPages(data.pagination?.totalPages || 0);
        setFoldersHasNextPage(data.pagination?.hasNextPage || false);
        setFoldersHasPreviousPage(data.pagination?.hasPreviousPage || false);
        setCurrentView('folders');
      } else {
        throw new Error(data.message || 'Failed to fetch folders');
      }
    } catch (error) {
      console.error('Error fetching folders:', error);
      toast.error('Failed to load folders from Azure');
      setFolders([]);
      setTotalFolders(0);
      setFoldersCurrentPage(1);
      setFoldersTotalPages(0);
      setFoldersHasNextPage(false);
      setFoldersHasPreviousPage(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch files from Azure for selected brand and folder with pagination
  const fetchFolderFiles = async (brandName, folderName, page = 1) => {
    if (!brandName || !folderName) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/azure/list-folder-files/${encodeURIComponent(brandName)}/${encodeURIComponent(folderName)}?page=${page}&limit=${filesPerPage}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }

      const data = await response.json();
      if (data.success) {
        const filesArray = data.files || [];
        setFiles(filesArray);
        // Use totalFiles from API, or fall back to fileCount, pagination totalItems, or files array length
        setTotalFiles(data.totalFiles || data.fileCount || data.pagination?.totalItems || filesArray.length);
        setFilesCurrentPage(data.pagination?.currentPage || page);
        setFilesTotalPages(data.pagination?.totalPages || 0);
        setFilesHasNextPage(data.pagination?.hasNextPage || false);
        setFilesHasPreviousPage(data.pagination?.hasPreviousPage || false);
        setIsEstimated(data.pagination?.isEstimated || false);
        
        // Set folder status from API response
        setCurrentFolderStatus({
          partNumberMatch: data.partNumberMatch || false,
          imageSynced: data.imageSynced || false,
          syncDetails: data.syncDetails || {}
        });
        
        setCurrentView('files');
      } else {
        throw new Error(data.message || 'Failed to fetch files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files from Azure');
      setFiles([]);
      setTotalFiles(0);
      setFilesCurrentPage(1);
      setFilesTotalPages(0);
      setFilesHasNextPage(false);
      setFilesHasPreviousPage(false);
      setIsEstimated(false);
    } finally {
      setLoading(false);
    }
  };

  // Create new folder in selected brand
  const handleCreateFolder = async (folderName) => {
    if (!selectedBrand || !folderName) return;

    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to create folder "${folderName}" in brand "${selectedBrand}"?`);
    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/azure/create-folder/${encodeURIComponent(selectedBrand)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ folderName })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      const data = await response.json();
      if (data.success) {
        // Refresh the folders list
        fetchBrandFolders(selectedBrand, foldersCurrentPage);
      } else {
        throw new Error(data.message || 'Failed to create folder');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error(error.message || 'Failed to create folder');
      throw error;
    }
  };

  // Import ZIP file to selected brand (Queue-based for large files)
  const handleZipImport = async (zipFile) => {
    if (!selectedBrand || !zipFile) return;

    // Show file size and confirmation dialog
    const fileSizeMB = zipFile.size / (1024 * 1024);
    const confirmed = window.confirm(`Are you sure you want to import ZIP file "${zipFile.name}" (${fileSizeMB.toFixed(1)}MB) to brand "${selectedBrand}"?\n\nThis will process all images in the ZIP file.`);
    if (!confirmed) return;

    try {
      const formData = new FormData();
      formData.append('zipFile', zipFile);
      
      toast.loading(`Uploading ZIP file (${fileSizeMB.toFixed(1)}MB) to queue...`, { id: 'zip-import' });

      // Always use queue-based endpoint for better handling
      const endpoint = `${API_CONFIG.BASE_URL}/azure/upload-zip-queued/${encodeURIComponent(selectedBrand)}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to import ZIP file');
      }

      const data = await response.json();
      if (data.success) {
        // Always use queue-based processing
        toast.success(
          `ZIP file added to processing queue (Position: ${data.data.queuePosition})`,
          { id: 'zip-import' }
        );
        
        // Always add to active jobs list for tracking
        // Automatically open the Import Logs modal to show progress
        setShowQueueStatus(true);
        
        // Start monitoring the job
        monitorImageImportJob(data.data.jobId);
      } else {
        throw new Error(data.message || 'Failed to import ZIP file');
      }
    } catch (error) {
      console.error('Error importing ZIP:', error);
      
      // Handle specific error cases
      toast.error(error.message || 'Failed to import ZIP file', { id: 'zip-import' });
      throw error;
    }
  };

  // Monitor image import job status
  const monitorImageImportJob = async (jobId) => {
    // Add this job to monitoring set
    setMonitoringJobIds(prev => {
      const newSet = new Set([...prev, jobId]);
      console.log(`Starting individual monitoring for job ${jobId}. Total monitored: ${newSet.size}`);
      return newSet;
    });
    
    const checkStatus = async () => {
      try {
        const response = await fetch(
          `${API_CONFIG.BASE_URL}/azure/upload-zip-status/${jobId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        const result = await response.json();
        
        if (response.ok && result.success) {
          const job = result.data;
          
          if (job.status === 'completed') {
            toast.success(
              `Image import completed! ${job.statistics?.successCount || 0} files uploaded successfully`,
              { id: 'zip-import', duration: 5000 }
            );
            
            // Remove from monitoring set
            setMonitoringJobIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(jobId);
              console.log(`Job ${jobId} completed. Remaining monitored: ${newSet.size}`);
              return newSet;
            });
            
            // Refresh the folders list
            fetchBrandFolders(selectedBrand, foldersCurrentPage);
            return; // Stop monitoring
            
          } else if (job.status === 'failed') {
            toast.error(`Image import failed: ${job.error?.message || job.error || 'Unknown error'}`, { id: 'zip-import' });
            
            // Remove from monitoring set
            setMonitoringJobIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(jobId);
              console.log(`Job ${jobId} failed. Remaining monitored: ${newSet.size}`);
              return newSet;
            });
            
            return; // Stop monitoring
            
          } else if (job.status === 'processing') {
            // Update progress if available
            if (job.progress && job.progress.percentage) {
              toast.loading(
                `Processing images: ${job.progress.percentage}% (${job.progress.processed}/${job.progress.total})`,
                { id: 'zip-import' }
              );
            } else {
              toast.loading(`Processing images... (${job.currentStep || 'In progress'})`, { id: 'zip-import' });
            }
            // Continue monitoring
            setTimeout(checkStatus, 2000); // More frequent for processing jobs
            
          } else {
            // Job is queued
            if (job.queuePosition) {
              toast.loading(`Queued for processing (Position: ${job.queuePosition})`, { id: 'zip-import' });
            } else {
              toast.loading('Queued for processing...', { id: 'zip-import' });
            }
            setTimeout(checkStatus, 3000); // Less frequent for queued jobs
          }
        } else {
          throw new Error(result.message || 'Failed to get job status');
        }
      } catch (error) {
        console.error('Job status check error:', error);
        toast.error('Failed to monitor import progress', { id: 'zip-import' });
      }
    };
    
    // Start monitoring
    checkStatus();
  };

  // Sync Azure images with database
  const handleSyncDb = async () => {
    if (!selectedBrand) return;

    // Show confirmation dialog
    const confirmed = window.confirm(`Are you sure you want to sync database with Azure images for brand "${selectedBrand}"?\n\nThis will update product records to match Azure storage.`);
    if (!confirmed) return;

    try {
      toast.loading('Syncing database with Azure images...', { id: 'db-sync' });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/azure/sync-db/${encodeURIComponent(selectedBrand)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to sync database');
      }

      const data = await response.json();
      if (data.success) {
        toast.success(
          `Database synced successfully: ${data.stats.updatedProducts} products updated, ${data.stats.matchedProducts} products matched`,
          { id: 'db-sync', duration: 5000 }
        );
        
        // Update folders state with sync results for instant UI update
        if (data.syncResults && data.syncResults.length > 0) {
          setFolders(prevFolders => {
            return prevFolders.map(folder => {
              // Find sync result for this folder
              const syncResult = data.syncResults.find(result => 
                result.folderName === folder.name || result.partNumber === folder.name
              );
              
              if (syncResult) {
                // Update folder with new sync status
                return {
                  ...folder,
                  imageSynced: syncResult.status === 'updated' || syncResult.status === 'no_change',
                  syncDetails: {
                    ...folder.syncDetails,
                    synced: syncResult.status === 'updated' || syncResult.status === 'no_change',
                    dbUpdated: syncResult.status === 'updated',
                    syncStatus: syncResult.status,
                    lastSyncTime: new Date().toISOString()
                  }
                };
              }
              return folder;
            });
          });
        }
        
        // Also refresh the folders list in background for complete data
        setTimeout(() => {
          fetchBrandFolders(selectedBrand, foldersCurrentPage);
        }, 1000);
      } else {
        throw new Error(data.message || 'Failed to sync database');
      }
    } catch (error) {
      console.error('Error syncing database:', error);
      toast.error(error.message || 'Failed to sync database', { id: 'db-sync' });
      throw error;
    }
  };

  // Upload files to selected folder
  const handleUploadFiles = async (files) => {
    if (!selectedBrand || !selectedFolder || !files.length) return;

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(
        `${API_CONFIG.BASE_URL}/azure/upload-files/${encodeURIComponent(selectedBrand)}/${encodeURIComponent(selectedFolder)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      const data = await response.json();
      if (data.success) {
        const successCount = data.successCount || 0;
        const failureCount = data.failureCount || 0;
        
        if (failureCount > 0) {
          toast.success(`Uploaded ${successCount} files successfully, ${failureCount} failed`);
        } else {
          toast.success(`Uploaded ${successCount} files successfully`);
        }
        
        // Refresh the files list
        fetchFolderFiles(selectedBrand, selectedFolder, filesCurrentPage);
      } else {
        throw new Error(data.message || 'Failed to upload files');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error(error.message || 'Failed to upload files');
      throw error;
    }
  };

  const handleBrandChange = (brandTitle) => {
    setSelectedBrand(brandTitle);
    setSelectedFolder('');
    setFolders([]);
    setFiles([]);
    setFoldersCurrentPage(1);
    setFoldersTotalPages(0);
    setTotalFolders(0);
    setFoldersHasNextPage(false);
    setFoldersHasPreviousPage(false);
    setFilesCurrentPage(1);
    setFilesTotalPages(0);
    setTotalFiles(0);
    setFilesHasNextPage(false);
    setFilesHasPreviousPage(false);
    setIsEstimated(false);
    setCurrentFolderStatus({
      partNumberMatch: false,
      imageSynced: false,
      syncDetails: {}
    });
    setShowBrandDropdown(false);
    setBrandSearchTerm('');
    setCurrentView('folders'); // Change to folders view immediately
    setLoading(true); // Start loading immediately
    if (brandTitle && brandTitle !== 'no-brands') {
      fetchBrandFolders(brandTitle, 1);
    }
  };

  const handleFolderSelect = (folderName) => {
    setSelectedFolder(folderName);
    setFiles([]);
    setFilesCurrentPage(1);
    setFilesTotalPages(0);
    setTotalFiles(0);
    setFilesHasNextPage(false);
    setFilesHasPreviousPage(false);
    setIsEstimated(false);
    setCurrentFolderStatus({
      partNumberMatch: false,
      imageSynced: false,
      syncDetails: {}
    });
    if (selectedBrand && folderName) {
      fetchFolderFiles(selectedBrand, folderName, 1);
    }
  };

  const handleBackToFolders = () => {
    setSelectedFolder('');
    setFiles([]);
    setFilesCurrentPage(1);
    setFilesTotalPages(0);
    setTotalFiles(0);
    setFilesHasNextPage(false);
    setFilesHasPreviousPage(false);
    setIsEstimated(false);
    setCurrentFolderStatus({
      partNumberMatch: false,
      imageSynced: false,
      syncDetails: {}
    });
    setCurrentView('folders');
  };

  const handleBackToBrands = () => {
    setSelectedBrand('');
    setSelectedFolder('');
    setFolders([]);
    setFiles([]);
    setFoldersCurrentPage(1);
    setFoldersTotalPages(0);
    setTotalFolders(0);
    setFoldersHasNextPage(false);
    setFoldersHasPreviousPage(false);
    setFilesCurrentPage(1);
    setFilesTotalPages(0);
    setTotalFiles(0);
    setFilesHasNextPage(false);
    setFilesHasPreviousPage(false);
    setIsEstimated(false);
    setCurrentFolderStatus({
      partNumberMatch: false,
      imageSynced: false,
      syncDetails: {}
    });
    setCurrentView('brands');
  };

  // Folder pagination handlers
  const handleFoldersNextPage = () => {
    if (foldersHasNextPage && selectedBrand) {
      const nextPage = foldersCurrentPage + 1;
      setFoldersCurrentPage(nextPage);
      fetchBrandFolders(selectedBrand, nextPage);
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFoldersPreviousPage = () => {
    if (foldersHasPreviousPage && selectedBrand) {
      const prevPage = foldersCurrentPage - 1;
      setFoldersCurrentPage(prevPage);
      fetchBrandFolders(selectedBrand, prevPage);
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFoldersGoToPage = (page) => {
    if (page >= 1 && page <= foldersTotalPages && selectedBrand) {
      setFoldersCurrentPage(page);
      fetchBrandFolders(selectedBrand, page);
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Files pagination handlers
  const handleFilesNextPage = () => {
    if (filesHasNextPage && selectedBrand && selectedFolder) {
      const nextPage = filesCurrentPage + 1;
      setFilesCurrentPage(nextPage);
      fetchFolderFiles(selectedBrand, selectedFolder, nextPage);
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFilesPreviousPage = () => {
    if (filesHasPreviousPage && selectedBrand && selectedFolder) {
      const prevPage = filesCurrentPage - 1;
      setFilesCurrentPage(prevPage);
      fetchFolderFiles(selectedBrand, selectedFolder, prevPage);
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFilesGoToPage = (page) => {
    if (page >= 1 && page <= filesTotalPages && selectedBrand && selectedFolder) {
      setFilesCurrentPage(page);
      fetchFolderFiles(selectedBrand, selectedFolder, page);
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const clearSelectedBrand = () => {
    setSelectedBrand('');
    setSelectedFolder('');
    setFolders([]);
    setFiles([]);
    setBrandSearchTerm('');
    setCurrentView('brands');
  };



  // Handle dialog open change
  const handleDialogOpenChange = (open) => {
    setShowQueueStatus(open);
  };



  // Filter brands based on search term
  const filteredBrands = brands.filter(brand => {
    const brandName = brand?.title || '';
    return brandName.toLowerCase().includes(brandSearchTerm.toLowerCase());
  });

  const handleBrandSelect = (brand) => {
    const brandTitle = brand?.title || '';
    handleBrandChange(brandTitle);
  };

  // Open file in new tab
  const openFile = (fileUrl) => {
    window.open(fileUrl, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-0 space-y-6">
        <div className="sticky top-16 left-0 lg:left-64 right-0 z-30 bg-background py-2">
          <div className="container mx-auto">
            <div className="flex items-center justify-between gap-2 md:gap-4">
              {/* Left Section - Back Button and Title */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Back Button - Always show */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (currentView === 'files') {
                      handleBackToFolders();
                    } else if (currentView === 'folders') {
                      handleBackToBrands();
                    } else {
                      // On brands view, go back to products dashboard
                      window.history.back();
                    }
                  }}
                  className="h-8 w-8 p-0 hover:bg-muted"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                {/* Title with Breadcrumb */}
                <div className="flex items-center gap-1">
                  <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold truncate">
                    <span className="hidden sm:inline">Product Images</span>
                    <span className="sm:hidden">Images</span>
                  </h1>
                  
                  {/* Breadcrumb Path */}
                  {currentView !== 'brands' && selectedBrand && (
                    <div className="flex items-center gap-1 ml-2">
                      <Slash className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      {currentView === 'folders' ? (
                        <span className="text-sm font-normal truncate max-w-24 sm:max-w-32">{selectedBrand}</span>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBackToFolders}
                          className="text-sm font-normal text-muted-foreground hover:text-foreground p-1 truncate max-w-24 sm:max-w-32"
                        >
                          {selectedBrand}
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {selectedFolder && currentView === 'files' && (
                    <div className="flex items-center gap-1">
                      <Slash className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-normal truncate max-w-24 sm:max-w-32">{selectedFolder}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Section - Import Logs Button */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <Dialog open={showQueueStatus} onOpenChange={handleDialogOpenChange}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="whitespace-nowrap flex-shrink-0 h-9 px-2 sm:px-3 text-xs sm:text-sm"
                      size="sm"
                    >
                      <ListTodo className="h-4 w-4" />
                      <span className="hidden sm:inline ml-2">Import Logs</span>
                    </Button>
                  </DialogTrigger>
                </Dialog>
              </div>
            </div>
          </div>
        </div>



        
        <div className="container mx-auto">
          <div className="grid gap-6">
        {/* Brand Selection Card - Show when no brand is selected */}
        {currentView === 'brands' && (
          <BrandSelectionCard
            brands={brands}
            brandsLoading={brandsLoading}
            showBrandDropdown={showBrandDropdown}
            setShowBrandDropdown={setShowBrandDropdown}
            brandSearchTerm={brandSearchTerm}
            setBrandSearchTerm={setBrandSearchTerm}
            selectedBrand={selectedBrand}
            handleBrandSelect={handleBrandSelect}
            clearSelectedBrand={clearSelectedBrand}
          />
        )}

        {/* Folders Display Card - Show when brand is selected */}
        {currentView === 'folders' && selectedBrand && (
          <FoldersDisplayCard
            selectedBrand={selectedBrand}
            loading={loading}
            folders={folders}
            totalFolders={totalFolders}
            foldersCurrentPage={foldersCurrentPage}
            foldersTotalPages={foldersTotalPages}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleBackToBrands={handleBackToBrands}
            handleFolderSelect={handleFolderSelect}
            handleFoldersPreviousPage={handleFoldersPreviousPage}
            handleFoldersNextPage={handleFoldersNextPage}
            handleFoldersGoToPage={handleFoldersGoToPage}
            foldersHasPreviousPage={foldersHasPreviousPage}
            foldersHasNextPage={foldersHasNextPage}
            foldersPerPage={foldersPerPage}
            formatFileSize={formatFileSize}
            formatDate={formatDate}
            onCreateFolder={handleCreateFolder}
            onZipImport={handleZipImport}
            onSyncDb={handleSyncDb}
          />
        )}

        {/* Files Display Card - Show when folder is selected */}
        {currentView === 'files' && selectedBrand && selectedFolder && (
          <FilesDisplayCard
            selectedBrand={selectedBrand}
            selectedFolder={selectedFolder}
            loading={loading}
            files={files}
            totalFiles={totalFiles}
            filesCurrentPage={filesCurrentPage}
            filesTotalPages={filesTotalPages}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleBackToFolders={handleBackToFolders}
            handleFilesAction={(action, fileUrl) => {
              if (action === 'view') {
                openFile(fileUrl);
              } else if (action === 'download') {
                const link = document.createElement('a');
                link.href = fileUrl;
                link.download = fileUrl.split('/').pop();
                link.click();
              }
            }}
            handleFilesPreviousPage={handleFilesPreviousPage}
            handleFilesNextPage={handleFilesNextPage}
            handleFilesGoToPage={handleFilesGoToPage}
            filesHasPreviousPage={filesHasPreviousPage}
            filesHasNextPage={filesHasNextPage}
            filesPerPage={filesPerPage}
            formatFileSize={formatFileSize}
            formatDate={formatDate}
            getFileIcon={getFileIcon}
            folderStatus={currentFolderStatus}
            onUploadFiles={handleUploadFiles}
          />
        )}
          </div>
        </div>
      </div>

      {/* Sticky Pagination at bottom - Show for folders view */}
      {!loading && currentView === 'folders' && foldersTotalPages > 1 && (
        <div className="sticky bottom-0 bg-background z-20 w-full">
          <div className="w-full py-2">
            <Pagination
              currentPage={foldersCurrentPage}
              totalPages={foldersTotalPages}
              totalItems={totalFolders}
              itemsPerPage={foldersPerPage}
              onPageChange={handleFoldersGoToPage}
              hasNextPage={foldersHasNextPage}
              hasPrevPage={foldersHasPreviousPage}
              startIndex={((foldersCurrentPage - 1) * foldersPerPage) + 1}
              endIndex={Math.min(foldersCurrentPage * foldersPerPage, totalFolders)}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Sticky Pagination at bottom - Show for files view */}
      {!loading && currentView === 'files' && filesTotalPages > 1 && (
        <div className="sticky bottom-0 bg-background z-20 w-full">
          <div className="w-full py-2">
            <Pagination
              currentPage={filesCurrentPage}
              totalPages={filesTotalPages}
              totalItems={totalFiles}
              itemsPerPage={filesPerPage}
              onPageChange={handleFilesGoToPage}
              hasNextPage={filesHasNextPage}
              hasPrevPage={filesHasPreviousPage}
              startIndex={((filesCurrentPage - 1) * filesPerPage) + 1}
              endIndex={Math.min(filesCurrentPage * filesPerPage, totalFiles)}
              className="w-full"
            />
          </div>
        </div>
      )}

      {/* Import Logs Dialog */}
      <ImportLogsDialog
        isOpen={showQueueStatus}
        onOpenChange={handleDialogOpenChange}
        monitoringJobIds={monitoringJobIds}
      />
    </div>
  );
};

export default ProductImagesPage;
