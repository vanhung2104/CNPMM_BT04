import axios from "./axios.customize.ts";

export interface User {
  name: string;
  email: string;
  password?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  EC: number;
  EM: string;
  data: {
    products: Product[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalProducts: number;
      hasMore: boolean;
      limit: number;
    };
  };
}

export interface ApiResponse<T = unknown> {
  EC: number;
  EM: string;
  data: T;
}


const createUserApi = (email: string, name: string, password: string) => {
  const URL_API = "/v1/api/register";
  const data = { email, name, password };
  return axios.post<ApiResponse<User>>(URL_API, data);
};


const loginApi = (email: string, password: string) => {
  const URL_API = "/v1/api/login";
  const data = { email, password };
  return axios.post<ApiResponse<{ access_token: string }>>(URL_API, data);
};


const getUserApi = () => {
  const URL_API = "/v1/api/user";
  return axios.get<ApiResponse<User>>(URL_API);
};

const getProductsApi = (page: number = 1, limit: number = 10, category: string = '') => {
  const URL_API = `/v1/api/products?page=${page}&limit=${limit}&category=${category}`;
  return axios.get<ProductsResponse>(URL_API);
};

const createProductApi = (productData: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>) => {
  const URL_API = "/v1/api/products";
  return axios.post<ApiResponse<Product>>(URL_API, productData);
};

const getCategoriesApi = () => {
  const URL_API = "/v1/api/categories";
  return axios.get<ApiResponse<string[]>>(URL_API);
};

export { createUserApi, loginApi, getUserApi, getProductsApi, createProductApi, getCategoriesApi };
