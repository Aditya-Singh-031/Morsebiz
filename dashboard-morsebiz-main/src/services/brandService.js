import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import Cookies from 'js-cookie';

/**
 * Brand API Service
 * Handles all brand-related API calls
 */
class BrandService {
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
   * Get all brands with pagination (for listing)
   */
  static async getAllBrands(params = {}) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access brands.');
      }

      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const apiUrl = `${buildApiUrl('/api/dashboard/brands')}?${queryParams.toString()}`;
      
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
          throw new Error('Access denied. You do not have permission to access brands.');
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
      console.error('Error fetching brands:', error);
      throw error;
    }
  }

  /**
   * Search brands (for search functionality)
   */
  static async searchBrands(params = {}) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to search brands.');
      }

      const queryParams = new URLSearchParams();
      
      // Add search params
      if (params.search) queryParams.append('search', params.search);
      if (params.limit) queryParams.append('limit', params.limit || 50); // Default limit for search

      const apiUrl = `${buildApiUrl('/api/dashboard/brands/search')}?${queryParams.toString()}`;
      
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
          throw new Error('Access denied. You do not have permission to search brands.');
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
      console.error('Error searching brands:', error);
      throw error;
    }
  }

  /**
   * Get single brand by ID
   */
  static async getBrand(brandId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access brand.');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/brands/${brandId}`);
      
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
          throw new Error('Brand not found.');
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
      console.error('Error fetching brand:', error);
      throw error;
    }
  }

  /**
   * Create new brand
   */
  static async createBrand(brandData) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to create brands.');
      }

      const apiUrl = buildApiUrl('/api/dashboard/brands');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(brandData)
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
          // Brand already exists
          throw new Error(errorMessage || 'Brand with this title already exists.');
        }
        
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to create brands.');
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create brand');
      }

      console.log('Successfully created brand');
      return result.data;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  }

  /**
   * Update brand
   */
  static async updateBrand(brandId, brandData) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to update brand.');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/brands/${brandId}`);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(brandData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to update brands.');
        }
        if (response.status === 404) {
          throw new Error('Brand not found.');
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
      console.error('Error updating brand:', error);
      throw error;
    }
  }

  /**
   * Delete brand
   */
  static async deleteBrand(brandId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to delete brand.');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/brands/${brandId}`);
      
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
          throw new Error('Access denied. You do not have permission to delete brands.');
        }
        if (response.status === 404) {
          throw new Error('Brand not found.');
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
      console.error('Error deleting brand:', error);
      throw error;
    }
  }
}

export default BrandService;