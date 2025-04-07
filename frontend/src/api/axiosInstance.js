import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://agent-maker-backend.vercel.app';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Important for sending cookies (like the refresh token)
});

// Function to get the access token (replace with your actual storage mechanism)
const getAccessToken = () => localStorage.getItem('accessToken');

// Function to set the access token (replace with your actual storage mechanism)
const setAccessToken = (token) => localStorage.setItem('accessToken', token);

// Function to remove the access token
const removeAccessToken = () => localStorage.removeItem('accessToken');


// Request Interceptor: Adds the access token to the Authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token && config.headers) {
            // Don't add Auth header to refresh token request itself
            if (config.url !== '/api/auth/refresh') {
                 config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


// Response Interceptor: Handles token expiry and refresh logic
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => {
        return response; // Pass successful responses through
    },
    async (error) => {
        const originalRequest = error.config;

        // Check if the error is 401, not for the refresh endpoint, and not already retrying
        if (error.response?.status === 401 && originalRequest.url !== '/api/auth/refresh' && !originalRequest._retry) {

            if (isRefreshing) {
                // If already refreshing, queue the request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return axiosInstance(originalRequest); // Retry with new token
                }).catch(err => {
                    return Promise.reject(err); // Propagate error if refresh failed
                });
            }

            originalRequest._retry = true; // Mark as retrying
            isRefreshing = true;

            try {
                // Attempt to refresh the token using the /api/auth/refresh endpoint
                const refreshResponse = await axiosInstance.post('/api/auth/refresh');
                const newAccessToken = refreshResponse.data.accessToken;

                // Store the new access token
                setAccessToken(newAccessToken);

                // Update the Authorization header for the original request
                axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newAccessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;

                processQueue(null, newAccessToken); // Process queued requests with new token
                return axiosInstance(originalRequest); // Retry the original request

            } catch (refreshError) {
                 console.error('Unable to refresh token:', refreshError);
                 // Clear tokens and trigger logout if refresh fails
                 removeAccessToken();
                 // TODO: Ideally, call the logout function from AuthContext here
                 // This might require passing the logout function or using events/state management
                 // For simplicity now, redirecting
                 processQueue(refreshError, null); // Reject queued requests
                 window.location.href = '/login'; // Force redirect to login
                 return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // For errors other than 401 or for the refresh endpoint itself, just reject
        return Promise.reject(error);
    }
);

export { axiosInstance, setAccessToken, getAccessToken, removeAccessToken }; 