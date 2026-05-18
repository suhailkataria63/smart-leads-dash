import { Types } from "mongoose";

import { Lead, LeadSource, LeadStatus, type LeadDocument } from "../models/Lead.js";
import { UserRole } from "../models/User.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

interface LeadIdParams {
  id: string;
}

interface CreateLeadRequestBody {
  name: string;
  email: string;
  status?: LeadStatus;
  source: LeadSource;
}

interface UpdateLeadRequestBody {
  name?: string;
  email?: string;
  status?: LeadStatus;
  source?: LeadSource;
}

const getAuthenticatedUser = (req: Express.Request) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  return req.user;
};

const getLeadAccessFilter = (user: Express.Request["user"]) => {
  if (!user) {
    throw new ApiError(401, "Authentication required");
  }

  if (user.role === UserRole.Admin) {
    return {};
  }

  return { createdBy: new Types.ObjectId(user.id) };
};

const formatLead = (lead: LeadDocument) => ({
  id: lead.id,
  name: lead.name,
  email: lead.email,
  status: lead.status,
  source: lead.source,
  createdBy: lead.createdBy.toString(),
  createdAt: lead.createdAt,
});

const createLead = asyncHandler<CreateLeadRequestBody>(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const { name, email, status = LeadStatus.New, source } = req.body;

  const lead = await Lead.create({
    name,
    email,
    status,
    source,
    createdBy: user.id,
  });

  res.status(201).json({
    success: true,
    data: {
      lead: formatLead(lead),
    },
  });
});

const getLeads = asyncHandler(async (req, res) => {
  const accessFilter = getLeadAccessFilter(req.user);
  const leads = await Lead.find(accessFilter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: {
      leads: leads.map(formatLead),
    },
  });
});

const getLeadById = asyncHandler<unknown, LeadIdParams>(async (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid lead id");
  }

  const lead = await Lead.findOne({
    _id: id,
    ...getLeadAccessFilter(req.user),
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  res.status(200).json({
    success: true,
    data: {
      lead: formatLead(lead),
    },
  });
});

const updateLead = asyncHandler<UpdateLeadRequestBody, LeadIdParams>(
  async (req, res) => {
    const { id } = req.params;

    if (!Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid lead id");
    }

    const lead = await Lead.findOneAndUpdate(
      {
        _id: id,
        ...getLeadAccessFilter(req.user),
      },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!lead) {
      throw new ApiError(404, "Lead not found");
    }

    res.status(200).json({
      success: true,
      data: {
        lead: formatLead(lead),
      },
    });
  },
);

const deleteLead = asyncHandler<unknown, LeadIdParams>(async (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid lead id");
  }

  const lead = await Lead.findOneAndDelete({
    _id: id,
    ...getLeadAccessFilter(req.user),
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  res.status(200).json({
    success: true,
    message: "Lead deleted successfully",
  });
});

export { createLead, deleteLead, getLeadById, getLeads, updateLead };
export type { CreateLeadRequestBody, UpdateLeadRequestBody };
