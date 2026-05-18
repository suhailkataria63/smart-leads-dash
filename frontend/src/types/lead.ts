import type { PaginationMeta } from "./api";

type LeadStatus = "New" | "Contacted" | "Qualified" | "Lost";
type LeadSource = "Website" | "Instagram" | "Referral";

interface Lead {
  id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  createdBy: string;
  createdAt: string;
}

interface LeadsListData {
  leads: Lead[];
  pagination: PaginationMeta;
}

interface LeadPayload {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
}

interface LeadMutationData {
  lead: Lead;
}

export type { Lead, LeadMutationData, LeadPayload, LeadSource, LeadStatus, LeadsListData };
