import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "../config/env";
import { tokenStorage } from "../auth/tokenStorage";
import type { AuthResponseDto } from "../types/auth";

interface RetryRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const axiosClient = axios.create({
  baseURL: env.apiUrl,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post<AuthResponseDto>(
      `${env.apiUrl}/api/Auth/Refresh`,
      { refreshToken },
    );

    tokenStorage.saveAuth(response.data);

    return response.data.accessToken;
  } catch {
    tokenStorage.clear();
    return null;
  }
}

axiosClient.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null;
    });

    const accessToken = await refreshPromise;

    if (!accessToken) {
      window.location.assign("/login");
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

    return axiosClient(originalRequest);
  },
);
