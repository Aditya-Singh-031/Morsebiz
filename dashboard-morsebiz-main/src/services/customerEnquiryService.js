import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import Cookies from 'js-cookie';

/**
 * Customer Enquiry API Service
 * Handles all customer enquiry-related API calls
 */
class CustomerEnquiryService {
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
   * Get all customer enquiries with pagination (for listing)
   */
  static async getAllCustomerEnquiries(params = {}) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access customer enquiries.');
      }

      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.status) queryParams.append('status', params.status);
      if (params.partial) queryParams.append('partial', params.partial);

      const apiUrl = `${buildApiUrl('/api/dashboard/customer-enquiry')}?${queryParams.toString()}`;
      
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
          throw new Error('Access denied. You do not have permission to access customer enquiries.');
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
      console.error('Error fetching customer enquiries:', error);
      throw error;
    }
  }

  /**
   * Search customer enquiries (for search functionality)
   */
  static async searchCustomerEnquiries(params = {}) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to search customer enquiries.');
      }

      const queryParams = new URLSearchParams();
      
      // Add search params
      if (params.search) queryParams.append('search', params.search);
      if (params.limit) queryParams.append('limit', params.limit || 50); // Default limit for search
      if (params.status) queryParams.append('status', params.status);
      if (params.partial) queryParams.append('partial', params.partial);

      const apiUrl = `${buildApiUrl('/api/dashboard/customer-enquiry/search')}?${queryParams.toString()}`;
      
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
          throw new Error('Access denied. You do not have permission to search customer enquiries.');
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
      console.error('Error searching customer enquiries:', error);
      throw error;
    }
  }

  /**
   * Get single customer enquiry by ID
   */
  static async getCustomerEnquiryById(id) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access customer enquiry details.');
      }

      if (!id) {
        throw new Error('Customer enquiry ID is required');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/customer-enquiry/${id}`);
      
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
          throw new Error('Access denied. You do not have permission to access this customer enquiry.');
        }
        if (response.status === 404) {
          throw new Error('Customer enquiry not found.');
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
      console.error('Error fetching customer enquiry details:', error);
      throw error;
    }
  }

  /**
   * Update customer enquiry status
   */
  static async updateCustomerEnquiryStatus(id, status) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to update customer enquiry status.');
      }

      if (!id) {
        throw new Error('Customer enquiry ID is required');
      }

      if (!status) {
        throw new Error('Status is required');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/customer-enquiry/${id}/status`);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to update customer enquiry status.');
        }
        if (response.status === 404) {
          throw new Error('Customer enquiry not found.');
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
      console.error('Error updating customer enquiry status:', error);
      throw error;
    }
  }

  /**
   * Delete customer enquiry
   */
  static async deleteCustomerEnquiry(id) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to delete customer enquiry.');
      }

      if (!id) {
        throw new Error('Customer enquiry ID is required');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/customer-enquiry/${id}`);
      
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
          throw new Error('Access denied. You do not have permission to delete customer enquiries.');
        }
        if (response.status === 404) {
          throw new Error('Customer enquiry not found.');
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
      console.error('Error deleting customer enquiry:', error);
      throw error;
    }
  }

  /**
   * Get customer enquiry statistics
   */
  static async getCustomerEnquiryStats() {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access customer enquiry statistics.');
      }

      const apiUrl = buildApiUrl('/api/dashboard/customer-enquiry/stats/overview');
      
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
          throw new Error('Access denied. You do not have permission to access customer enquiry statistics.');
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
      console.error('Error fetching customer enquiry statistics:', error);
      throw error;
    }
  }
}

export default CustomerEnquiryService;