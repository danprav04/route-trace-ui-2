import apiClient from './api';
import Cookies from 'js-cookie';

// Matches the Python UserG model
const login = async (username, password) => {
  try {
    // Backend endpoint: /verify-device-auth
    // Backend expects: { username: "user", password: "pw" } in the body
    const response = await apiClient.post('/verify-device-auth', { username, password });
    const token = response.data; // Assuming the backend returns the token directly in the data

    if (token) {
      // Store token in cookie - Secure flag should be true in production (HTTPS)
      Cookies.set('authToken', token, { expires: 1, path: '/' /*, secure: true, sameSite: 'strict' */ });
      // You might want to fetch user details here if needed, or decode the token if it's a JWT
      // For now, we just store the token. The presence of the token implies logged in status.
      return { success: true, user: { username } }; // Return basic user info
    } else {
      throw new Error('No token received from server');
    }
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
};

const logout = () => {
    Cookies.remove('authToken', { path: '/' });
    // No API call needed unless backend has session invalidation
};

const authService = {
  login,
  logout,
};

export default authService;