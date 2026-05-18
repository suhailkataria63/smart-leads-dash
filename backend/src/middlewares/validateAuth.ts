import type { RequestHandler } from "express";

import { UserRole } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const validateRegister: RequestHandler = (req, _res, next) => {
  if (!isObject(req.body)) {
    throw new ApiError(400, "Request body must be an object");
  }

  const { name, email, password, role } = req.body;

  if (!isNonEmptyString(name)) {
    throw new ApiError(400, "Name is required");
  }

  if (!isNonEmptyString(email) || !isValidEmail(email)) {
    throw new ApiError(400, "A valid email is required");
  }

  if (!isNonEmptyString(password) || password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  if (role !== undefined && !Object.values(UserRole).includes(role as UserRole)) {
    throw new ApiError(400, "Role must be admin or sales");
  }

  req.body = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role,
  };

  next();
};

const validateLogin: RequestHandler = (req, _res, next) => {
  if (!isObject(req.body)) {
    throw new ApiError(400, "Request body must be an object");
  }

  const { email, password } = req.body;

  if (!isNonEmptyString(email) || !isValidEmail(email)) {
    throw new ApiError(400, "A valid email is required");
  }

  if (!isNonEmptyString(password)) {
    throw new ApiError(400, "Password is required");
  }

  req.body = {
    email: email.trim().toLowerCase(),
    password,
  };

  next();
};

export { validateLogin, validateRegister };
