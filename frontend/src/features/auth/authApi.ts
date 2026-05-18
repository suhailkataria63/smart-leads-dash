import { apiClient } from "../../api/client";

import type { AuthResponse, LoginCredentials, RegisterCredentials } from "./types";

async function loginRequest(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", credentials);

  return response.data;
}

async function registerRequest(credentials: RegisterCredentials): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/register", credentials);

  return response.data;
}

export { loginRequest, registerRequest };

