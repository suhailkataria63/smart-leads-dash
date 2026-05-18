import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiClient } from "../api/client";
import { Button, Card, EmptyState, ErrorMessage, Input, Loader, Select } from "../components";
import { LeadForm } from "../features/leads/LeadForm";
import { getLeadErrorMessage } from "../features/leads/leadMessages";
import { useDebounce } from "../hooks/useDebounce";
import type { ApiResponse } from "../types/api";
import type {
  Lead,
  LeadMutationData,
  LeadPayload,
  LeadSort,
  LeadSource,
  LeadStatus,
  LeadsListData,
} from "../types/lead";

const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load leads";
};

const statusClassNames: Record<Lead["status"], string> = {
  New: "bg-blue-50 text-blue-700 ring-blue-200",
  Contacted: "bg-amber-50 text-amber-700 ring-amber-200",
  Qualified: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Lost: "bg-red-50 text-red-700 ring-red-200",
};

type FormMode = "create" | "edit";
type StatusFilter = LeadStatus | "";
type SourceFilter = LeadSource | "";

interface LeadQueryParams {
  page: number;
  search?: string;
  sort: LeadSort;
  source?: LeadSource;
  status?: LeadStatus;
}

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "All statuses", value: "" },
  { label: "New", value: "New" },
  { label: "Contacted", value: "Contacted" },
  { label: "Qualified", value: "Qualified" },
  { label: "Lost", value: "Lost" },
];

const sourceOptions: Array<{ label: string; value: SourceFilter }> = [
  { label: "All sources", value: "" },
  { label: "Website", value: "Website" },
  { label: "Instagram", value: "Instagram" },
  { label: "Referral", value: "Referral" },
];

const sortOptions: Array<{ label: string; value: LeadSort }> = [
  { label: "Latest", value: "latest" },
  { label: "Oldest", value: "oldest" },
];

