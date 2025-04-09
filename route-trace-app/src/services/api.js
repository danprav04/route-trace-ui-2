import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'; // Fallback

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('authToken'); // Read token from cookie
    if (token) {
      // Assuming the backend expects the token in an 'Authorization: Bearer <token>' header
      // Adjust 'token' header name if backend expects something different (e.g., 'x-token')
      config.headers['token'] = token; // Use 'Authorization': `Bearer ${token}` if that's the standard used
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Interceptor to handle 401 Unauthorized errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      Cookies.remove('authToken');
      // Optionally redirect to login or dispatch a logout action
      // window.location.href = '/login'; // Hard redirect
      // store.dispatch(logout()); // If you have a logout action
      console.error("Authentication Error: Token invalid or expired.");
    }
    return Promise.reject(error);
  }
);


export default apiClient;