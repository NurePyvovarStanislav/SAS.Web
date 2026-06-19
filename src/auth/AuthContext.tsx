import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { authApi } from "../api/authApi";
import { isAdministrator } from "./roleUtils";
import { tokenStorage } from "./tokenStorage";
import type { UserDto } from "../types/user";

export interface AuthContextValue {
  user: UserDto | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isInitializing: boolean;
  login(email: string, password: string): Promise<UserDto>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readInitialUser(): UserDto | null {
  const storedUser = tokenStorage.getUser();
  const accessToken = tokenStorage.getAccessToken();

  if (storedUser && accessToken) {
    return storedUser;
  }

  tokenStorage.clear();
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(readInitialUser);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    tokenStorage.saveAuth(response);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null && tokenStorage.getAccessToken() !== null,
      isAdmin: user !== null && isAdministrator(user.role),
      isInitializing: false,
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
