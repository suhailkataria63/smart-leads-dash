import { Router } from "express";

import {
  createLead,
  deleteLead,
  getLeadById,
  getLeads,
  updateLead,
} from "../controllers/lead.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validateCreateLead, validateUpdateLead } from "../middlewares/validateLead.js";

const leadRouter = Router();

leadRouter.use(authenticate);

leadRouter.post("/", validateCreateLead, createLead);
leadRouter.get("/", getLeads);
leadRouter.get("/:id", getLeadById);
leadRouter.put("/:id", validateUpdateLead, updateLead);
leadRouter.delete("/:id", deleteLead);

export { leadRouter };
