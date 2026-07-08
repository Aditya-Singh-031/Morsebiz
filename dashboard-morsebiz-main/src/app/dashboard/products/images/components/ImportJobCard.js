import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle } from 'lucide-react';

const ImportJobCard = ({ job }) => {
  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-md transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{job.brandName || job.metadata?.brandName}</span>
            <Badge 
              variant="outline"
              className={`text-xs px-1.5 py-0.5 ${
                job.status === 'completed' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700' :
                job.status === 'processing' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700' :
                job.status === 'failed' ? 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700' :
                job.status === 'queued' ? 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700' :
                'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
              }`}
            >
              {job.status}
            </Badge>
          </div>
          
          {/* Time positioned at top right */}
          <span className="text-xs text-muted-foreground">
            {new Date(job.updatedAt || job.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          {job.metadata?.originalFileName && (
            <span className="truncate">{job.metadata.originalFileName}</span>
          )}
          {job.metadata?.fileSize && (
            <span>• {(job.metadata.fileSize / (1024 * 1024)).toFixed(1)}MB</span>
          )}
          {job.queuePosition && (
            <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-muted dark:bg-muted">
              #{job.queuePosition}
            </Badge>
          )}
        </div>
        
        {job.progress && (
          <div className="mt-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
              <span>{job.progress.processed || 0}/{job.progress.total || 0} files</span>
              <span className="font-medium">{job.progress.percentage || 0}%</span>
            </div>
            
            {/* Progress bar with 100% width */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  job.status === 'completed' ? 'bg-green-500 dark:bg-green-400' :
                  job.status === 'processing' ? 'bg-blue-500 dark:bg-blue-400' :
                  job.status === 'failed' ? 'bg-red-500 dark:bg-red-400' :
                  'bg-gray-400 dark:bg-gray-500'
                }`}
                style={{ width: `${job.progress.percentage || 0}%` }}
              ></div>
            </div>
            
            {/* Success/Failure counts with icons */}
            {job.progress.successCount !== undefined && (
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-3 h-3" />
                  <span>{job.progress.successCount}</span>
                </div>
                <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                  <XCircle className="w-3 h-3" />
                  <span>{job.progress.failureCount || 0}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportJobCard;