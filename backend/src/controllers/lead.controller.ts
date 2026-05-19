import type { Request } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import { Types, type FilterQuery, type SortOrder } from "mongoose";

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

interface LeadIdParams extends ParamsDictionary {
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
type LeadSortOption = "latest" | "oldest";

const getAuthenticatedUser = (req: Request) => {
  if (!req.user) {
    throw new ApiError(401, "Authentication required");
  }

  return req.user;
};

const getLeadAccessFilter = (user: Request["user"]) => {
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

const formatLeadWithCreator = (lead: LeadDocument) => {
  const populatedCreatedBy = lead.populated("createdBy") ? lead.createdBy : null;

  if (
    populatedCreatedBy &&
    typeof populatedCreatedBy === "object" &&
    "name" in populatedCreatedBy &&
    "email" in populatedCreatedBy &&
    "role" in populatedCreatedBy
  ) {
    return {
      ...formatLead(lead),
      createdBy: {
        id: populatedCreatedBy._id.toString(),
        name: String(populatedCreatedBy.name),
        email: String(populatedCreatedBy.email),
        role: String(populatedCreatedBy.role),
      },
    };
  }

  return formatLead(lead);
};

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

const getLeadQueryOptions = (req: Request) => {
  const status = getSingleQueryValue(req.query.status);
  const source = getSingleQueryValue(req.query.source);
  const search = getSingleQueryValue(req.query.search);
  const sort = (getSingleQueryValue(req.query.sort) ?? "latest") as LeadSortOption;

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

  const sortOrder: SortOrder = sort === "oldest" ? 1 : -1;

  return {
    filter,
    sortOrder,
  };
};

const escapeCsvValue = (value: string): string => {
  if (!/[",\n\r]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
};

const formatCsvDate = (date: Date): string => {
  return date.toISOString();
};

const buildLeadsCsv = (leads: LeadDocument[]): string => {
  const headers = ["Name", "Email", "Status", "Source", "Created At"];
  const rows = leads.map((lead) => [
    lead.name,
    lead.email,
    lead.status,
    lead.source,
    formatCsvDate(lead.createdAt),
  ]);

  return [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(","))
    .join("\n");
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
  const currentPage = parsePage(req.query.page);
  const { filter, sortOrder } = getLeadQueryOptions(req);

  const skip = (currentPage - 1) * LEADS_PAGE_LIMIT;

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

const exportLeadsCsv = asyncHandler(async (req, res) => {
  const { filter, sortOrder } = getLeadQueryOptions(req);
  const leads = await Lead.find(filter).sort({ createdAt: sortOrder });
  const csv = buildLeadsCsv(leads);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="leads.csv"');
  res.status(200).send(csv);
});

const getLeadById = asyncHandler<unknown, LeadIdParams>(async (req, res) => {
  const { id } = req.params;

  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid lead id");
  }

  const lead = await Lead.findOne({
    _id: id,
    ...getLeadAccessFilter(req.user),
  }).populate("createdBy", "name email role");

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  res.status(200).json({
    success: true,
    data: {
      lead: formatLeadWithCreator(lead),
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

export { createLead, deleteLead, exportLeadsCsv, getLeadById, getLeads, updateLead };
export type { CreateLeadRequestBody, UpdateLeadRequestBody };
