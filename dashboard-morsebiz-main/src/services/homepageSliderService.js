import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import Cookies from 'js-cookie';

/**
 * Homepage Slider API Service
 * Handles all homepage slider-related API calls
 */
class HomepageSliderService {
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
   * Get all homepage sliders with pagination (for listing)
   */
  static async getAllSliders(params = {}) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access sliders.');
      }

      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.search) queryParams.append('search', params.search);

      const apiUrl = `${buildApiUrl(API_ENDPOINTS.HOMEPAGE_SLIDERS)}?${queryParams.toString()}`;
      
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
          throw new Error('Access denied. You do not have permission to access sliders.');
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
      console.error('Error fetching sliders:', error);
      throw error;
    }
  }

  /**
   * Get active sliders (for website display)
   */
  static async getActiveSliders() {
    try {
      const apiUrl = buildApiUrl(API_ENDPOINTS.HOMEPAGE_SLIDERS_ACTIVE);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
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
      console.error('Error fetching active sliders:', error);
      throw error;
    }
  }

  /**
   * Get single slider by ID
   */
  static async getSliderById(sliderId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access slider details.');
      }

      if (!sliderId) {
        throw new Error('Slider ID is required');
      }

      const apiUrl = buildApiUrl(API_ENDPOINTS.HOMEPAGE_SLIDER(sliderId));
      
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
        if (response.status === 404) {
          throw new Error('Slider not found.');
        }
        
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
      console.error('Error fetching slider:', error);
      throw error;
    }
  }

  /**
   * Create new slider
   */
  static async createSlider(sliderData) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to create slider.');
      }

      const apiUrl = buildApiUrl(API_ENDPOINTS.HOMEPAGE_SLIDERS);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(sliderData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        
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
      console.error('Error creating slider:', error);
      throw error;
    }
  }

  /**
   * Update existing slider
   */
  static async updateSlider(sliderId, sliderData) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to update slider.');
      }

      if (!sliderId) {
        throw new Error('Slider ID is required');
      }

      const apiUrl = buildApiUrl(API_ENDPOINTS.HOMEPAGE_SLIDER(sliderId));
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(sliderData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 404) {
          throw new Error('Slider not found.');
        }
        
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
      console.error('Error updating slider:', error);
      throw error;
    }
  }

  /**
   * Delete slider
   */
  static async deleteSlider(sliderId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to delete slider.');
      }

      if (!sliderId) {
        throw new Error('Slider ID is required');
      }

      const apiUrl = buildApiUrl(API_ENDPOINTS.HOMEPAGE_SLIDER(sliderId));
      
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
        if (response.status === 404) {
          throw new Error('Slider not found.');
        }
        
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
      console.error('Error deleting slider:', error);
      throw error;
    }
  }

  /**
   * Toggle slider active status
   */
  static async toggleSliderStatus(sliderId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to toggle slider status.');
      }

      if (!sliderId) {
        throw new Error('Slider ID is required');
      }

      const apiUrl = buildApiUrl(API_ENDPOINTS.HOMEPAGE_SLIDER_TOGGLE(sliderId));
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 404) {
          throw new Error('Slider not found.');
        }
        
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
      console.error('Error toggling slider status:', error);
      throw error;
    }
  }

  /**
   * Upload file for slider (images/videos)
   */
  static async uploadFile(file, folderName = 'homepage-sliders') {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to upload files.');
      }

      if (!file) {
        throw new Error('File is required');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('folderName', folderName);

      const apiUrl = buildApiUrl(API_ENDPOINTS.FILE_UPLOAD);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include',
        body: formData
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        
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
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  /**
   * Copy a slider
   */
  static async copySlider(sliderId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to copy sliders.');
      }

      if (!sliderId) {
        throw new Error('Slider ID is required to copy slider.');
      }

      const apiUrl = `${buildApiUrl(API_ENDPOINTS.HOMEPAGE_SLIDERS)}/${sliderId}/copy`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include'
      });

      if (!response.ok) {
        let errorMessage = 'Failed to copy slider';
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
      console.error('Error copying slider:', error);
      throw error;
    }
  }
}

export default HomepageSliderService;