function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("");
  const [sort, setSort] = useState<LeadSort>("latest");
  const [pagination, setPagination] = useState<LeadsListData["pagination"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm.trim(), 400);

  useEffect(() => {
    let isMounted = true;

    const fetchLeads = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const params: LeadQueryParams = {
          page: currentPage,
          sort,
        };

        if (debouncedSearchTerm) {
          params.search = debouncedSearchTerm;
        }

        if (statusFilter) {
          params.status = statusFilter;
        }

        if (sourceFilter) {
          params.source = sourceFilter;
        }

        const response = await apiClient.get<ApiResponse<LeadsListData>>("/leads", {
          params,
        });

        if (!isMounted) {
          return;
        }

        setLeads(response.data.data.leads);
        setPagination(response.data.data.pagination);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(getErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchLeads();

    return () => {
      isMounted = false;
    };
  }, [currentPage, debouncedSearchTerm, refreshKey, sort, sourceFilter, statusFilter]);

  const canGoPrevious = pagination?.hasPrevPage ?? false;
  const canGoNext = pagination?.hasNextPage ?? false;
  const hasActiveFilters =
    searchTerm.trim().length > 0 || statusFilter !== "" || sourceFilter !== "" || sort !== "latest";

  const refreshLeads = () => {
    setRefreshKey((key) => key + 1);
  };

  const closeForm = () => {
    setFormMode(null);
    setSelectedLead(null);
  };

  const openCreateForm = () => {
    setActionErrorMessage(null);
    setSuccessMessage(null);
    setSelectedLead(null);
    setFormMode("create");
  };

  const openEditForm = (lead: Lead) => {
    setActionErrorMessage(null);
    setSuccessMessage(null);
    setSelectedLead(lead);
    setFormMode("edit");
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setSourceFilter("");
    setSort("latest");
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: StatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleSourceChange = (value: SourceFilter) => {
    setSourceFilter(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: LeadSort) => {
    setSort(value);
    setCurrentPage(1);
  };

  const handleSubmitLead = async (payload: LeadPayload) => {
    setIsActionLoading(true);
    setActionErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (formMode === "edit" && selectedLead) {
        await apiClient.put<ApiResponse<LeadMutationData>>(`/leads/${selectedLead.id}`, payload);
        setSuccessMessage("Lead updated successfully");
      } else {
        await apiClient.post<ApiResponse<LeadMutationData>>("/leads", payload);
        setSuccessMessage("Lead created successfully");
      }

      closeForm();
      refreshLeads();
    } catch (error) {
      setActionErrorMessage(getLeadErrorMessage(error));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) {
      return;
    }

    setIsActionLoading(true);
    setActionErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiClient.delete(`/leads/${leadToDelete.id}`);
      setSuccessMessage("Lead deleted successfully");
      setLeadToDelete(null);

      if (leads.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        refreshLeads();
      }
    } catch (error) {
      setActionErrorMessage(getLeadErrorMessage(error));
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950">Leads Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">View and track assigned sales leads.</p>
        </div>
        {pagination ? (
          <p className="text-sm text-slate-600">
            {pagination.totalItems} {pagination.totalItems === 1 ? "lead" : "leads"}
          </p>
        ) : null}
        <Button onClick={openCreateForm}>Create Lead</Button>
      </div>

      {successMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {actionErrorMessage ? <ErrorMessage message={actionErrorMessage} /> : null}

      <Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px_160px_auto] xl:items-end">
          <Input
            label="Search"
            name="search"
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder="Search name or email"
            value={searchTerm}
          />
          <Select
            label="Status"
            name="status"
            onChange={(event) => handleStatusChange(event.target.value as StatusFilter)}
            options={statusOptions}
            value={statusFilter}
          />
          <Select
            label="Source"
            name="source"
            onChange={(event) => handleSourceChange(event.target.value as SourceFilter)}
            options={sourceOptions}
            value={sourceFilter}
          />
          <Select
            label="Sort"
            name="sort"
            onChange={(event) => handleSortChange(event.target.value as LeadSort)}
            options={sortOptions}
            value={sort}
          />
          <Button disabled={!hasActiveFilters} onClick={resetFilters} variant="secondary">
            Reset
          </Button>
        </div>
      </Card>

      {formMode ? (
        <Card>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950">
              {formMode === "edit" ? "Edit lead" : "Create lead"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {formMode === "edit" ? "Update lead details." : "Add a new lead to the dashboard."}
            </p>
          </div>
          <LeadForm
            initialLead={selectedLead ?? undefined}
            isSubmitting={isActionLoading}
            onCancel={closeForm}
            onSubmit={handleSubmitLead}
          />
        </Card>
      ) : null}

      {leadToDelete ? (
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Delete lead?</h2>
              <p className="mt-1 text-sm text-slate-600">
                This will permanently delete {leadToDelete.name}.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                disabled={isActionLoading}
                onClick={() => setLeadToDelete(null)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button disabled={isActionLoading} onClick={handleDeleteLead} variant="danger">
                {isActionLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </Card>
      ) : null}

      <Card className="p-0">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center p-6">
            <Loader label="Loading leads" />
          </div>
        ) : null}

        {!isLoading && errorMessage ? (
          <div className="p-6">
            <ErrorMessage message={errorMessage} />
          </div>
        ) : null}

        {!isLoading && !errorMessage && leads.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No leads found" description="Assigned leads will appear here." />
          </div>
        ) : null}

        {!isLoading && !errorMessage && leads.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Created At
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {leads.map((lead) => (
                    <tr className="hover:bg-slate-50" key={lead.id}>
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-900">
                        {lead.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {lead.email}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClassNames[lead.status]}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {lead.source}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                        {formatDate(lead.createdAt)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                        <Link
                          className="font-medium text-blue-600 hover:text-blue-700"
                          to={`/leads/${lead.id}`}
                        >
                          View
                        </Link>
                        <button
                          className="ml-3 font-medium text-slate-700 hover:text-slate-950"
                          onClick={() => openEditForm(lead)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="ml-3 font-medium text-red-600 hover:text-red-700"
                          onClick={() => {
                            setActionErrorMessage(null);
                            setSuccessMessage(null);
                            setLeadToDelete(lead);
                          }}
                          type="button"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                Page {pagination?.currentPage ?? currentPage} of {pagination?.totalPages ?? 1}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  disabled={!canGoPrevious}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  variant="secondary"
                >
                  Previous
                </Button>
                <Button
                  disabled={!canGoNext}
                  onClick={() => setCurrentPage((page) => page + 1)}
                  variant="secondary"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </Card>
    </div>
  );
}

export { DashboardPage };
