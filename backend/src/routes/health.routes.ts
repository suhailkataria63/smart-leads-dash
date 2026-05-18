import { Router } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";

const healthRouter = Router();

healthRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.status(200).json({
      success: true,
      message: "Smart Leads Dashboard API is healthy",
    });
  }),
);

export { healthRouter };

