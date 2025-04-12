import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
    baseURL: baseURL,
    withCredentials: true, // Include cookies by default
    timeout: 30000 // 30 seconds timeout
});

// Add request interceptor to attach token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        // Get the token from localStorage or sessionStorage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (token) {
            // Add token to headers if it exists
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle authentication errors
        if (error.response && error.response.status === 401) {
            // Option 1: Redirect to login page
            // window.location.href = '/login';
            
            // Option 2: Just log the error and let component handle it
            console.error('Authentication error: Please log in again');
        }
        
        return Promise.reject(error);
    }
);

export { axiosInstance }; 