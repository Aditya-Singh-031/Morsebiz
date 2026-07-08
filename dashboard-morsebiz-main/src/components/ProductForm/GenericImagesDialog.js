import React, { useState, useEffect } from 'react';
import { Search, Image as ImageIcon, Loader2, Upload, Plus, Pencil, Trash2, X, Check, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import ConfirmDialog from '@/components/ConfirmDialog';
import config from '@/config/config';
import Cookies from 'js-cookie';

const GenericImagesDialog = ({ 
  isOpen, 
  onClose, 
  onImageSelect,
  selectedImages = []
}) => {
  const [genericImages, setGenericImages] = useState([]);
  const [filteredImages, setFilteredImages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [selectedGenericImages, setSelectedGenericImages] = useState([]);
  
  // Upload state
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Edit state
  const [editingImageId, setEditingImageId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete state
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch generic images from API
  const fetchGenericImages = async (page = 1, search = '', loadMore = false) => {
    if (loadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }
    setError(null);
    
    try {
      const token = Cookies.get('adminToken');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search })
      });

      const response = await fetch(
        `${config.API_BASE_URL}/api/dashboard/generic-images?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const newImages = result.data.images || [];
        if (loadMore) {
          // Append new images to existing ones
          setGenericImages(prev => [...prev, ...newImages]);
          setFilteredImages(prev => [...prev, ...newImages]);
        } else {
          // Replace images (for initial load or search)
          setGenericImages(newImages);
          setFilteredImages(newImages);
        }
        setPagination(result.data.pagination || pagination);
      } else {
        throw new Error(result.message || 'Failed to fetch generic images');
      }
      
    } catch (err) {
      console.error('Error fetching generic images:', err);
      setError(err.message);
      toast.error('Failed to load generic images');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Load images when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchGenericImages(1, searchTerm);
      setSelectedGenericImages([]);
      setIsUploadMode(false);
      setUploadFile(null);
      setUploadTitle('');
      setEditingImageId(null);
      setEditTitle('');
    }
  }, [isOpen]);

  // Handle search
  useEffect(() => {
    if (searchTerm.trim()) {
      const debounceTimer = setTimeout(() => {
        fetchGenericImages(1, searchTerm.trim());
      }, 500);
      
      return () => clearTimeout(debounceTimer);
    } else {
      fetchGenericImages(1, '');
    }
  }, [searchTerm]);

  // Handle image selection
  const handleImageSelect = (image) => {
    if (editingImageId) return; // Don't select if editing
    
    setSelectedGenericImages(prev => {
      const isSelected = prev.some(img => img._id === image._id);
      if (isSelected) {
        return prev.filter(img => img._id !== image._id);
      } else {
        return [...prev, image];
      }
    });
  };

  // Handle load more
  const handleLoadMore = () => {
    if (pagination.hasNextPage && !isLoadingMore) {
      fetchGenericImages(pagination.page + 1, searchTerm, true);
    }
  };

  // Handle confirm selection
  const handleConfirmSelection = () => {
    if (selectedGenericImages.length === 0) {
      return;
    }

    // Convert selected images to the format expected by ProductImageUploader
    const imagesToAdd = selectedGenericImages.map((img, index) => ({
      imageId: `generic-${img._id}-${Date.now()}-${index}`,
      originalName: `${img.title}.jpg`, // Use title as filename
      imageUrl: img.image,
      isExisting: false,
      isGeneric: true,
      genericImageId: img._id
    }));

    onImageSelect(imagesToAdd);
    onClose();
  };

  // Check if image is already selected in product
  const isImageAlreadyInProduct = (imageUrl) => {
    return selectedImages.some(img => img.imageUrl === imageUrl || img === imageUrl);
  };

  // Handle file change for upload
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      // Auto-set title from filename if empty
      if (!uploadTitle) {
        const fileName = e.target.files[0].name.replace(/\.[^/.]+$/, "");
        setUploadTitle(fileName);
      }
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      toast.error('Please select an image and enter a title');
      return;
    }

    setIsUploading(true);
    try {
      const token = Cookies.get('adminToken');
      const formData = new FormData();
      formData.append('image', uploadFile);
      formData.append('title', uploadTitle.trim());

      const response = await fetch(`${config.API_BASE_URL}/api/dashboard/generic-images/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload image');
      }

      toast.success('Image uploaded successfully');
      
      // Reset form and switch back to list
      setUploadFile(null);
      setUploadTitle('');
      setIsUploadMode(false);
      
      // Refresh list
      fetchGenericImages(1, '', false);
      
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  // Start editing
  const startEditing = (e, image) => {
    e.stopPropagation();
    setEditingImageId(image._id);
    setEditTitle(image.title);
  };

  // Cancel editing
  const cancelEditing = (e) => {
    if (e) e.stopPropagation();
    setEditingImageId(null);
    setEditTitle('');
  };

  // Save edit
  const saveEdit = async (e) => {
    e.stopPropagation();
    if (!editTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    setIsUpdating(true);
    try {
      const token = Cookies.get('adminToken');
      const response = await fetch(`${config.API_BASE_URL}/api/dashboard/generic-images/${editingImageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: editTitle.trim() })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update image');
      }

      toast.success('Image updated successfully');
      
      // Update local state
      setGenericImages(prev => prev.map(img => 
        img._id === editingImageId ? { ...img, title: editTitle.trim() } : img
      ));
      setFilteredImages(prev => prev.map(img => 
        img._id === editingImageId ? { ...img, title: editTitle.trim() } : img
      ));
      
      cancelEditing();
      
    } catch (err) {
      console.error('Update error:', err);
      toast.error(err.message || 'Failed to update image');
    } finally {
      setIsUpdating(false);
    }
  };

  // Confirm delete
  const confirmDelete = (e, image) => {
    e.stopPropagation();
    setImageToDelete(image);
  };

  // Perform delete
  const handleDelete = async () => {
    if (!imageToDelete) return;

    setIsDeleting(true);
    try {
      const token = Cookies.get('adminToken');
      const response = await fetch(`${config.API_BASE_URL}/api/dashboard/generic-images/${imageToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete image');
      }

      toast.success('Image deleted successfully');
      
      // Update local state
      setGenericImages(prev => prev.filter(img => img._id !== imageToDelete._id));
      setFilteredImages(prev => prev.filter(img => img._id !== imageToDelete._id));
      
      // Also remove from selected if present
      setSelectedGenericImages(prev => prev.filter(img => img._id !== imageToDelete._id));
      
      setImageToDelete(null);
      
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete image');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {isUploadMode && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setIsUploadMode(false)}
                    className="h-8 w-8 -ml-2 hover:bg-gray-100 rounded-full"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <div className="grid gap-1 text-left">
                <DialogTitle>
                  {isUploadMode ? 'Upload New Generic Image' : 'Select Generic Images'}
                </DialogTitle>
                <DialogDescription>
                  {isUploadMode 
                    ? 'Upload a new generic image to the library' 
                    : 'Choose from pre-uploaded generic car part images to add to your product'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col space-y-4">
            {isUploadMode ? (
              <div className="flex flex-col gap-6 p-4 max-w-md mx-auto w-full overflow-y-auto">
                 
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Image Title</label>
                   <Input 
                     value={uploadTitle}
                     onChange={(e) => setUploadTitle(e.target.value)}
                     placeholder="e.g. AC Condensor"
                   />
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-sm font-medium">Image File</label>
                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors relative">
                     <input 
                       type="file" 
                       accept="image/*"
                       className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                       onChange={handleFileChange}
                     />
                     {uploadFile ? (
                       <div className="relative z-10 flex flex-col items-center">
                          <img 
                            src={URL.createObjectURL(uploadFile)} 
                            alt="Preview" 
                            className="h-32 w-32 object-cover rounded-md mb-2 shadow-sm"
                          />
                          <p className="text-sm font-medium text-gray-900">{uploadFile.name}</p>
                          <p className="text-xs text-gray-500">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadFile(null);
                            }}
                          >
                            Remove
                          </Button>
                       </div>
                     ) : (
                       <div className="flex flex-col items-center gap-2 text-gray-500">
                         <Upload className="h-8 w-8" />
                         <p className="text-sm font-medium">Click to upload or drag and drop</p>
                         <p className="text-xs">JPG, PNG, WebP (max. 10MB)</p>
                       </div>
                     )}
                   </div>
                 </div>

                 <Button 
                   onClick={handleUpload} 
                   disabled={!uploadFile || !uploadTitle.trim() || isUploading}
                   className="w-full mt-4"
                 >
                   {isUploading ? (
                     <>
                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                       Uploading...
                     </>
                   ) : (
                     'Upload Image'
                   )}
                 </Button>
              </div>
            ) : (
              <>
                {/* Search Bar and Upload Button */}
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search generic images by title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => setIsUploadMode(true)}
                    className="gap-2 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    Upload New
                  </Button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                    {error}
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="grid grid-cols-2 gap-4 p-2">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <div key={`skeleton-${index}`} className="rounded-lg border-2 border-gray-200 overflow-hidden">
                        <Skeleton className="aspect-square w-full" />
                        <div className="p-3 bg-white">
                          <Skeleton className="h-12 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Images Grid */}
                {!isLoading && filteredImages.length > 0 && (
                  <div className="flex-1 overflow-y-auto">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 p-2">
                        {filteredImages.map((image) => {
                          const isSelected = selectedGenericImages.some(img => img._id === image._id);
                          const isAlreadyInProduct = isImageAlreadyInProduct(image.image);
                          const isEditing = editingImageId === image._id;
                          
                          return (
                            <div 
                              key={image._id} 
                              className={`relative group transition-all duration-200 rounded-lg border-2 overflow-hidden ${
                                isSelected 
                                  ? 'border-blue-500 shadow-lg scale-[1.02]' 
                                  : isAlreadyInProduct 
                                    ? 'opacity-50 cursor-not-allowed border-gray-200' 
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                              }`}
                              onClick={() => !isAlreadyInProduct && !isEditing && handleImageSelect(image)}
                            >
                              {/* Image */}
                              <div className="aspect-square bg-gray-100 overflow-hidden cursor-pointer">
                                <img
                                  src={image.image}
                                  alt={image.title}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                                  onError={(e) => {
                                    e.target.src = '/images/no-image.png';
                                  }}
                                />
                              </div>
                              
                              {/* Title and Actions */}
                              <div className="p-3 bg-white border-t border-gray-100">
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <Input 
                                      value={editTitle}
                                      onChange={(e) => setEditTitle(e.target.value)}
                                      className="h-8 text-xs px-2"
                                      autoFocus
                                      onClick={(e) => e.stopPropagation()}
                                      onKeyDown={(e) => {
                                        e.stopPropagation();
                                        if (e.key === 'Enter') saveEdit(e);
                                        if (e.key === 'Escape') cancelEditing(e);
                                      }}
                                    />
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 shrink-0"
                                      onClick={saveEdit}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="ghost" 
                                      className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-50 shrink-0"
                                      onClick={cancelEditing}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-medium text-gray-700 leading-tight flex-1">
                                      <span className="line-clamp-2" title={image.title}>
                                        {image.title}
                                      </span>
                                    </div>
                                    
                                    {!isAlreadyInProduct && (
                                      <div className="flex gap-1">
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                          onClick={(e) => startEditing(e, image)}
                                        >
                                          <Pencil className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button 
                                          size="icon" 
                                          variant="ghost" 
                                          className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={(e) => confirmDelete(e, image)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Selection Indicator */}
                              {isSelected && !isEditing && (
                                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg pointer-events-none">
                                  ✓
                                </div>
                              )}
                              
                              {/* Already in Product Indicator */}
                              {isAlreadyInProduct && (
                                <div className="absolute top-2 right-2 bg-gray-500 text-white rounded px-2 py-1 text-xs shadow-lg pointer-events-none">
                                  Added
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Load More Button or Loading Skeleton - Right after images */}
                      {pagination.hasNextPage && (
                        <div className="px-2 pb-2">
                          {isLoadingMore ? (
                            <div className="grid grid-cols-2 gap-4">
                              {Array.from({ length: 6 }).map((_, index) => (
                                <div key={`skeleton-${index}`} className="rounded-lg border-2 border-gray-200 overflow-hidden">
                                  <Skeleton className="aspect-square w-full" />
                                  <div className="p-3 bg-white">
                                    <Skeleton className="h-12 w-full" />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex justify-center py-4">
                              <Button
                                variant="outline"
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="flex items-center gap-2"
                              >
                                Load More
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {!isLoading && filteredImages.length === 0 && !error && (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <ImageIcon className="h-12 w-12 mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No images found</p>
                    <p className="text-sm">
                      {searchTerm ? 'Try adjusting your search terms' : 'No generic images available'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!isUploadMode && (
            <DialogFooter className="flex items-center justify-end">
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmSelection}
                  disabled={selectedGenericImages.length === 0}
                >
                  Add Selected Images ({selectedGenericImages.length})
                </Button>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Image"
        description={
          <span>
            Are you sure you want to delete <strong>{imageToDelete?.title}</strong>? This action cannot be undone and will remove the image permanently.
          </span>
        }
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  );
};

export default GenericImagesDialog;