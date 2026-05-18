import { Types, type FilterQuery } from "mongoose";

import {
  Lead,
  LeadSource,
  LeadStatus,
  type ILead,
  type LeadDocument,
} from "../models/Lead.js";
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

const LEADS_PAGE_LIMIT = 10;

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

const getSingleQueryValue = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && typeof value[0] === "string") {
    return value[0];
  }

  return undefined;
};

const escapeRegex = (value: string): string => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parsePage = (value: unknown): number => {
  const pageValue = getSingleQueryValue(value);

  if (!pageValue) {
    return 1;
  }

  const page = Number(pageValue);

  if (!Number.isInteger(page) || page < 1) {
    throw new ApiError(400, "Page must be a positive integer");
  }

  return page;
};

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
  const status = getSingleQueryValue(req.query.status);
  const source = getSingleQueryValue(req.query.source);
  const search = getSingleQueryValue(req.query.search);
  const sort = getSingleQueryValue(req.query.sort) ?? "latest";
  const currentPage = parsePage(req.query.page);

  if (status !== undefined && !Object.values(LeadStatus).includes(status as LeadStatus)) {
    throw new ApiError(400, "Status must be New, Contacted, Qualified, or Lost");
  }

  if (source !== undefined && !Object.values(LeadSource).includes(source as LeadSource)) {
    throw new ApiError(400, "Source must be Website, Instagram, or Referral");
  }

  if (sort !== "latest" && sort !== "oldest") {
    throw new ApiError(400, "Sort must be latest or oldest");
  }

  const filter: FilterQuery<ILead> = {
    ...getLeadAccessFilter(req.user),
  };

  if (status !== undefined) {
    filter.status = status;
  }

  if (source !== undefined) {
    filter.source = source;
  }

  if (search !== undefined && search.trim().length > 0) {
    const searchRegex = new RegExp(escapeRegex(search.trim()), "i");

    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const skip = (currentPage - 1) * LEADS_PAGE_LIMIT;
  const sortOrder = sort === "oldest" ? 1 : -1;

  const [leads, totalItems] = await Promise.all([
    Lead.find(filter)
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(LEADS_PAGE_LIMIT),
    Lead.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / LEADS_PAGE_LIMIT);

  res.status(200).json({
    success: true,
    data: {
      leads: leads.map(formatLead),
      pagination: {
        totalItems,
        currentPage,
        totalPages,
        limit: LEADS_PAGE_LIMIT,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
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
