import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to include token in Authorization header
// Note: withCredentials already sends cookies automatically
api.interceptors.request.use(
    (config) => {
        // Extract token from cookies and add to Authorization header (as backup/redundancy)
        const tokenMatch = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (tokenMatch) {
            const token = tokenMatch.split('=')[1];
            config.headers.Authorization = `Bearer ${token}`;
        }
        // withCredentials: true (set above) ensures cookies are sent with every request
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
