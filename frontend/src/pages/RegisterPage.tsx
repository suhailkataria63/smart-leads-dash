import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { Button, Card, Input, Select } from "../components";
import { ErrorMessage } from "../components/ErrorMessage";
import { getAuthErrorMessage } from "../features/auth/authErrors";
import type { UserRole } from "../features/auth/types";
import { useAuth } from "../features/auth/useAuth";

interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface RegisterFormErrors {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

const initialFormState: RegisterFormState = {
  name: "",
  email: "",
  password: "",
  role: "sales",
};

const isUserRole = (value: string): value is UserRole => {
  return value === "admin" || value === "sales";
};

const validateRegisterForm = (form: RegisterFormState): RegisterFormErrors => {
  const errors: RegisterFormErrors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email";
  }

  if (!form.password) {
    errors.password = "Password is required";
  } else if (form.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }

  if (!isUserRole(form.role)) {
    errors.role = "Choose a valid role";
  }

  return errors;
};

function RegisterPage() {
  const { isAuthenticated, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterFormState>(initialFormState);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);
    setServerError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: form.role,
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center">
      <Card className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950">Register</h1>
          <p className="mt-1 text-sm text-slate-600">Create an account to start managing leads.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {serverError ? <ErrorMessage message={serverError} /> : null}
          <Input
            autoComplete="name"
            error={errors.name}
            label="Name"
            name="name"
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Your name"
            value={form.name}
          />
          <Input
            autoComplete="email"
            error={errors.email}
            label="Email"
            name="email"
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="you@example.com"
            type="email"
            value={form.email}
          />
          <Input
            autoComplete="new-password"
            error={errors.password}
            label="Password"
            name="password"
            onChange={(event) =>
              setForm((current) => ({ ...current, password: event.target.value }))
            }
            placeholder="Password"
            type="password"
            value={form.password}
          />
          <Select
            error={errors.role}
            label="Role"
            name="role"
            onChange={(event) => {
              const nextRole = event.target.value;

              if (isUserRole(nextRole)) {
                setForm((current) => ({ ...current, role: nextRole }));
              }
            }}
            options={[
              { label: "Sales", value: "sales" },
              { label: "Admin", value: "admin" },
            ]}
            value={form.role}
          />
          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? "Creating account..." : "Register"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-medium text-blue-600 hover:text-blue-700" to="/login">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
}

export { RegisterPage };
