import type { AuthResponseDto } from "../types/auth";
import type { UserDto } from "../types/user";

const ACCESS_TOKEN_KEY = "sas.accessToken";
const REFRESH_TOKEN_KEY = "sas.refreshToken";
const USER_KEY = "sas.user";

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  getUser(): UserDto | null {
    const raw = localStorage.getItem(USER_KEY);

    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as UserDto;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  saveAuth(data: AuthResponseDto): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  },

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
};
