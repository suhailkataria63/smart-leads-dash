import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { Button, Card, Input } from "../components";
import { ErrorMessage } from "../components/ErrorMessage";
import { getAuthErrorMessage } from "../features/auth/authErrors";
import { useAuth } from "../features/auth/useAuth";

interface LoginFormState {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

interface LocationState {
  from?: {
    pathname?: string;
  };
}

const initialFormState: LoginFormState = {
  email: "",
  password: "",
};

const validateLoginForm = (form: LoginFormState): LoginFormErrors => {
  const errors: LoginFormErrors = {};

  if (!form.email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Enter a valid email";
  }

  if (!form.password) {
    errors.password = "Password is required";
  }

  return errors;
};

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginFormState>(initialFormState);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname ?? "/dashboard";

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationErrors = validateLoginForm(form);
    setErrors(validationErrors);
    setServerError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      navigate(redirectTo, { replace: true });
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
          <h1 className="text-2xl font-semibold text-slate-950">Login</h1>
          <p className="mt-1 text-sm text-slate-600">Sign in to manage your leads.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {serverError ? <ErrorMessage message={serverError} /> : null}
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
            autoComplete="current-password"
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
          <Button className="w-full" disabled={isLoading} type="submit">
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link className="font-medium text-blue-600 hover:text-blue-700" to="/register">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}

export { LoginPage };
