import Cookies from 'js-cookie';

import { buildApiUrl, API_ENDPOINTS } from '../config/api';

const API_BASE_URL = API_ENDPOINTS;

/**
 * Get authentication headers
 * @returns {Object} Headers with authorization token
 */
const getAuthHeaders = () => {
    const token = Cookies.get('adminToken');
    return {
        'Authorization': `Bearer ${token}`
    };
};

/**
 * Upload single product image
 * @param {File} imageFile - Image file to upload
 * @param {string} partNumber - Product part number
 * @param {string} brand - Product brand
 * @param {string} productId - Product ID (optional)
 * @returns {Promise<Object>} Upload result
 */
export const uploadProductImage = async (imageFile, partNumber, brand, productId = null) => {
    try {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('partNumber', partNumber);
        formData.append('brand', brand);
        if (productId) {
            formData.append('productId', productId);
        }

        const response = await fetch(`${API_BASE_URL}/api/dashboard/product-images/upload`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload image');
        }

        return data;
    } catch (error) {
        console.error('Error uploading product image:', error);
        throw error;
    }
};

/**
 * Upload multiple product images
 * @param {File[]} imageFiles - Array of image files to upload
 * @param {string} partNumber - Product part number
 * @param {string} brand - Product brand
 * @param {string} productId - Product ID (optional)
 * @returns {Promise<Object>} Upload results
 */
export const uploadMultipleProductImages = async (imageFiles, partNumber, brand, productId = null) => {
    try {
        const formData = new FormData();
        imageFiles.forEach(file => {
            formData.append('images', file);
        });
        formData.append('partNumber', partNumber);
        formData.append('brand', brand);
        if (productId) {
            formData.append('productId', productId);
        }

        const response = await fetch(`${API_BASE_URL}/api/dashboard/product-images/upload-multiple`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to upload images');
        }

        return data;
    } catch (error) {
        console.error('Error uploading multiple product images:', error);
        throw error;
    }
};

/**
 * Get product images by part number and brand
 * @param {string} partNumber - Product part number
 * @param {string} brand - Product brand
 * @returns {Promise<Object>} Product images data
 */
export const getProductImages = async (partNumber, brand) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/product-images/${encodeURIComponent(partNumber)}/${encodeURIComponent(brand)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch product images');
        }

        return data;
    } catch (error) {
        console.error('Error fetching product images:', error);
        throw error;
    }
};

/**
 * Delete product image
 * @param {string} imageId - Image ID to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteProductImage = async (imageId) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/dashboard/product-images/${imageId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to delete image');
        }

        return data;
    } catch (error) {
        console.error('Error deleting product image:', error);
        throw error;
    }
};

/**
 * Upload product image with progress tracking
 * @param {File} imageFile - Image file to upload
 * @param {string} partNumber - Product part number
 * @param {string} brand - Product brand
 * @param {string} productId - Product ID (optional)
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} Upload result
 */
export const uploadProductImageWithProgress = (imageFile, partNumber, brand, productId = null, onProgress = null) => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('image', imageFile);
        formData.append('partNumber', partNumber);
        formData.append('brand', brand);
        if (productId) {
            formData.append('productId', productId);
        }

        const xhr = new XMLHttpRequest();

        // Track upload progress
        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    onProgress(percentComplete);
                }
            });
        }

        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (error) {
                    reject(new Error('Invalid response format'));
                }
            } else {
                try {
                    const error = JSON.parse(xhr.responseText);
                    reject(new Error(error.message || 'Upload failed'));
                } catch (parseError) {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            }
        };

        xhr.onerror = function() {
            reject(new Error('Network error occurred'));
        };

        xhr.ontimeout = function() {
            reject(new Error('Upload timeout'));
        };

        const token = Cookies.get('adminToken');
        xhr.open('POST', `${API_BASE_URL}/api/dashboard/product-images/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.timeout = 60000; // 60 second timeout
        xhr.send(formData);
    });
};

/**
 * Upload multiple product images with progress tracking
 * @param {File[]} imageFiles - Array of image files to upload
 * @param {string} partNumber - Product part number
 * @param {string} brand - Product brand
 * @param {string} productId - Product ID (optional)
 * @param {Function} onProgress - Progress callback function
 * @returns {Promise<Object>} Upload results
 */
export const uploadMultipleProductImagesWithProgress = (imageFiles, partNumber, brand, productId = null, onProgress = null) => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        imageFiles.forEach(file => {
            formData.append('images', file);
        });
        formData.append('partNumber', partNumber);
        formData.append('brand', brand);
        if (productId) {
            formData.append('productId', productId);
        }

        const xhr = new XMLHttpRequest();

        // Track upload progress
        if (onProgress) {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    onProgress(percentComplete);
                }
            });
        }

        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } catch (error) {
                    reject(new Error('Invalid response format'));
                }
            } else {
                try {
                    const error = JSON.parse(xhr.responseText);
                    reject(new Error(error.message || 'Upload failed'));
                } catch (parseError) {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            }
        };

        xhr.onerror = function() {
            reject(new Error('Network error occurred'));
        };

        xhr.ontimeout = function() {
            reject(new Error('Upload timeout'));
        };

        const token = Cookies.get('adminToken');
        xhr.open('POST', `${API_BASE_URL}/api/dashboard/product-images/upload-multiple`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.timeout = 120000; // 2 minute timeout for multiple files
        xhr.send(formData);
    });
};