import { useState, type FormEvent } from "react";

import { Button, Input, Select } from "../../components";
import type { Lead, LeadPayload, LeadSource, LeadStatus } from "../../types/lead";

interface LeadFormProps {
  initialLead?: Lead;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: LeadPayload) => Promise<void>;
}

interface LeadFormErrors {
  email?: string;
  name?: string;
  source?: string;
  status?: string;
}

const leadStatuses: LeadStatus[] = ["New", "Contacted", "Qualified", "Lost"];
const leadSources: LeadSource[] = ["Website", "Instagram", "Referral"];

const createInitialForm = (lead?: Lead): LeadPayload => ({
  name: lead?.name ?? "",
  email: lead?.email ?? "",
  status: lead?.status ?? "New",
  source: lead?.source ?? "Website",
});

const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const validateLeadForm = (form: LeadPayload): LeadFormErrors => {
  const errors: LeadFormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(form.email)) {
    errors.email = "Enter a valid email";
  }

  if (!leadStatuses.includes(form.status)) {
    errors.status = "Choose a valid status";
  }

  if (!leadSources.includes(form.source)) {
    errors.source = "Choose a valid source";
  }

  return errors;
};

function LeadForm({ initialLead, isSubmitting, onCancel, onSubmit }: LeadFormProps) {
  const [form, setForm] = useState<LeadPayload>(() => createInitialForm(initialLead));
  const [errors, setErrors] = useState<LeadFormErrors>({});

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateLeadForm(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    await onSubmit({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      status: form.status,
      source: form.source,
    });
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        error={errors.name}
        label="Name"
        name="name"
        onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
        placeholder="Lead name"
        value={form.name}
      />
      <Input
        error={errors.email}
        label="Email"
        name="email"
        onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
        placeholder="lead@example.com"
        type="email"
        value={form.email}
      />
      <Select
        error={errors.status}
        label="Status"
        name="status"
        onChange={(event) =>
          setForm((current) => ({ ...current, status: event.target.value as LeadStatus }))
        }
        options={leadStatuses.map((status) => ({ label: status, value: status }))}
        value={form.status}
      />
      <Select
        error={errors.source}
        label="Source"
        name="source"
        onChange={(event) =>
          setForm((current) => ({ ...current, source: event.target.value as LeadSource }))
        }
        options={leadSources.map((source) => ({ label: source, value: source }))}
        value={form.source}
      />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button disabled={isSubmitting} onClick={onCancel} type="button" variant="secondary">
          Cancel
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? "Saving..." : "Save lead"}
        </Button>
      </div>
    </form>
  );
}

export { LeadForm };
