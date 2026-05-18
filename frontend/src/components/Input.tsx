import type { InputHTMLAttributes } from "react";

import { classNames } from "../utils/classNames";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

function Input({ className, error, id, label, ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor={inputId}>
      {label ? <span className="mb-1 block">{label}</span> : null}
      <input
        className={classNames(
          "h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100",
          "dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-100 dark:border-red-500 dark:focus:ring-red-950"
            : undefined,
          className,
        )}
        id={inputId}
        {...props}
      />
      {error ? <span className="mt-1 block text-xs text-red-600 dark:text-red-400">{error}</span> : null}
    </label>
  );
}

export { Input };
