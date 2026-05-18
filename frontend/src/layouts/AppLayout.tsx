import { Outlet, useNavigate } from "react-router-dom";

import { Button } from "../components";
import { RoleBadge } from "../features/auth/RoleBadge";
import { useAuth } from "../features/auth/useAuth";

function AppLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Smart Leads Dashboard</p>
            {user ? (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-sm text-slate-700">{user.name}</span>
                <RoleBadge role={user.role} />
              </div>
            ) : null}
          </div>
          <Button onClick={handleLogout} variant="secondary">
            Logout
          </Button>
        </header>
        <Outlet />
      </div>
    </main>
  );
}

export { AppLayout };
