import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { apiClient } from "../api/client";
import { Button, Card, EmptyState, ErrorMessage, Loader } from "../components";
import { LeadForm } from "../features/leads/LeadForm";
import { getLeadErrorMessage } from "../features/leads/leadMessages";
import type { ApiResponse } from "../types/api";
import type { Lead, LeadCreator, LeadMutationData, LeadPayload } from "../types/lead";

const statusClassNames: Record<Lead["status"], string> = {
  New: "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-800",
  Contacted:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-800",
  Qualified:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-800",
  Lost: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-800",
};

const formatDate = (value: string): string => {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

const isLeadCreator = (createdBy: Lead["createdBy"]): createdBy is LeadCreator => {
  return typeof createdBy === "object" && createdBy !== null;
};

function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchLead = async () => {
      if (!id) {
        setErrorMessage("Invalid lead id");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await apiClient.get<ApiResponse<LeadMutationData>>(`/leads/${id}`);

        if (!isMounted) {
          return;
        }

        setLead(response.data.data.lead);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setLead(null);
        setErrorMessage(getLeadErrorMessage(error));
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchLead();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleUpdateLead = async (payload: LeadPayload) => {
    if (!lead) {
      return;
    }

    setIsActionLoading(true);
    setActionMessage(null);
    setSuccessMessage(null);

    try {
      const response = await apiClient.put<ApiResponse<LeadMutationData>>(
        `/leads/${lead.id}`,
        payload,
      );

      setLead(response.data.data.lead);
      setIsEditing(false);
      setSuccessMessage("Lead updated successfully");
    } catch (error) {
      setActionMessage(getLeadErrorMessage(error));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!lead) {
      return;
    }

    setIsActionLoading(true);
    setActionMessage(null);
    setSuccessMessage(null);

    try {
      await apiClient.delete(`/leads/${lead.id}`);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setActionMessage(getLeadErrorMessage(error));
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            to="/dashboard"
          >
            Back to Dashboard
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-slate-100">
            Lead Details
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            View and manage lead information.
          </p>
        </div>
        {lead ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => setIsEditing(true)} variant="secondary">
              Edit
            </Button>
            <Button onClick={() => setShowDeleteConfirm(true)} variant="danger">
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      {successMessage ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          {successMessage}
        </div>
      ) : null}

      {actionMessage ? <ErrorMessage message={actionMessage} /> : null}

      {isLoading ? (
        <Card>
          <div className="flex min-h-48 items-center justify-center">
            <Loader label="Loading lead" />
          </div>
        </Card>
      ) : null}

      {!isLoading && errorMessage ? <ErrorMessage message={errorMessage} /> : null}

      {!isLoading && !errorMessage && !lead ? (
        <Card>
          <EmptyState title="Lead unavailable" description="This lead could not be found." />
        </Card>
      ) : null}

      {isEditing && lead ? (
        <Card>
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">Edit lead</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Update this lead&apos;s details.
            </p>
          </div>
          <LeadForm
            initialLead={lead}
            isSubmitting={isActionLoading}
            onCancel={() => setIsEditing(false)}
            onSubmit={handleUpdateLead}
          />
        </Card>
      ) : null}

      {showDeleteConfirm && lead ? (
        <Card>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
                Delete lead?
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                This will permanently delete {lead.name}.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                disabled={isActionLoading}
                onClick={() => setShowDeleteConfirm(false)}
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

      {!isLoading && lead ? (
        <Card>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Name</dt>
              <dd className="mt-1 text-base font-semibold text-slate-950 dark:text-slate-100">
                {lead.name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Email</dt>
              <dd className="mt-1 text-base text-slate-800 dark:text-slate-200">{lead.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Status</dt>
              <dd className="mt-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClassNames[lead.status]}`}
                >
                  {lead.status}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Source</dt>
              <dd className="mt-1 text-base text-slate-800 dark:text-slate-200">{lead.source}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Created At
              </dt>
              <dd className="mt-1 text-base text-slate-800 dark:text-slate-200">
                {formatDate(lead.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Created By
              </dt>
              {isLeadCreator(lead.createdBy) ? (
                <dd className="mt-1 text-base text-slate-800 dark:text-slate-200">
                  <span className="block font-medium text-slate-950 dark:text-slate-100">
                    {lead.createdBy.name}
                  </span>
                  <span className="block text-sm text-slate-600 dark:text-slate-400">
                    {lead.createdBy.email}
                  </span>
                  <span className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                    {lead.createdBy.role}
                  </span>
                </dd>
              ) : (
                <dd className="mt-1 break-all text-base text-slate-800 dark:text-slate-200">
                  {lead.createdBy || "Unavailable"}
                </dd>
              )}
            </div>
          </dl>
        </Card>
      ) : null}
    </div>
  );
}

export { LeadDetailPage };
