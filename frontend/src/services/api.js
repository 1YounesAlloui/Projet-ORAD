import axios from 'axios';
import toast from 'react-hot-toast';

const localURL = 'http://127.0.0.1:8000/api/';
const remoteURL = import.meta.env.VITE_API_URL || 'https://medicalbook.onrender.com/api/';

const cachedUseLocal = localStorage.getItem('use_local_backend') === 'true';
const baseURL = cachedUseLocal ? localURL : remoteURL;

const api = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Fast non-blocking ping check to auto-detect offline local server availability
const detectBackend = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 600); // Super fast 600ms timeout
        await fetch('http://127.0.0.1:8000/api/doctors/', { signal: controller.signal, mode: 'no-cors' });
        clearTimeout(timeoutId);
        
        // If succeeded and weren't using it, switch to local
        if (!cachedUseLocal) {
            localStorage.setItem('use_local_backend', 'true');
            api.defaults.baseURL = localURL;
        }
    } catch (e) {
        // If failed and were using it, revert back to remote
        if (cachedUseLocal) {
            localStorage.setItem('use_local_backend', 'false');
            api.defaults.baseURL = remoteURL;
        }
    }
};

// Start background detection without blocking main thread
detectBackend();

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Handle 401 Unauthorized (Token refresh logic)
        if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url.includes('login')) {
            originalRequest._retry = true;
            try {
                const refresh_token = localStorage.getItem('refresh_token');
                if (refresh_token) {
                    const response = await axios.post(`${baseURL}login/refresh/`, { refresh: refresh_token });
                    const { access } = response.data;
                    localStorage.setItem('access_token', access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
                    originalRequest.headers['Authorization'] = `Bearer ${access}`;
                    return api(originalRequest);
                }
            } catch (err) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(err);
            }
        }
        
        // Global error toasts
        if (error.response && error.response.status >= 500) {
            toast.error('Server error. Please try again later.');
        } else if (error.response && error.response.status === 403) {
            toast.error('You do not have permission to perform this action.');
        }

        return Promise.reject(error);
    }
);

export default api;
