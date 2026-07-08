import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import Cookies from 'js-cookie';

/**
 * Product API Service
 * Handles all product-related API calls
 */
class ProductService {
  /**
   * Get auth token from cookies
   */
  static getAuthToken() {
    return Cookies.get('adminToken');
  }

  /**
   * Get auth headers
   */
  static getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  /**
   * Get all products with pagination and filters
   */
  static async getAllProducts(params = {}) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access products.');
      }

      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add search and filter params
      if (params.search) queryParams.append('search', params.search);
      if (params.brand) queryParams.append('brand', params.brand);
      if (params.brands) queryParams.append('brands', params.brands);
      if (params.category) queryParams.append('category', params.category);
      if (params.country) queryParams.append('country', params.country);
      if (params.stockavailable) queryParams.append('stockavailable', params.stockavailable);
      if (params.liveStatus) queryParams.append('liveStatus', params.liveStatus);
      if (params.stock) queryParams.append('stock', params.stock);

      const apiUrl = `${buildApiUrl(API_ENDPOINTS.PRODUCTS)}?${queryParams.toString()}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to access this resource.');
        }
        
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Get single product by slug
   */
  static async getProduct(slug) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access product.');
      }

      // URL encode the slug to handle special characters
      const encodedSlug = encodeURIComponent(slug);
      const apiUrl = buildApiUrl(`${API_ENDPOINTS.PRODUCTS}/${encodedSlug}`);
      console.log('ProductService.getProduct - API URL:', apiUrl);
      console.log('ProductService.getProduct - API_ENDPOINTS.PRODUCTS:', API_ENDPOINTS.PRODUCTS);
      console.log('ProductService.getProduct - slug:', slug);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to access this resource.');
        }
        if (response.status === 404) {
          throw new Error('Product not found.');
        }
        
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  /**
   * Update product
   */
  static async updateProduct(slug, productData) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to update product.');
      }

      // URL encode the slug to handle special characters
      const encodedSlug = encodeURIComponent(slug);
      const apiUrl = buildApiUrl(`${API_ENDPOINTS.PRODUCTS}/${encodedSlug}`);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to update products.');
        }
        
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete product
   */
  static async deleteProduct(partNumber) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to delete product.');
      }

      // URL encode the part number to handle special characters like spaces and forward slashes
      const encodedPartNumber = encodeURIComponent(partNumber);
      const apiUrl = buildApiUrl(`${API_ENDPOINTS.PRODUCTS}/${encodedPartNumber}`);
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to delete products.');
        }
        
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
  /**
   * Get product statistics for dashboard
   * @returns {Promise<Object>} Product stats data
   */
  static async getProductStats() {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access product statistics.');
      }

      const apiUrl = buildApiUrl(API_ENDPOINTS.PRODUCT_STATS);
      console.log('Fetching product stats from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to access product statistics.');
        }
        
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to fetch product stats');
    }

    console.log('Successfully fetched real product stats');
    // Return the data property which contains product statistics
    return result.data;
    } catch (error) {
      console.error('Error fetching product stats:', error);
      throw error;
    }
  }

  /**
   * Get all products
   * @returns {Promise<Object>} Products data
   */
  static async getProducts() {
    try {
      // Get admin token from cookies
      const adminToken = Cookies.get('adminToken');
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if admin token exists
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.PRODUCTS), {
        method: 'GET',
        headers,
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch products');
      }

      return result.data;
    } catch (error) {
      // Products fetch error
      throw error;
    }
  }

  /**
   * Update a product by slug
   * @param {string} slug - Product slug
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product data
   */
  static async updateProduct(slug, productData) {
    // Get admin token from cookies
    const adminToken = Cookies.get('adminToken');
    
    // Check if token exists
    if (!adminToken) {
      throw new Error('No admin token found. Please login to update products.');
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    };
    
    const apiUrl = buildApiUrl(`${API_ENDPOINTS.PRODUCTS}/${encodeURIComponent(slug)}`);
    console.log('Updating product at:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      
      if (response.status === 401) {
        console.warn('Authentication failed, token may be expired');
        Cookies.remove('adminToken');
        throw new Error('Authentication failed. Please login again.');
      }
      
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update product');
    }

    console.log('Successfully updated product');
    return result.data;
  }

  /**
   * Get filter brands
   */
  static async getFilterBrands() {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access filters.');
      }

      const apiUrl = buildApiUrl(API_ENDPOINTS.PRODUCT_FILTERS_BRANDS);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to access filter data.');
        }
        
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching filter brands:', error);
      throw error;
    }
  }

  /**
   * Get filter categories
   */
  static async getFilterCategories() {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access filters.');
      }

      const apiUrl = buildApiUrl(API_ENDPOINTS.PRODUCT_FILTERS_CATEGORIES);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to access filter data.');
        }
        
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching filter categories:', error);
      throw error;
    }
  }

  /**
   * Get filter countries
   */
  static async getFilterCountries() {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access filters.');
      }

      const apiUrl = buildApiUrl(API_ENDPOINTS.PRODUCT_FILTERS_COUNTRIES);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to access filter data.');
        }
        
        // Try to get error message from response
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use default message
        }
        
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching filter countries:', error);
      throw error;
    }
  }

  /**
   * Check if part number already exists
   * @param {string} partNumber - Part number to check
   * @param {string} excludeId - ID to exclude from check (for edit mode)
   * @returns {Promise<boolean>} True if part number exists
   */
  static async checkPartNumberExists(partNumber, excludeId = null) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to check part numbers.');
      }

      const params = new URLSearchParams({ partNumber });
      if (excludeId) {
        params.append('excludeId', excludeId);
      }

      const apiUrl = buildApiUrl(`/api/dashboard/products/check-part-number?${params.toString()}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.exists || false;
    } catch (error) {
      console.error('Error checking part number:', error);
      throw error;
    }
  }

  /**
   * Check if slug already exists
   * @param {string} slug - Slug to check
   * @param {string} excludeId - ID to exclude from check (for edit mode)
   * @returns {Promise<boolean>} True if slug exists
   */
  static async checkSlugExists(slug, excludeId = null) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to check slugs.');
      }

      const params = new URLSearchParams({ slug });
      if (excludeId) {
        params.append('excludeId', excludeId);
      }

      const apiUrl = buildApiUrl(`/api/dashboard/products/check-slug?${params.toString()}`);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.exists || false;
    } catch (error) {
      console.error('Error checking slug:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data to create
   * @returns {Promise<Object>} Created product data
   */
  /**
   * Create a new product
   * @param {Object} productData - Product data to create
   * @returns {Promise<Object>} Created product data
   */
  static async createProduct(productData) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to create products.');
      }

      const apiUrl = buildApiUrl(API_ENDPOINTS.PRODUCTS);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
        
        console.error(`API Error ${response.status}:`, errorMessage);
        
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        
        if (response.status === 409) {
          // Part number already exists
          throw new Error(errorMessage || 'Product with this part number already exists.');
        }
        
        if (response.status === 403) {
          throw new Error('You do not have permission to create products.');
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create product');
      }

      console.log('Successfully created product');
      return result.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update a product by ID
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product data
   */
  static async updateProductById(productId, productData) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to update products.');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/products/${productId}`);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`API Error ${response.status}:`, errorText);
        
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        
        if (response.status === 409) {
          throw new Error('Product with this part number or slug already exists.');
        }
        
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update product');
      }

      console.log('Successfully updated product');
      return result.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Get all filters at once
   */
  static async getAllFilters() {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access filters.');
      }

      const apiUrl = buildApiUrl(API_ENDPOINTS.PRODUCT_FILTERS_ALL);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all filters:', error);
      throw error;
    }
  }

  /**
   * Format number with commas
   */
  static formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Calculate percentage
   */
  static calculatePercentage(value, total) {
    if (!total || total === 0) return 0;
    return Math.round((value / total) * 100);
  }
}

export default ProductService;