import axios from 'axios';

const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
    baseURL: baseURL,
    withCredentials: true, // Include cookies by default
    timeout: 30000 // 30 seconds timeout
});

// Token management functions
const setAccessToken = (token) => {
    if (token) {
        localStorage.setItem('token', token);
        // Also update the default headers for future requests
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        // Clear token if null/undefined is passed
        removeAccessToken();
    }
};

const getAccessToken = () => {
    // Prefer localStorage, fallback to sessionStorage
    return localStorage.getItem('token') || sessionStorage.getItem('token') || null;
};

const removeAccessToken = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    // Also remove from default headers
    delete axiosInstance.defaults.headers.common['Authorization'];
};

// Add request interceptor to attach token to every request
axiosInstance.interceptors.request.use(
    (config) => {
        // Ensure withCredentials is set for all requests
        config.withCredentials = true;
        
        // Get the token from localStorage
        const token = getAccessToken();
        if (token) {
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
            console.error('Authentication error detected by interceptor');
            // Optional: Clear token and redirect to login upon 401
            // removeAccessToken(); 
            // window.location.href = '/login'; 
        }
        
        return Promise.reject(error);
    }
);

// Export all the necessary functions
export { 
    axiosInstance, 
    setAccessToken, 
    getAccessToken, 
    removeAccessToken 
}; 