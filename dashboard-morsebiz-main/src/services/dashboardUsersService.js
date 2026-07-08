import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import Cookies from 'js-cookie';

/**
 * Dashboard Users API Service
 * Handles all dashboard users-related API calls
 */
class DashboardUsersService {
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
   * Get all dashboard users with pagination and filters
   */
  static async getAllUsers(params = {}) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to access dashboard users.');
      }

      const queryParams = new URLSearchParams();
      
      // Add pagination params
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      
      // Add search and filter params
      if (params.search) queryParams.append('search', params.search);
      if (params.role) queryParams.append('role', params.role);
      if (params.status) queryParams.append('status', params.status);

      const apiUrl = `${buildApiUrl(API_ENDPOINTS.DASHBOARD_USERS_LIST)}?${queryParams.toString()}`;
      
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
          throw new Error('Access denied. You do not have permission to access dashboard users.');
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
      console.error('Error fetching dashboard users:', error);
      throw error;
    }
  }

  /**
   * Get all dashboard users with pagination and filters
   */
  static async getUsers(params = {}) {
    return this.getAllUsers(params);
  }

  /**
   * Update a dashboard user
   */
  static async updateUser(userId, userData) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to update users.');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/users/${userId}`);
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to update users.');
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
      console.error('Error updating dashboard user:', error);
      throw error;
    }
  }

  /**
   * Create a new dashboard user
   */
  static async createUser(userData) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to create users.');
      }

      const apiUrl = buildApiUrl(API_ENDPOINTS.DASHBOARD_USERS_CREATE);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to create users.');
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
      console.error('Error creating dashboard user:', error);
      throw error;
    }
  }

  /**
   * Update user status
   */
  static async updateUserStatus(userId, status) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to update user status.');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/users/${userId}/status`);
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
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
          throw new Error('Access denied. You do not have permission to update user status.');
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
      console.error('Error updating user status:', error);
      throw error;
    }
  }

  /**
   * Update user role
   */
  static async updateUserRole(userId, role) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to update user role.');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/users/${userId}/role`);
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ role })
      });

      if (!response.ok) {
        if (response.status === 401) {
          Cookies.remove('adminToken');
          throw new Error('Authentication failed. Please login again.');
        }
        if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to update user role.');
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
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Delete a dashboard user
   */
  static async deleteUser(userId) {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error('No admin token found. Please login to delete users.');
      }

      const apiUrl = buildApiUrl(`/api/dashboard/users/${userId}`);
      
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
          throw new Error('Access denied. You do not have permission to delete users.');
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
      console.error('Error deleting dashboard user:', error);
      throw error;
    }
  }
}

export default DashboardUsersService;