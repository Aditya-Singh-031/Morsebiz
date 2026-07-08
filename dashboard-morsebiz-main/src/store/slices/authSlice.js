import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';
import { buildApiUrl, API_ENDPOINTS } from '../../config/api';

import config from '../../config/config.js';

const API_BASE_URL = `${config.API_BASE_URL}/api`;

// Async thunk for admin login
export const loginAdmin = createAsyncThunk(
  'auth/loginAdmin',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(buildApiUrl('/dashboard-users/login'), {
        email,
        password,
      });

      const { accessToken } = response.data.data;

      // Store only token in cookies
      Cookies.set('adminToken', accessToken, { expires: 30 });

      return { token: accessToken };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

// Async thunk for check-auth
export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('adminToken');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const response = await axios.post(buildApiUrl('/dashboard-users/check-auth'), {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { user } = response.data.data;

      // Store user data in cookies after successful auth check
      Cookies.set('adminUser', JSON.stringify(user), { expires: 30 });

      return { user, token };
    } catch (error) {
      // Clear cookies on auth failure
      Cookies.remove('adminToken');
      Cookies.remove('adminUser');
      const message = error.response?.data?.message || error.message || 'Authentication failed';
      return rejectWithValue(message);
    }
  }
);

// Async thunk for logout
export const logoutAdmin = createAsyncThunk(
  'auth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      // Clear cookies
      Cookies.remove('adminToken');
      Cookies.remove('adminUser');
      
      return true;
    } catch (error) {
      return rejectWithValue('Logout failed');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Initialize auth state from cookies
    initializeAuth: (state) => {
      state.isLoading = true;
      const token = Cookies.get('adminToken');
      
      if (token) {
        // Only set token, user data will be fetched via check-auth
        state.token = token;
        state.isAuthenticated = true;
      } else {
        state.isAuthenticated = false;
      }
      state.isLoading = false;
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Clear auth state
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Check-auth cases
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })
      // Logout cases
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { initializeAuth, clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;