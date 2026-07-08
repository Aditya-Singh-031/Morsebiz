import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, ListTodo } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import API_CONFIG from '@/config/api';
import ImportJobCard from './ImportJobCard';
import Pagination from './Pagination';

const ImportLogsDialog = ({ 
  isOpen, 
  onOpenChange, 
  monitoringJobIds 
}) => {
  const token = useSelector((state) => state.auth.token);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [startIndex, setStartIndex] = useState(0);
  const [endIndex, setEndIndex] = useState(0);
  
  // Data state
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  // Fetch jobs with pagination
  const fetchJobs = async (page = 1, force = false) => {
    try {
      // Check if we need to fetch (cache for 10 seconds unless forced)
      const now = Date.now();
      if (!force && lastFetchTime && (now - lastFetchTime) < 10000 && page === currentPage) {
        return;
      }

      setLoading(true);
      
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/api/image-import-queue/jobs?page=${page}&limit=${itemsPerPage}&includeHistory=true&includeActive=true`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      if (data.success) {
        const pagination = data.data.pagination;
        
        console.log('Pagination API Response:', {
          page: page,
          requestedPage: page,
          receivedPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalJobs: pagination.totalJobs,
          jobsReceived: data.data.jobs?.length || 0
        });
        
        setJobs(data.data.jobs || []);
        setCurrentPage(pagination.currentPage);
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.totalJobs);
        setHasNextPage(pagination.hasNextPage);
        setHasPrevPage(pagination.hasPrevPage);
        setStartIndex(pagination.startIndex);
        setEndIndex(pagination.endIndex);
        setLastFetchTime(now);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    console.log(`Page change requested: ${page}, Current: ${currentPage}, Total: ${totalPages}`);
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      setCurrentPage(page); // Update state immediately for UI responsiveness
      fetchJobs(page, true);
    }
  };

  // Update individual job status (same API as toast)
  const updateJobStatus = async (jobId) => {
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
        const updatedJob = result.data;
        
        // Update the specific job in the jobs array
        setJobs(prevJobs => 
          prevJobs.map(job => 
            job.jobId === jobId 
              ? { ...job, ...updatedJob, updatedAt: new Date().toISOString() }
              : job
          )
        );
        
        // Update last fetch time to show activity
        setLastFetchTime(Date.now());
        
        return updatedJob;
      }
    } catch (error) {
      console.error(`Error updating job ${jobId} status:`, error);
    }
    return null;
  };

  // Fetch jobs when dialog opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1); // Reset to first page when dialog opens
      fetchJobs(1, true);
    }
  }, [isOpen]);

  // Refresh jobs list when new jobs are being monitored (but not on every size change)
  useEffect(() => {
    if (isOpen && monitoringJobIds.size > 0) {
      // Only fetch if we have monitoring jobs but they're not in our current jobs list
      const currentJobIds = new Set(jobs.map(job => job.jobId));
      const hasNewMonitoredJobs = Array.from(monitoringJobIds).some(id => !currentJobIds.has(id));
      
      if (hasNewMonitoredJobs) {
        console.log('New monitored jobs detected, refreshing list');
        fetchJobs(currentPage, true);
      }
    }
  }, [monitoringJobIds.size]);

  // Smart status updates - only update active jobs individually
  useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(async () => {
      // Get active jobs that need status updates
      const activeJobs = jobs.filter(job => 
        job.status === 'processing' || job.status === 'queued' || job.status === 'retrying'
      );
      
      // Also update monitored jobs
      const monitoredJobIds = Array.from(monitoringJobIds);
      const allJobsToUpdate = [
        ...activeJobs.map(job => job.jobId),
        ...monitoredJobIds
      ];
      
      // Remove duplicates
      const uniqueJobIds = [...new Set(allJobsToUpdate)];
      
      if (uniqueJobIds.length > 0) {
        console.log(`Updating status for ${uniqueJobIds.length} active jobs`);
        
        // Update each job individually using the same API as toast
        await Promise.all(
          uniqueJobIds.map(jobId => updateJobStatus(jobId))
        );
      }
    }, 3000); // Update every 3 seconds for active jobs

    return () => clearInterval(interval);
  }, [isOpen, jobs, monitoringJobIds]);
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[100vw] h-[100vh] max-w-none max-h-none m-0 rounded-none sm:max-w-6xl sm:w-full sm:max-h-[85vh] sm:rounded-lg sm:m-auto overflow-hidden flex flex-col">
        <DialogHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Import Logs
          </DialogTitle>
          <div className="flex items-center gap-4 pr-8">
            {lastFetchTime && (
              <span className="text-xs text-muted-foreground">
                Last updated: {new Date(lastFetchTime).toLocaleTimeString()}
              </span>
            )}
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1 min-h-0">
          {loading ? (
            <div className="flex items-center justify-center py-4 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading import jobs...
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No import jobs found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {jobs.map((job) => (
                <ImportJobCard key={job.jobId} job={job} />
              ))}
            </div>
          )}
        </div>
        
        {/* Sticky Footer with Pagination and Monitoring Status */}
        <div className="sticky bottom-0 bg-background border-t border-border px-4 sm:px-6 py-3 space-y-3">
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              startIndex={startIndex}
              endIndex={endIndex}
              className="w-full"
            />
          )}
          
          {/* Monitoring Status */}
          {monitoringJobIds.size > 0 && (
            <div className="flex items-center justify-center">
              <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm font-medium">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Monitoring {monitoringJobIds.size} job{monitoringJobIds.size !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImportLogsDialog;