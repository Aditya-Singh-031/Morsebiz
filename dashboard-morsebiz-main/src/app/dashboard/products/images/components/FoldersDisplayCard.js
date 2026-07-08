import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, Folder, ArrowLeft, Calendar, ChevronLeft, ChevronRight, Plus, FolderPlus, Upload, RefreshCw } from 'lucide-react';
import { FolderGridSkeleton } from './Skeletons';
import Pagination from './Pagination';
import { useState } from 'react';

const FoldersDisplayCard = ({
  selectedBrand,
  loading,
  folders,
  totalFolders,
  foldersCurrentPage,
  foldersTotalPages,
  searchTerm,
  setSearchTerm,
  handleBackToBrands,
  handleFolderSelect,
  handleFoldersPreviousPage,
  handleFoldersNextPage,
  handleFoldersGoToPage,
  foldersHasPreviousPage,
  foldersHasNextPage,
  foldersPerPage,
  formatFileSize,
  formatDate,
  onCreateFolder, // New prop for folder creation
  onZipImport, // New prop for ZIP import
  onSyncDb // New prop for DB sync
}) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    setIsCreating(true);
    try {
      await onCreateFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating folder:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleZipImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.zip')) {
      alert('Please select a ZIP file');
      return;
    }
    
    setIsImporting(true);
    try {
      await onZipImport(file);
      // Reset the file input
      event.target.value = '';
    } catch (error) {
      console.error('Error importing ZIP:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSyncDb = async () => {
    setIsSyncing(true);
    try {
      await onSyncDb();
    } catch (error) {
      console.error('Error syncing DB:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        {/* Action Buttons Row - Show only when not loading */}
        {!loading && (
          <div className="space-y-3">
            {/* Action Buttons and Search Row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              {/* Left side - Action Buttons */}
              <div className="w-full overflow-hidden -mx-2 px-2 sm:mx-0 sm:px-0 sm:w-auto">
                <div className="flex gap-1.5 overflow-x-auto pb-2 sm:gap-2 sm:overflow-x-visible sm:pb-0" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
            {/* Create Folder Button */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="flex items-center gap-1 justify-center whitespace-nowrap px-2 py-1.5 text-sm h-8 cursor-pointer"
                >
                  <FolderPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Create Folder</span>
                  <span className="sm:hidden">Create</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Folder in {selectedBrand}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="folderName">Part Number / Folder Name</Label>
                    <Input
                      id="folderName"
                      placeholder="Enter part number (e.g., 12345A678B)"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isCreating) {
                          handleCreateFolder();
                        }
                      }}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Only letters, numbers, hyphens, and underscores are allowed
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateFolder}
                      disabled={!newFolderName.trim() || isCreating}
                      className="flex-1"
                    >
                      {isCreating ? 'Creating...' : 'Create Folder'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        setNewFolderName('');
                      }}
                      disabled={isCreating}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Import ZIP Button */}
            <div className="relative">
              <input
                type="file"
                accept=".zip"
                onChange={handleZipImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isImporting}
              />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1 justify-center whitespace-nowrap px-2 py-1.5 text-sm h-8 cursor-pointer"
                disabled={isImporting}
              >
                <Upload className="h-4 w-4" />
                {isImporting ? (
                  <span className="hidden sm:inline">Importing...</span>
                ) : (
                  <>
                    <span className="hidden sm:inline">Import ZIP</span>
                    <span className="sm:hidden">Import</span>
                  </>
                )}
              </Button>
            </div>

            {/* Sync DB Button */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1 justify-center whitespace-nowrap px-2 py-1.5 text-sm h-8 cursor-pointer"
              onClick={handleSyncDb}
              disabled={isSyncing}
            >
              <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? (
                <span className="hidden sm:inline">Syncing...</span>
              ) : (
                <>
                  <span className="hidden sm:inline">Sync DB</span>
                  <span className="sm:hidden">Sync</span>
                </>
              )}
            </Button>
                </div>
              </div>
              
              {/* Right side - Search Input (only on larger screens when folders exist) */}
              {folders.length > 0 && (
                <div className="hidden sm:flex items-center gap-2 min-w-0 flex-1 max-w-xs">
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <Input
                    placeholder="Search folders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>
              )}
            </div>

            {/* Mobile Search Input (only on small screens) */}
            {folders.length > 0 && (
              <div className="flex items-center gap-2 sm:hidden">
                <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Input
                  placeholder="Search folders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}

        {/* Title - Show only when not loading */}
        {!loading && (
          <div>
            <CardTitle className="flex items-center gap-2 mt-4">
              <Folder className="h-5 w-5" />
              ({totalFolders}) Folders
            </CardTitle>
            {/* Results info - Show pagination details */}
            {foldersTotalPages > 1 && (
              <div className="text-sm text-muted-foreground mt-2">
                Showing {((foldersCurrentPage - 1) * foldersPerPage) + 1}-{Math.min(foldersCurrentPage * foldersPerPage, totalFolders)} of {totalFolders} results
              </div>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-3 pb-3 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
        {loading ? (
          <FolderGridSkeleton count={8} />
        ) : folders.length === 0 ? (
          <div className="text-center py-8">
            <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No folders found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No folders match your search criteria.' : 'Get started by creating your first folder.'}
            </p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex items-center gap-2"
            >
              <FolderPlus className="h-4 w-4" />
              Create Folder
            </Button>
          </div>
        ) : (
          <>
            {/* Grid Layout for Folders - Responsive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {folders
                .filter((folder) =>
                  folder.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((folder) => (
                  <div
                    key={folder.name}
                    className="border rounded-lg p-3 hover:bg-accent cursor-pointer transition-colors group"
                    onClick={() => handleFolderSelect(folder.name)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate group-hover:text-primary text-sm" title={folder.name}>
                          {folder.name}
                        </h3>
                        <div className="flex flex-wrap gap-1 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {folder.fileCount}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {formatFileSize(folder.totalSize)}
                          </Badge>
                          {/* Part Match Badge - Always show */}
                          <Badge 
                            variant={folder.partNumberMatch ? "default" : "destructive"} 
                            className={`text-xs ${
                              folder.partNumberMatch 
                                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {folder.partNumberMatch ? 'Part Match' : 'No Match'}
                          </Badge>
                          {/* Synced Badge - Always show */}
                          <Badge 
                            variant={folder.imageSynced ? "default" : "destructive"} 
                            className={`text-xs ${
                              folder.imageSynced 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                            }`}
                          >
                            {folder.imageSynced ? 'Synced' : 'Not Synced'}
                          </Badge>
                        </div>
                      </div>
                      <Folder className="h-6 w-6 text-muted-foreground group-hover:text-primary ml-2 flex-shrink-0" />
                    </div>

                    <div className="space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Files:</span>
                        <span>{folder.fileCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span>{formatFileSize(folder.totalSize)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>DB/Azure:</span>
                        <span>{folder.dbCount || 0}/{folder.fileCount}</span>
                      </div>
                      {folder.syncDetails && (
                        <div className="flex justify-between">
                          <span>Missing:</span>
                          <span title={`Azure: ${(folder.syncDetails.missingInAzure || []).join(', ')}\nDB: ${(folder.syncDetails.missingInDb || []).join(', ')}`}>
                            A:{(folder.syncDetails.missingInAzure || []).length} D:{(folder.syncDetails.missingInDb || []).length}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Modified:</span>
                        <span>{formatDate(folder.lastModified)}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
            

          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FoldersDisplayCard;