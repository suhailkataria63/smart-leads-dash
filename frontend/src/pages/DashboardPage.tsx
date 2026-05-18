import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiClient } from "../api/client";
import { Button, Card, EmptyState, ErrorMessage, Loader } from "../components";
import type { ApiResponse } from "../types/api";
import type { Lead, LeadsListData } from "../types/lead";

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

function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<LeadsListData["pagination"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLeads = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await apiClient.get<ApiResponse<LeadsListData>>("/leads", {
          params: { page: currentPage },
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
  }, [currentPage]);

  const canGoPrevious = pagination?.hasPrevPage ?? false;
  const canGoNext = pagination?.hasNextPage ?? false;

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
      </div>

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
                        <Link className="font-medium text-blue-600 hover:text-blue-700" to={`/leads/${lead.id}`}>
                          View
                        </Link>
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
