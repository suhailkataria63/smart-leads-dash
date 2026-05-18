import jwt from "jsonwebtoken";
import type { RequestHandler } from "express";

import type { AuthTokenPayload } from "../controllers/auth.controller.js";
import { User } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  if (!token) {
    throw new ApiError(401, "Authentication token is required");
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new ApiError(500, "JWT_SECRET is not configured");
  }

  let decoded: AuthTokenPayload;

  try {
    decoded = jwt.verify(token, jwtSecret) as AuthTokenPayload;
  } catch {
    throw new ApiError(401, "Invalid authentication token");
  }

  if (!decoded.userId || !decoded.role) {
    throw new ApiError(401, "Invalid authentication token");
  }

  const user = await User.findById(decoded.userId).select("_id role");

  if (!user) {
    throw new ApiError(401, "Invalid authentication token");
  }

  req.user = {
    id: user.id,
    role: user.role,
  };

  next();
});

const authorizeRoles = (...roles: AuthTokenPayload["role"][]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      throw new ApiError(401, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, "You do not have permission to access this resource");
    }

    next();
  };
};

export { authenticate, authorizeRoles };
