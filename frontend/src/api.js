// frontend/src/api.js (Pastikan setting ini ada)

import axios from 'axios';

const api = axios.create({
    baseURL: 'http://192.168.1.100:8000/api',// Sesuaikan dengan port Laravel Anda
    withCredentials: true, // PENTING: Untuk mengirim cookie dan header Auth dengan benar
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        // Token akan ditambahkan di interceptor atau per permintaan
    }
});

// Anda mungkin memiliki Interceptor untuk menambahkan Bearer Token:
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;