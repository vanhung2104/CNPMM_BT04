import axios from "axios";
import type { AxiosResponse } from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:8080",
});

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    if (error?.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

// 🔑 định nghĩa lại kiểu cho instance (dùng unknown thay vì any)
type ApiInstance = {
  get<T = unknown>(url: string, config?: object): Promise<T>;
  post<T = unknown>(url: string, data?: unknown, config?: object): Promise<T>;
  put<T = unknown>(url: string, data?: unknown, config?: object): Promise<T>;
  delete<T = unknown>(url: string, config?: object): Promise<T>;
};

export default instance as ApiInstance;
