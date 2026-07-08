// API Configuration
import config from './config';
const API_CONFIG = {
  BASE_URL: config.API_BASE_URL,
  ENDPOINTS: {
    // Auth endpoints.
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    
    // Admin endpoints
    DASHBOARD_STATS: '/api/admin/dashboard',
    ACTIVITIES: '/api/admin/activities',
    USERS: '/api/admin/users',
    CREATORS: '/api/admin/creators',
    CREATOR_APPLICATIONS: '/api/admin/creator-applications',
    VIDEOS: '/api/admin/videos',
    
    // User management
    GET_USER: (userId) => `/api/admin/users/${userId}`,
    UPDATE_USER_STATUS: (userId) => `/api/admin/users/${userId}/status`,
    UPDATE_USER_ROLE: (userId) => `/api/admin/users/${userId}/role`,
    UPDATE_USER: (userId) => `/api/admin/users/${userId}`,
    UPDATE_USER_PASSWORD: (userId) => `/api/admin/users/${userId}/password`,
    
    // Creator management
    GET_CREATOR: (creatorId) => `/api/admin/creators/${creatorId}`,
    GET_CREATOR_VIDEOS: (creatorId) => `/api/admin/creators/${creatorId}/videos`,
    GET_CREATOR_STATISTICS: (creatorId) => `/api/users/${creatorId}/statistics`,
    UPDATE_CREATOR: (creatorId) => `/api/admin/creators/${creatorId}`,
    UPDATE_CREATOR_PASSWORD: (creatorId) => `/api/admin/creators/${creatorId}/password`,
    UPDATE_CREATOR_STATUS: (creatorId) => `/api/admin/creators/${creatorId}/status`,
    
    // Creator applications
    PROCESS_CREATOR_APPLICATION: (applicationId) => `/api/admin/creator-applications/${applicationId}/process`,
    
    // Upgrade requests
    UPGRADE_REQUESTS: '/api/admin/upgrade-requests',
    PROCESS_UPGRADE_REQUEST: (requestId) => `/api/admin/upgrade-requests/${requestId}`,
    
    // Video management
    DELETE_VIDEO: (videoId) => `/api/admin/videos/${videoId}`,
    UPDATE_VIDEO: (videoId) => `/api/admin/videos/${videoId}`,
    
    // Categories and Hashtags
    CATEGORIES: '/api/categories',
    HASHTAGS: '/api/hashtags',
    
    // Dashboard Users
    DASHBOARD_USERS_LOGIN: '/dashboard-users/login',
    DASHBOARD_USERS_LIST: '/dashboard-users/list',
    DASHBOARD_USERS_CREATE: '/dashboard-users/create',
    DASHBOARD_USERS_PROFILE: '/dashboard-users/profile',
    DASHBOARD_USERS_CHECK_AUTH: '/dashboard-users/check-auth',
    DASHBOARD_USERS_VERIFY_TOKEN: '/dashboard-users/verify-token',
    
    // Admin Categories
    ADMIN_CATEGORIES: '/api/admin/categories',
    ADMIN_CATEGORY: (categoryId) => `/api/admin/categories/${categoryId}`,
    
    // Admin Badges
    ADMIN_BADGES: '/api/dashboard/badges',
    ADMIN_BADGE: (badgeId) => `/api/dashboard/badges/${badgeId}`,
    ADMIN_BADGES_SEARCH: '/api/dashboard/badges/search',
    ADMIN_BADGES_STATS: '/api/dashboard/badges/stats',
    
    // Products
  PRODUCTS: '/api/dashboard/products',
  PRODUCT_STATS: '/api/dashboard/products/stats/summary',
  PRODUCT_FILTERS_BRANDS: '/api/dashboard/products/filters/brands',
  PRODUCT_FILTERS_CATEGORIES: '/api/dashboard/products/filters/categories',
  PRODUCT_FILTERS_COUNTRIES: '/api/dashboard/products/filters/countries',
  PRODUCT_FILTERS_BADGES: '/api/dashboard/products/filters/badges',
  PRODUCT_FILTERS_ALL: '/api/dashboard/products/filters/all',
    PRODUCT_IMAGES_UPLOAD: '/api/dashboard/product-images/upload',
    PRODUCT_IMAGES_INSTANT_UPLOAD: '/api/dashboard/products/instant-upload',
    PRODUCT_IMAGES_MULTIPLE_INSTANT_UPLOAD: '/api/dashboard/products/multiple-instant-upload',
    
    // File Upload
    FILE_UPLOAD: '/api/dashboard/file-upload/upload',
    
    // Homepage Sliders
    HOMEPAGE_SLIDERS: '/api/dashboard/homepage-sliders',
    HOMEPAGE_SLIDER: (sliderId) => `/api/dashboard/homepage-sliders/${sliderId}`,
    HOMEPAGE_SLIDERS_ACTIVE: '/api/dashboard/homepage-sliders/active',
    HOMEPAGE_SLIDER_TOGGLE: (sliderId) => `/api/dashboard/homepage-sliders/${sliderId}/toggle`
  }
};

// Helper function to build complete URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get endpoint
export const getEndpoint = (key, ...params) => {
  const endpoint = API_CONFIG.ENDPOINTS[key];
  if (typeof endpoint === 'function') {
    return endpoint(...params);
  }
  return endpoint;
};

// Export individual endpoints for easier access
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;

export default API_CONFIG;