import React, { useState, useRef,useEffect, useCallback,} from 'react';
import { Upload, X, Image as ImageIcon, Loader2, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';
import Cookies from 'js-cookie';
import config from '@/config/config';
import GenericImagesDialog from '../ProductForm/GenericImagesDialog';

const ProductImageUploader = ({ 
    partNumber, 
    brand, 
    productId, 
    existingImages = [],
    onImagesChange,
    multiple = true,
    maxFiles = 10 
}) => {
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadedImages, setUploadedImages] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [imageErrors, setImageErrors] = useState({});
    const [confirmDialog, setConfirmDialog] = useState({ open: false, type: '', index: null, imageId: null });
    const [isGenericImagesDialogOpen, setIsGenericImagesDialogOpen] = useState(false);
    const fileInputRef = useRef(null);
    
    const FALLBACK_IMAGE_SRC = '/images/no-image.png';

    // Initialize uploaded images from existing images
    useEffect(() => {
        if (existingImages && existingImages.length > 0) {
            const formattedImages = existingImages.map((imageName, index) => {
                // Check if imageName is already a full URL
                let imageUrl;
                if (imageName.startsWith('http')) {
                    imageUrl = imageName;
                } else {
                    // Construct proper Azure blob URL using brand and partNumber
                    imageUrl = `${config.STORAGE_URL}/${brand}/${partNumber}/${imageName}`;
                }
                
                return {
                    imageId: `existing-${index}`,
                    originalName: imageName,
                    imageUrl: imageUrl,
                    isExisting: true
                };
            });
            setUploadedImages(formattedImages);
        }
    }, [existingImages, brand, partNumber]);

    const handleImageError = (imageUrl) => {
        setImageErrors(prev => ({
            ...prev,
            [imageUrl]: true
        }));
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    const handleFiles = (files) => {
        if (!files || files.length === 0) return;

        // Check if brand is selected before allowing file selection
        if (!brand || brand.trim() === '') {
            return;
        }

        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                return false;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        const currentCount = uploadedImages.length + selectedFiles.length;
        const totalAfterSelection = currentCount + validFiles.length;

        if (totalAfterSelection > maxFiles) {
            return;
        }

        // Add files to selected files instead of uploading immediately
        setSelectedFiles(prev => [...prev, ...validFiles]);
    };

    // Handle generic images selection
    const handleGenericImagesSelect = (genericImages) => {
        const currentCount = uploadedImages.length + selectedFiles.length;
        const totalAfterSelection = currentCount + genericImages.length;

        if (totalAfterSelection > maxFiles) {
            return;
        }

        // Add generic images to uploaded images
        setUploadedImages(prev => [...prev, ...genericImages]);
        
        // Update the parent component with the new images
        if (onImagesChange) {
            const updatedImages = [...uploadedImages, ...genericImages];
            const imageUrls = updatedImages.map(img => {
                // Return the image URL or original name based on the format expected
                return img.imageUrl || img.originalName;
            });
            onImagesChange(imageUrls);
        }
    };

    // Upload selected files function
    const uploadSelectedFiles = async () => {
        if (selectedFiles.length === 0) {
            return;
        }

        if (!partNumber || !brand) {
            return;
        }

        setIsUploading(true);
        const token = Cookies.get('adminToken');

        try {
            // Upload each file
            const uploadPromises = selectedFiles.map(async (file, index) => {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('partNumber', partNumber);
                formData.append('brand', brand);

                const fileId = `file-${Date.now()}-${index}`;
                setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

                const xhr = new XMLHttpRequest();

                return new Promise((resolve, reject) => {
                    xhr.upload.onprogress = function(e) {
                        if (e.lengthComputable) {
                            const percentComplete = (e.loaded / e.total) * 100;
                            setUploadProgress(prev => ({ ...prev, [fileId]: percentComplete }));
                        }
                    };

                    xhr.onload = function() {
                        if (xhr.status === 200) {
                            const response = JSON.parse(xhr.responseText);
                            if (response.success) {
                                const newImage = {
                                    imageId: `instant-${Date.now()}-${index}`,
                                    originalName: response.data.originalName,
                                    filename: response.data.filename,
                                    imageUrl: response.data.imageUrl,
                                    isExisting: false
                                };

                                // Add to uploaded images immediately
                                setUploadedImages(prev => [...prev, newImage]);
                                
                                // Remove progress for this file
                                setUploadProgress(prev => {
                                    const newProgress = { ...prev };
                                    delete newProgress[fileId];
                                    return newProgress;
                                });

                                resolve(response.data.imageUrl);
                            } else {
                                reject(new Error(response.message));
                            }
                        } else {
                            reject(new Error(`Upload failed with status ${xhr.status}`));
                        }
                    };

                    xhr.onerror = function() {
                        reject(new Error('Upload failed'));
                    };

                    xhr.open('POST', buildApiUrl(API_ENDPOINTS.PRODUCT_IMAGES_INSTANT_UPLOAD));
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                    xhr.send(formData);
                });
            });

            // Wait for all uploads to complete
            const uploadedImageUrls = await Promise.all(uploadPromises);
            
            // Update onImagesChange with all image URLs
            const allImageUrls = [...existingImages, ...uploadedImageUrls];
            onImagesChange && onImagesChange(allImageUrls);

            toast.success(`Successfully uploaded ${selectedFiles.length} image${selectedFiles.length > 1 ? 's' : ''}`);
            
            // Clear selected files after successful upload
            setSelectedFiles([]);

        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
            setUploadProgress({});
        }
    };

    // Remove selected file function with confirmation
    const removeSelectedFile = (index) => {
        setConfirmDialog({
            open: true,
            type: 'selected',
            index: index,
            imageId: null
        });
    };

    // Confirm removal of selected file
    const confirmRemoveSelectedFile = () => {
        const { index } = confirmDialog;
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setConfirmDialog({ open: false, type: '', index: null, imageId: null });
    };

    // Multiple instant upload function with real-time progress
    const multipleInstantUploadImages = async (files) => {
        if (!partNumber || !brand) {
            return;
        }

        setIsUploading(true);
        const token = Cookies.get('adminToken');

        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
            });
            formData.append('partNumber', partNumber);
            formData.append('brand', brand);

            // Create EventSource for real-time progress
            const eventSource = new EventSource(
                `${buildApiUrl(API_ENDPOINTS.PRODUCT_IMAGES_MULTIPLE_INSTANT_UPLOAD)}?${new URLSearchParams(Object.fromEntries(formData.entries())).toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            // Use fetch for the actual upload
            const response = await fetch(buildApiUrl(API_ENDPOINTS.PRODUCT_IMAGES_MULTIPLE_INSTANT_UPLOAD), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Handle Server-Sent Events for progress
            eventSource.onmessage = function(event) {
                if (event.data === '[DONE]') {
                    eventSource.close();
                    setIsUploading(false);
                    return;
                }

                try {
                    const progressData = JSON.parse(event.data);
                    
                    switch (progressData.type) {
                        case 'start':
                            // Upload started
                            break;
                            
                        case 'file':
                            setUploadProgress(prev => ({
                                ...prev,
                                [progressData.filename]: progressData.progress
                            }));
                            break;
                            
                        case 'overall':
                            // Update overall progress display
                            console.log(`Overall progress: ${progressData.progress}%`);
                            break;
                            
                        case 'completed':
                            const newImage = {
                                imageId: `instant-${Date.now()}-${Math.random()}`,
                                originalName: progressData.result.originalName,
                                filename: progressData.result.blobName.split('/').pop(),
                                imageUrl: progressData.result.imageUrl,
                                isExisting: false
                            };
                            setUploadedImages(prev => [...prev, newImage]);
                            break;
                            
                        case 'error':
                            // File upload error logged
                            break;
                            
                        case 'final':
                            const { results } = progressData;
                            
                            // Update onImagesChange with all successful image URLs
                            const successfulImageUrls = results.successful.map(img => img.imageUrl || img.filename);
                            const allImageUrls = [...existingImages, ...successfulImageUrls];
                            onImagesChange && onImagesChange(allImageUrls);
                            
                            toast.success(progressData.message);
                            
                            // Clear selected files after successful upload
                            setSelectedFiles([]);
                            setUploadProgress({});
                            break;
                    }
                } catch (error) {
                    console.error('Error parsing progress data:', error);
                }
            };

            eventSource.onerror = function(error) {
                console.error('SSE error:', error);
                eventSource.close();
                setIsUploading(false);
            };

        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Upload failed: ${error.message}`);
            setIsUploading(false);
            setUploadProgress({});
        }
    };

    const uploadImages = async (files) => {
        if (!partNumber || !brand) {
            return;
        }

        setIsUploading(true);
        const token = Cookies.get('adminToken');

        try {
            if (multiple && files.length > 1) {
                // Use the new multiple instant upload with real-time progress
                await multipleInstantUploadImages(files);
            } else {
                // Single file upload
                const file = files[0];
                const formData = new FormData();
                formData.append('image', file);
                formData.append('partNumber', partNumber);
                formData.append('brand', brand);
                if (productId) formData.append('productId', productId);

                const xhr = new XMLHttpRequest();

                xhr.upload.onprogress = function(e) {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        setUploadProgress({ [file.name]: percentComplete });
                    }
                };

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        const newImage = {
                            imageId: response.imageId || `uploaded-${Date.now()}`,
                            originalName: response.originalName || file.name,
                            imageUrl: response.imageUrl || `/images/products/${response.imageName}`,
                            isExisting: false
                        };

                        setUploadedImages(prev => [...prev, newImage]);
                        
                        // Call onImagesChange with all image URLs
                        const allImageUrls = [...existingImages, response.imageUrl];
                        onImagesChange && onImagesChange(allImageUrls);

                        toast.success('Image uploaded successfully');
                        setUploadProgress({});
                    } else {
                        const error = JSON.parse(xhr.responseText);
                        toast.error(error.message || 'Upload failed');
                    }
                    setIsUploading(false);
                };

                xhr.onerror = function() {
                    setIsUploading(false);
                };

                xhr.open('POST', buildApiUrl(API_ENDPOINTS.PRODUCT_IMAGES_UPLOAD));
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.send(formData);
            }

        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Upload failed');
            setIsUploading(false);
            setUploadProgress({});
        }
    };

    const removeUploadedImage = (imageId) => {
        setConfirmDialog({
            open: true,
            type: 'uploaded',
            index: null,
            imageId: imageId
        });
    };

    // Confirm removal of uploaded image
    const confirmRemoveUploadedImage = () => {
        const { imageId } = confirmDialog;
        const imageToRemove = uploadedImages.find(img => img.imageId === imageId);
        if (!imageToRemove) return;

        const remainingImages = uploadedImages.filter(img => img.imageId !== imageId);
        setUploadedImages(remainingImages);

        // Call onImagesChange with remaining image URLs (use imageUrl for instant uploads)
        const remainingImageUrls = remainingImages
            .filter(img => img.isExisting || img.imageUrl || img.filename)
            .map(img => img.imageUrl || img.filename);
        onImagesChange && onImagesChange(remainingImageUrls);

        setConfirmDialog({ open: false, type: '', index: null, imageId: null });
    };

    return (
        <div className="space-y-4">
            {/* Upload Button */}
            <div className="flex items-center gap-2 flex-wrap">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                    disabled={isUploading || uploadedImages.length + selectedFiles.length >= maxFiles || !brand || brand.trim() === ''}
                    className="flex items-center gap-2"
                >
                    <Upload className="h-4 w-4" />
                    {isUploading ? 'Uploading...' : 'Select Images'}
                </Button>

                {/* Generic Images Button */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsGenericImagesDialogOpen(true)}
                    disabled={isUploading || uploadedImages.length + selectedFiles.length >= maxFiles || !brand || brand.trim() === ''}
                    className="flex items-center gap-2"
                >
                    <Images className="h-4 w-4" />
                    Generic Images
                </Button>
                
                {/* Upload Selected Files Button */}
                {selectedFiles.length > 0 && (
                    <Button
                        type="button"
                        onClick={uploadSelectedFiles}
                        disabled={isUploading || selectedFiles.length === 0}
                        className="flex items-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                Upload ({selectedFiles.length})
                            </>
                        )}
                    </Button>
                )}
                
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple={multiple}
                    onChange={handleFileSelect}
                    className="hidden"
                />
                
                <span className="text-sm text-muted-foreground">
                    {uploadedImages.length + selectedFiles.length}/{maxFiles} images
                </span>
            </div>

            {/* Brand validation message */}
            {(!brand || brand.trim() === '') && (
                <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200">
                    Please select a brand before uploading images
                </div>
            )}

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Selected Files ({selectedFiles.length})</h4>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedFiles([])}
                            className="text-xs"
                        >
                            Clear All
                        </Button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {selectedFiles.map((file, index) => (
                            <Card key={`selected-${index}`} className="relative group">
                                <CardContent className="p-1">
                                    <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                            onLoad={(e) => {
                                                // Clean up object URL after image loads
                                                setTimeout(() => {
                                                    URL.revokeObjectURL(e.target.src);
                                                }, 1000);
                                            }}
                                        />
                                        
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeSelectedFile(index)}
                                        >
                                            <X className="h-2 w-2" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Upload Progress</h4>
                    {Object.entries(uploadProgress).map(([key, progress]) => (
                        <div key={key} className="space-y-1">
                            <div className="flex justify-between text-sm">
                                <span className="truncate">
                                    {key === 'multiple' ? 'Uploading images...' : 
                                     key.includes('.') ? key : `File: ${key}`}
                                </span>
                                <span className="font-medium">{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2.5">
                                <div 
                                    className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out" 
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Uploaded Images Preview */}
            {uploadedImages.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Uploaded Images ({uploadedImages.length})</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                        {uploadedImages.map((image) => (
                            <Card key={image.imageId} className="relative group">
                                <CardContent className="p-1">
                                    <div className="aspect-square relative bg-muted rounded-md overflow-hidden">
                                        <img
                                            src={imageErrors[image.imageUrl] ? FALLBACK_IMAGE_SRC : image.imageUrl}
                                            alt={image.originalName}
                                            className="w-full h-full object-cover"
                                            onError={() => handleImageError(image.imageUrl)}
                                        />
                                        <div className="hidden w-full h-full items-center justify-center bg-muted">
                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-1 right-1 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => removeUploadedImage(image.imageId)}
                                        >
                                            <X className="h-2 w-2" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, type: '', index: null, imageId: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Removal</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to remove this image? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setConfirmDialog({ open: false, type: '', index: null, imageId: null })}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={confirmDialog.type === 'selected' ? confirmRemoveSelectedFile : confirmRemoveUploadedImage}
                        >
                            Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Generic Images Dialog */}
            <GenericImagesDialog
                isOpen={isGenericImagesDialogOpen}
                onClose={() => setIsGenericImagesDialogOpen(false)}
                onImageSelect={handleGenericImagesSelect}
                selectedImages={uploadedImages}
            />
        </div>
    );
};

export default ProductImageUploader;