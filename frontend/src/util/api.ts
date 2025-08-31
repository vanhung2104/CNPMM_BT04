import axios from "./axios.customize.ts";

// Kiểu dữ liệu của user
export interface User {
  name: string;
  email: string;
  password?: string; // password chỉ có khi đăng ký/login
}

// Kiểu dữ liệu trả về từ API chung
export interface ApiResponse<T = unknown> {
  message?: string;
  data?: T;
  // fallback cho field khác
  [key: string]: unknown;
}

// Đăng ký user
const createUserApi = (name: string, email: string, password: string) => {
  const URL_API = "/v1/api/register";
  const data = { name, email, password };
  return axios.post<ApiResponse<User>>(URL_API, data);
};

// Đăng nhập
const loginApi = (email: string, password: string) => {
  const URL_API = "/v1/api/login";
  const data = { email, password };
  return axios.post<ApiResponse<{ access_token: string }>>(URL_API, data);
};

// Lấy thông tin user hiện tại
const getUserApi = () => {
  const URL_API = "/v1/api/user";
  return axios.get<ApiResponse<User>>(URL_API);
};

export { createUserApi, loginApi, getUserApi };
