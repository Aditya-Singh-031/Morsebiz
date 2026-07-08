import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import Cookies from 'js-cookie';

/**
 * Category API Service
 * Handles all category-related API calls
 */
class CategoryService {
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
   * Get all categories with pagination (for listing)
   */
  static async getAllCategories(params = {}) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access categories.');
      }

      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);

      const apiUrl = `${buildApiUrl('/api/dashboard/categories')}?${queryParams.toString()}`;
      
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
          throw new Error('Access denied. You do not have permission to access categories.');
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
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Search categories (for search functionality)
   */
  static async searchCategories(params = {}) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to search categories.');
      }

      const queryParams = new URLSearchParams();
      
      // Add search params
      if (params.search) queryParams.append('search', params.search);
      if (params.limit) queryParams.append('limit', params.limit || 50); // Default limit for search

      const apiUrl = `${buildApiUrl('/api/dashboard/categories/search')}?${queryParams.toString()}`;
      
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
          throw new Error('Access denied. You do not have permission to search categories.');
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
      console.error('Error searching categories:', error);
      throw error;
    }
  }

  /**
   * Get single category by ID
   */
  static async getCategory(categoryId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access category.');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/categories/${categoryId}`);
      
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
          throw new Error('Category not found.');
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
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  /**
   * Create new category
   */
  static async createCategory(categoryData) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to create categories.');
      }

      const apiUrl = buildApiUrl('/api/dashboard/categories');
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(categoryData)
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
          // Category already exists
          throw new Error(errorMessage || 'Category with this title already exists.');
        }
        
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to create categories.');
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create category');
      }

      console.log('Successfully created category');
      return result.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update existing category
   */
  static async updateCategory(categoryId, categoryData) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to update categories.');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/categories/${categoryId}`);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(categoryData)
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
          // Category already exists
          throw new Error(errorMessage || 'Another category with this title already exists.');
        }
        
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to update categories.');
        }
        
        if (response.status === 404) {
          throw new Error('Category not found.');
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update category');
      }

      console.log('Successfully updated category');
      return result.data;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  /**
   * Get categories (alias for getAllCategories for compatibility)
   */
  static async getCategories(params = {}) {
    return this.getAllCategories(params);
  }

  /**
   * Delete category
   */
  static async deleteCategory(categoryId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to delete categories.');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/categories/${categoryId}`);
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || `HTTP error! status: ${response.status}`;
        
        console.error(`API Error ${response.status}:`, errorMessage);
        
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to delete categories.');
        }
        
        if (response.status === 404) {
          throw new Error('Category not found.');
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to delete category');
      }

      console.log('Successfully deleted category');
      return result.data;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}

export default CategoryService;