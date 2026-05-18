type UserRole = "admin" | "sales";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export type {
  AuthResponse,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  UserRole,
};

