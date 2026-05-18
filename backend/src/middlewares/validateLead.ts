import type { RequestHandler } from "express";

import { LeadSource, LeadStatus } from "../models/Lead.js";
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

const isValidStatus = (value: unknown): value is LeadStatus => {
  return Object.values(LeadStatus).includes(value as LeadStatus);
};

const isValidSource = (value: unknown): value is LeadSource => {
  return Object.values(LeadSource).includes(value as LeadSource);
};

const validateCreateLead: RequestHandler = (req, _res, next) => {
  if (!isObject(req.body)) {
    throw new ApiError(400, "Request body must be an object");
  }

  const { name, email, status, source } = req.body;

  if (!isNonEmptyString(name)) {
    throw new ApiError(400, "Name is required");
  }

  if (!isNonEmptyString(email) || !isValidEmail(email)) {
    throw new ApiError(400, "A valid email is required");
  }

  if (status !== undefined && !isValidStatus(status)) {
    throw new ApiError(400, "Status must be New, Contacted, Qualified, or Lost");
  }

  if (!isValidSource(source)) {
    throw new ApiError(400, "Source must be Website, Instagram, or Referral");
  }

  req.body = {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    status,
    source,
  };

  next();
};

const validateUpdateLead: RequestHandler = (req, _res, next) => {
  if (!isObject(req.body)) {
    throw new ApiError(400, "Request body must be an object");
  }

  const { name, email, status, source } = req.body;
  const updateBody: Record<string, string> = {};

  if (name !== undefined) {
    if (!isNonEmptyString(name)) {
      throw new ApiError(400, "Name must be a non-empty string");
    }

    updateBody.name = name.trim();
  }

  if (email !== undefined) {
    if (!isNonEmptyString(email) || !isValidEmail(email)) {
      throw new ApiError(400, "A valid email is required");
    }

    updateBody.email = email.trim().toLowerCase();
  }

  if (status !== undefined) {
    if (!isValidStatus(status)) {
      throw new ApiError(400, "Status must be New, Contacted, Qualified, or Lost");
    }

    updateBody.status = status;
  }

  if (source !== undefined) {
    if (!isValidSource(source)) {
      throw new ApiError(400, "Source must be Website, Instagram, or Referral");
    }

    updateBody.source = source;
  }

  if (Object.keys(updateBody).length === 0) {
    throw new ApiError(400, "At least one lead field is required");
  }

  req.body = updateBody;
  next();
};

export { validateCreateLead, validateUpdateLead };
