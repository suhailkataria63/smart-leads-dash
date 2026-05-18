import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Loader } from "../components";
import { useAuth } from "../features/auth/useAuth";

function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  if (isInitializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader label="Checking session" />
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}

export { ProtectedRoute };

