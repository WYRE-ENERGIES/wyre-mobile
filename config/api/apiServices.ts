/**
 * Global Axios instances — mirrors admin_frontend_v2/src/config/Api/apiServices.js
 */
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import EnvData from '@/config/EnvData';
import { clearAuthStorage, getStoredTokens } from '@/config/storage';

export const instance = axios.create({
  baseURL: EnvData.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 200000,
});

export const instanceMultipart = axios.create({
  baseURL: EnvData.REACT_APP_API_URL,
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 200000,
});

export const instanceNoAuth = axios.create({
  baseURL: EnvData.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 200000,
});

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;

/** Register a callback (e.g. navigation reset) when the API returns 401. */
export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

const useConfig = async (config: InternalAxiosRequestConfig) => {
  const tokens = await getStoredTokens();
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
};

const responseOk = (response: AxiosResponse) => response;

const responseError = async (error: AxiosError) => {
  if (error.response?.status === 401) {
    await clearAuthStorage();
    onUnauthorized?.();
  }
  return Promise.reject(error);
};

instance.interceptors.request.use(useConfig);
instance.interceptors.response.use(responseOk, responseError);
instanceMultipart.interceptors.request.use(useConfig);
instanceMultipart.interceptors.response.use(responseOk, responseError);

export const APIService = {
  get(endpoint: string, config: AxiosRequestConfig | null = null) {
    return config ? instance.get(endpoint, config) : instance.get(endpoint);
  },

  post(endpoint: string, data?: unknown, config: AxiosRequestConfig = {}) {
    return instance.post(endpoint, data, config);
  },

  patch(endpoint: string, data?: unknown) {
    return instance.patch(endpoint, data);
  },

  delete(endpoint: string, data: unknown = {}) {
    return instance.delete(endpoint, { data });
  },

  put(endpoint: string, data?: unknown) {
    return instance.put(endpoint, data);
  },

  postMultipart(endpoint: string, data?: unknown, config: AxiosRequestConfig = {}) {
    return instanceMultipart.post(endpoint, data, config);
  },

  patchMultipart(endpoint: string, data?: unknown) {
    return instanceMultipart.patch(endpoint, data);
  },

  putMultipart(endpoint: string, data?: unknown) {
    return instanceMultipart.put(endpoint, data);
  },
};

export const APIServiceNoAuth = {
  get(endpoint: string, config: AxiosRequestConfig | null = null) {
    return config ? instanceNoAuth.get(endpoint, config) : instanceNoAuth.get(endpoint);
  },

  post(endpoint: string, data?: unknown) {
    return instanceNoAuth.post(endpoint, data);
  },

  patch(endpoint: string, data?: unknown) {
    return instanceNoAuth.patch(endpoint, data);
  },

  delete(endpoint: string) {
    return instanceNoAuth.delete(endpoint);
  },

  put(endpoint: string, data?: unknown) {
    return instanceNoAuth.put(endpoint, data);
  },
};
