import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { apiClient } from "../../api/client";

import { loginRequest, registerRequest } from "./authApi";
import type { AuthUser, LoginCredentials, RegisterCredentials } from "./types";

interface AuthContextValue {
  isAuthenticated: boolean;
  isInitializing: boolean;
  token: string | null;
  user: AuthUser | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_TOKEN_KEY = "smart-leads-token";
const AUTH_USER_KEY = "smart-leads-user";

const AuthContext = createContext<AuthContextValue | null>(null);

const setAuthorizationHeader = (token: string | null): void => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete apiClient.defaults.headers.common.Authorization;
};

const readStoredUser = (): AuthUser | null => {
  const storedUser = localStorage.getItem(AUTH_USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setAuthorizationHeader(token);
    setIsInitializing(false);
  }, [token]);

  const persistAuth = useCallback((nextToken: string, nextUser: AuthUser) => {
    localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(nextUser));
    setAuthorizationHeader(nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await loginRequest(credentials);

    persistAuth(response.token, response.user);
  }, [persistAuth]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const response = await registerRequest(credentials);

    persistAuth(response.token, response.user);
  }, [persistAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setAuthorizationHeader(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated: Boolean(token && user),
      isInitializing,
      token,
      user,
      login,
      register,
      logout,
    }),
    [isInitializing, login, logout, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext, AuthProvider };

