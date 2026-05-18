import type { UserRole } from "./types";

interface RoleBadgeProps {
  role: UserRole;
}

const roleClassNames: Record<UserRole, string> = {
  admin: "bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:ring-purple-800",
  sales: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:ring-sky-800",
};

const roleLabels: Record<UserRole, string> = {
  admin: "Admin",
  sales: "Sales",
};

function RoleBadge({ role }: RoleBadgeProps) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${roleClassNames[role]}`}
    >
      {roleLabels[role]}
    </span>
  );
}

export { RoleBadge };
