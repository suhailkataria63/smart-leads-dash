import { useParams } from "react-router-dom";

import { Card, EmptyState } from "../components";

function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">Lead Details</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Lead ID: {id}</p>
      </div>
      <Card>
        <EmptyState title="Lead detail placeholder" description="Lead information will be added later." />
      </Card>
    </div>
  );
}

export { LeadDetailPage };
