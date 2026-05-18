interface EmptyStateProps {
  title: string;
  description?: string;
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
      {description ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p> : null}
    </div>
  );
}

export { EmptyState };
