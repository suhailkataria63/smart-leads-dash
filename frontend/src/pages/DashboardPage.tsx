import { Card, EmptyState } from "../components";

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Smart Leads overview will appear here.</p>
      </div>
      <Card>
        <EmptyState title="No dashboard data yet" description="Lead metrics will be added later." />
      </Card>
    </div>
  );
}

export { DashboardPage };

