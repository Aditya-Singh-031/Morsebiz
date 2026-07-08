import { buildApiUrl, API_ENDPOINTS } from '../config/api';
import Cookies from 'js-cookie';

/**
 * Dashboard API Service
 * Handles all dashboard-related API calls
 */
class DashboardService {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats data
   */
  static async getDashboardStats() {
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
      
      const response = await fetch(buildApiUrl(API_ENDPOINTS.DASHBOARD_STATS), {
        method: 'GET',
        headers,
        credentials: 'include', // Include cookies for authentication
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch dashboard stats');
      }

      // Return the data property which contains stats, recentUsers, recentVideos, topVideos
      return result.data;
    } catch (error) {
      // Dashboard stats fetch error
      throw error;
    }
  }

  /**
   * Format number for display (e.g., 1234 -> 1.2K)
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  static formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  /**
   * Calculate percentage change
   * @param {number} current - Current value
   * @param {number} previous - Previous value
   * @returns {Object} Change percentage and trend
   */
  static calculateChange(current, previous) {
    if (previous === 0) {
      return { percentage: 0, trend: 'neutral' };
    }
    
    const change = ((current - previous) / previous) * 100;
    const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
    
    return {
      percentage: Math.abs(change).toFixed(1),
      trend
    };
  }

  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  static formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Format time for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted time
   */
  static formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}

export default DashboardService;