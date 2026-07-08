import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';
import Cookies from 'js-cookie';

const ProductImageUploader = ({ 
    partNumber, 
    brand, 
    productId, 
    existingImages = [],
    onImagesChange,
    onUploadSuccess, 
    onUploadError,
    multiple = true,
    maxFiles = 10 
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploadedImages, setUploadedImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Initialize uploaded images from existing images
    useEffect(() => {
        if (existingImages && existingImages.length > 0) {
            const formattedImages = existingImages.map((imageName, index) => ({
                imageId: `existing-${index}`,
                originalName: imageName,
                imageUrl: imageName, // Use the full URL directly from database
                isExisting: true
            }));
            setUploadedImages(formattedImages);
        }
    }, [existingImages]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        handleFiles(files);
    };

    const handleFiles = (files) => {
        // Filter only image files
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            onUploadError && onUploadError('Please select only image files');
            return;
        }

        if (imageFiles.length > maxFiles) {
            onUploadError && onUploadError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        // Check file sizes
        const oversizedFiles = imageFiles.filter(file => file.size > 5 * 1024 * 1024);
        if (oversizedFiles.length > 0) {
            onUploadError && onUploadError('Some files are larger than 5MB');
            return;
        }

        uploadImages(imageFiles);
    };

    const uploadImages = async (files) => {
        if (!partNumber || !brand) {
            onUploadError && onUploadError('Part number and brand are required');
            return;
        }

        setIsUploading(true);
        const newProgress = {};
        
        // Initialize progress for each file
        files.forEach((file, index) => {
            newProgress[`file-${index}`] = { name: file.name, progress: 0 };
        });
        setUploadProgress(newProgress);

        try {
            const token = Cookies.get('adminToken');
            if (!token) {
                throw new Error('Authentication required');
            }

            if (multiple && files.length > 1) {
                // Upload multiple files
                const formData = new FormData();
                files.forEach(file => {
                    formData.append('images', file);
                });
                formData.append('partNumber', partNumber);
                formData.append('brand', brand);
                if (productId) {
                    formData.append('productId', productId);
                }

                const xhr = new XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        const updatedProgress = { ...newProgress };
                        Object.keys(updatedProgress).forEach(key => {
                            updatedProgress[key].progress = percentComplete;
                        });
                        setUploadProgress(updatedProgress);
                    }
                });

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        const newImages = response.data.successful || [];
                        setUploadedImages(prev => [...prev, ...newImages]);
                        
                        // Update parent component with all image names
                        const allImageNames = [...existingImages, ...newImages.map(img => img.originalName)];
                        onImagesChange && onImagesChange(allImageNames);
                        onUploadSuccess && onUploadSuccess(response.data);
                        setUploadProgress({});
                    } else {
                        const error = JSON.parse(xhr.responseText);
                        onUploadError && onUploadError(error.message || 'Upload failed');
                    }
                    setIsUploading(false);
                };

                xhr.onerror = function() {
                    onUploadError && onUploadError('Network error occurred');
                    setIsUploading(false);
                };

                xhr.open('POST', `${process.env.REACT_APP_API_URL}/product-images/upload-multiple`);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.send(formData);

            } else {
                // Upload single file
                const file = files[0];
                const formData = new FormData();
                formData.append('image', file);
                formData.append('partNumber', partNumber);
                formData.append('brand', brand);
                if (productId) {
                    formData.append('productId', productId);
                }

                const xhr = new XMLHttpRequest();
                
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const percentComplete = Math.round((e.loaded / e.total) * 100);
                        setUploadProgress({ 'file-0': { name: file.name, progress: percentComplete } });
                    }
                });

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        const newImage = response.data;
                        setUploadedImages(prev => [...prev, newImage]);
                        
                        // Update parent component with all image names
                        const allImageNames = [...existingImages, newImage.originalName];
                        onImagesChange && onImagesChange(allImageNames);
                        onUploadSuccess && onUploadSuccess(response.data);
                        setUploadProgress({});
                    } else {
                        const error = JSON.parse(xhr.responseText);
                        onUploadError && onUploadError(error.message || 'Upload failed');
                    }
                    setIsUploading(false);
                };

                xhr.onerror = function() {
                    onUploadError && onUploadError('Network error occurred');
                    setIsUploading(false);
                };

                xhr.open('POST', `${process.env.REACT_APP_API_URL}/product-images/upload`);
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.send(formData);
            }

        } catch (error) {
            console.error('Upload error:', error);
            onUploadError && onUploadError(error.message || 'Upload failed');
            setIsUploading(false);
            setUploadProgress({});
        }
    };

    const removeUploadedImage = (imageId) => {
        const imageToRemove = uploadedImages.find(img => img.imageId === imageId);
        setUploadedImages(prev => prev.filter(img => img.imageId !== imageId));
        
        // Update parent component with remaining image names
        const remainingImages = uploadedImages
            .filter(img => img.imageId !== imageId)
            .map(img => img.originalName);
        onImagesChange && onImagesChange(remainingImages);
    };

    return (
        <div className="product-image-uploader">
            <div 
                className={`upload-area ${isDragging ? 'dragging' : ''} ${isUploading ? 'uploading' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple={multiple}
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
                
                {isUploading ? (
                    <div className="upload-status">
                        <div className="upload-icon">📤</div>
                        <p>Uploading images...</p>
                    </div>
                ) : (
                    <div className="upload-prompt">
                        <div className="upload-icon">📷</div>
                        <p>Drag and drop images here or click to select</p>
                        <span className="upload-hint">
                            {multiple ? `Up to ${maxFiles} images, max 5MB each` : 'Single image, max 5MB'}
                        </span>
                    </div>
                )}
            </div>

            {/* Progress indicators */}
            {Object.keys(uploadProgress).length > 0 && (
                <div className="progress-container">
                    {Object.entries(uploadProgress).map(([key, { name, progress }]) => (
                        <div key={key} className="progress-item">
                            <div className="progress-info">
                                <span className="file-name">{name}</span>
                                <span className="progress-percent">{progress}%</span>
                            </div>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Uploaded images preview */}
            {uploadedImages.length > 0 && (
                <div className="uploaded-images">
                    <h4>Uploaded Images</h4>
                    <div className="images-grid">
                        {uploadedImages.map((image, index) => (
                            <div key={image.imageId || index} className="image-item">
                                <img 
                                    src={image.imageUrl} 
                                    alt={image.originalName}
                                    className="image-thumbnail"
                                />
                                <div className="image-info">
                                    <span className="image-name">{image.originalName}</span>
                                    <button 
                                        className="remove-btn"
                                        onClick={() => removeUploadedImage(image.imageId)}
                                        title="Remove from list"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductImageUploader;