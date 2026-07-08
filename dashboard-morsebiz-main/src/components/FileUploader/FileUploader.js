import React, { useState, useRef } from 'react';
import { Upload, X, File as FileIcon, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { buildApiUrl, API_ENDPOINTS } from '@/config/api';
import Cookies from 'js-cookie';

const FileUploader = ({ 
    folderName, 
    onUploadSuccess,
    onUploadStart,
    onUploadComplete,
    maxFileSize = 50 * 1024 * 1024, // 50MB default
    acceptedFileTypes = "*/*", // Accept all file types by default
    placeholder = "Click to select file or drag and drop",
    className = "",
    disabled = false,
    compact = false // New prop for compact mode
}) => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        handleFile(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleFile = (file) => {
        if (!file) return;

        // Check if folder name is provided
        if (!folderName || folderName.trim() === '') {
            return;
        }

        // Check file size
        if (file.size > maxFileSize) {
            const maxSizeMB = (maxFileSize / 1024 / 1024).toFixed(2);
            return;
        }

        setSelectedFile(file);
        // Removed file selection toast message
    };

    const uploadFile = async () => {
        if (!selectedFile) {
            return;
        }

        if (!folderName || folderName.trim() === '') {
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        
        // Call onUploadStart callback
        if (onUploadStart) {
            onUploadStart();
        }
        
        const token = Cookies.get('adminToken');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('folderName', folderName);

            const xhr = new XMLHttpRequest();

            const uploadPromise = new Promise((resolve, reject) => {
                xhr.upload.onprogress = function(e) {
                    if (e.lengthComputable) {
                        const percentComplete = (e.loaded / e.total) * 100;
                        setUploadProgress(percentComplete);
                    }
                };

                xhr.onload = function() {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        if (response.success) {
                            const uploadedFileData = {
                                originalName: response.data.originalName,
                                filename: response.data.filename,
                                fileUrl: response.data.fileUrl,
                                fileSize: response.data.fileSize,
                                mimeType: response.data.mimeType,
                                folderName: folderName
                            };

                            setUploadedFile(uploadedFileData);
                            setSelectedFile(null);
                            
                            // Call the callback with the uploaded file data
                            if (onUploadSuccess) {
                                onUploadSuccess({
                                    url: uploadedFileData.fileUrl,
                                    ...uploadedFileData
                                });
                            }

                            resolve(response.data);
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

                xhr.open('POST', buildApiUrl(API_ENDPOINTS.FILE_UPLOAD));
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.send(formData);
            });

            await uploadPromise;
            toast.success(`File uploaded successfully: ${selectedFile.name}`);

        } catch (error) {
            console.error('Upload error:', error);
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            
            // Call onUploadComplete callback
            if (onUploadComplete) {
                onUploadComplete();
            }
        }
    };

    const removeSelectedFile = () => {
        setSelectedFile(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        // Removed file removal toast message
    };

    const removeUploadedFile = () => {
        setUploadedFile(null);
        if (onUploadSuccess) {
            onUploadSuccess(null);
        }
        // Removed uploaded file removal toast message
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) {
            return <img src={URL.createObjectURL(file)} alt="Preview" className="w-8 h-8 object-cover rounded" />;
        }
        return <FileIcon className="w-8 h-8 text-gray-500" />;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* File Upload Interface - Hidden when file is uploaded */}
            {!uploadedFile && (
                <>
                    {compact ? (
                        // Compact mode - Small select file button
                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => !disabled && fileInputRef.current?.click()}
                                disabled={disabled}
                                className="flex items-center gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                Select File
                            </Button>
                            <div className="text-xs text-gray-500">
                                Max: {(maxFileSize / 1024 / 1024).toFixed(2)}MB
                                {folderName && (
                                    <span className="text-blue-600 ml-2">→ /{folderName}</span>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={handleFileSelect}
                                className="hidden"
                                accept={acceptedFileTypes}
                                disabled={disabled}
                            />
                        </div>
                    ) : (
                        // Full mode - Large drag and drop area
                        <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                            <CardContent className="p-6">
                                <div
                                    className="text-center cursor-pointer"
                                    onDrop={handleDrop}
                                    onDragOver={handleDragOver}
                                    onClick={() => !disabled && fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        accept={acceptedFileTypes}
                                        disabled={disabled}
                                    />
                                    
                                    <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <p className="text-sm text-gray-600 mb-2">{placeholder}</p>
                                    <p className="text-xs text-gray-500">
                                        Maximum file size: {(maxFileSize / 1024 / 1024).toFixed(2)}MB
                                    </p>
                                    {folderName && (
                                        <p className="text-xs text-blue-600 mt-2">
                                            Upload to folder: /{folderName}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Selected File */}
            {selectedFile && !uploadedFile && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {getFileIcon(selectedFile)}
                                <div>
                                    <p className="text-sm font-medium">{selectedFile.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    onClick={uploadFile}
                                    disabled={isUploading}
                                    size="sm"
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        'Upload'
                                    )}
                                </Button>
                                <Button
                                    onClick={removeSelectedFile}
                                    disabled={isUploading}
                                    size="sm"
                                    variant="outline"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                        
                        {/* Progress Bar */}
                        {isUploading && (
                            <div className="mt-3">
                                <div className="flex justify-between text-xs text-gray-600 mb-1">
                                    <span>Uploading...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Uploaded File - Simplified view with just image preview and remove button */}
            {uploadedFile && (
                <div className="flex items-center gap-3">
                    {/* Image Preview */}
                    {uploadedFile.fileUrl && uploadedFile.originalName && 
                     (uploadedFile.originalName.toLowerCase().includes('.jpg') || 
                      uploadedFile.originalName.toLowerCase().includes('.jpeg') || 
                      uploadedFile.originalName.toLowerCase().includes('.png') || 
                      uploadedFile.originalName.toLowerCase().includes('.gif') || 
                      uploadedFile.originalName.toLowerCase().includes('.webp') || 
                      uploadedFile.originalName.toLowerCase().includes('.svg')) && (
                        <img 
                            src={uploadedFile.fileUrl} 
                            alt={uploadedFile.originalName}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    )}
                    
                    {/* Remove Button */}
                    <Button
                        onClick={removeUploadedFile}
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default FileUploader;