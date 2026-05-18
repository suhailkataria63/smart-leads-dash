import type { SelectHTMLAttributes } from "react";

import { classNames } from "../utils/classNames";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  error?: string;
  label?: string;
  options: SelectOption[];
}

function Select({ className, error, id, label, options, ...props }: SelectProps) {
  const selectId = id ?? props.name;

  return (
    <label className="block text-sm font-medium text-slate-700" htmlFor={selectId}>
      {label ? <span className="mb-1 block">{label}</span> : null}
      <select
        className={classNames(
          "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100",
          error ? "border-red-500 focus:border-red-500 focus:ring-red-100" : undefined,
          className,
        )}
        id={selectId}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export { Select };
export type { SelectOption };

