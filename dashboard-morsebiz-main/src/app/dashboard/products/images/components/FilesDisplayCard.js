import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, File, ArrowLeft, Calendar, Download, Eye, ChevronLeft, ChevronRight, Upload, ImagePlus } from 'lucide-react';
import { FileListSkeleton } from './Skeletons';
import { useState, useRef } from 'react';

const FilesDisplayCard = ({
  selectedBrand,
  selectedFolder,
  loading,
  files,
  totalFiles,
  filesCurrentPage,
  filesTotalPages,
  searchTerm,
  setSearchTerm,
  handleBackToFolders,
  handleFilesAction,
  handleFilesPreviousPage,
  handleFilesNextPage,
  handleFilesGoToPage,
  filesHasPreviousPage,
  filesHasNextPage,
  filesPerPage,
  formatFileSize,
  formatDate,
  getFileIcon,
  folderStatus, // New prop for folder status
  onUploadFiles // New prop for file upload
}) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      await onUploadFiles(selectedFiles);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  };
  // Filter files based on search term
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <div className="space-y-4 sm:space-y-3">
          {/* First Row - Upload Button and Search (Mobile: Stack, Desktop: Space Between) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Upload Files Button */}
              <Button
                variant="default"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1 w-full sm:w-auto"
              >
                <ImagePlus className="h-4 w-4" />
                {isUploading ? 'Uploading...' : 'Upload Images'}
              </Button>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
            
            {/* Search Input */}
            {files.length > 0 && (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
                />
              </div>
            )}
          </div>

          {/* Second Row - Title and Status */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div>
              <CardTitle className="flex flex-wrap items-center gap-2">
                <File className="h-5 w-5" />
                <span>Files ({totalFiles} total)</span>
              </CardTitle>
              {/* Results info - Show pagination details */}
              {filesTotalPages > 1 && (
                <div className="text-sm text-muted-foreground mt-2">
                  Showing {((filesCurrentPage - 1) * filesPerPage) + 1}-{Math.min(filesCurrentPage * filesPerPage, totalFiles)} of {totalFiles} results
                </div>
              )}
            </div>
            
            {/* Status badges for current folder */}
            {folderStatus && (
              <div className="flex flex-wrap gap-2">
                <Badge 
                  variant={folderStatus.partNumberMatch ? "default" : "destructive"}
                  className="text-xs"
                >
                  {folderStatus.partNumberMatch ? "✓ Part Match" : "✗ No Match"}
                </Badge>
                <Badge 
                  variant={folderStatus.imageSynced ? "default" : "secondary"}
                  className="text-xs"
                >
                  {folderStatus.imageSynced ? "✓ Synced" : "⚠ Not Synced"}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
        {/* Sync Details Summary */}
        {folderStatus && folderStatus.syncDetails && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Sync Status Details</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Azure Files:</span>
                <div className="font-medium">{folderStatus.syncDetails.azureCount || 0}</div>
              </div>
              <div>
                <span className="text-muted-foreground">DB Images:</span>
                <div className="font-medium">{folderStatus.syncDetails.dbCount || 0}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Missing in Azure:</span>
                <div className="font-medium text-red-600">
                  {folderStatus.syncDetails.missingInAzure?.length || 0}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Missing in DB:</span>
                <div className="font-medium text-orange-600">
                  {folderStatus.syncDetails.missingInDb?.length || 0}
                </div>
              </div>
            </div>
            
            {/* Show missing files details */}
            {(folderStatus.syncDetails.missingInAzure?.length > 0 || folderStatus.syncDetails.missingInDb?.length > 0) && (
              <div className="mt-3 pt-3 border-t">
                {folderStatus.syncDetails.missingInAzure?.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-red-600 font-medium">Missing in Azure:</span>
                    <div className="text-xs text-muted-foreground">
                      {folderStatus.syncDetails.missingInAzure.join(', ')}
                    </div>
                  </div>
                )}
                {folderStatus.syncDetails.missingInDb?.length > 0 && (
                  <div>
                    <span className="text-xs text-orange-600 font-medium">Missing in DB:</span>
                    <div className="text-xs text-muted-foreground">
                      {folderStatus.syncDetails.missingInDb.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {loading ? (
          <FileListSkeleton count={12} />
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No files found in this folder</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No files match your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {filteredFiles.map((file, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      {getFileIcon(file.name)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate" title={file.name}>
                          {file.name}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center justify-between">
                        <span>Size:</span>
                        <span>{formatFileSize(file.size)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(file.lastModified)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFilesAction('view', file.url)}
                        className="flex-1 flex items-center gap-1 text-xs"
                      >
                        <Eye className="h-3 w-3" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFilesAction('download', file.url)}
                        className="flex-1 flex items-center gap-1 text-xs"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            

          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FilesDisplayCard;