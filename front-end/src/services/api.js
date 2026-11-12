import axios from 'axios';

export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ✅ Interceptor để tự động gắn token mỗi lần gửi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Hàm để cập nhật token sau khi đăng nhập
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token); // lưu token
  } else {
    localStorage.removeItem('token');
  }
};

export default api;
