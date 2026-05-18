import jwt from "jsonwebtoken";

import { User, UserRole, type UserDocument } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

interface AuthTokenPayload {
  userId: string;
  role: UserRole;
}

interface RegisterRequestBody {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

const createAuthToken = (user: UserDocument): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new ApiError(500, "JWT_SECRET is not configured");
  }

  const payload: AuthTokenPayload = {
    userId: user.id,
    role: user.role,
  };

  return jwt.sign(payload, jwtSecret, { expiresIn: "7d" });
};

const formatUser = (user: UserDocument) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const register = asyncHandler<RegisterRequestBody>(async (req, res) => {
  const { name, email, password, role = UserRole.Sales } = req.body;

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const user = await User.create({ name, email, password, role });
  const token = createAuthToken(user);

  res.status(201).json({
    success: true,
    token,
    user: formatUser(user),
  });
});

const login = asyncHandler<LoginRequestBody>(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    throw new ApiError(401, "Invalid email or password");
  }

  const token = createAuthToken(user);

  res.status(200).json({
    success: true,
    token,
    user: formatUser(user),
  });
});

const getProfile = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json({
    success: true,
    user: formatUser(user),
  });
});

export { getProfile, login, register };
export type { AuthTokenPayload, LoginRequestBody, RegisterRequestBody };
