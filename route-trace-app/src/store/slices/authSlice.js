import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import Cookies from 'js-cookie';

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const data = await authService.login(username, password);
      return data; // Should return { success: true, user: { username } }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Initial state checks if a token exists in cookies
const initialState = {
  user: null,
  isAuthenticated: !!Cookies.get('authToken'), // Check cookie on initial load
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logoutUser: (state) => {
      authService.logout(); // Clear cookie
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    resetAuthError: (state) => {
        state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user; // Store user info from payload
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload; // Error message from rejectWithValue
      });
  },
});

export const { logoutUser, resetAuthError } = authSlice.actions;
export default authSlice.reducer;