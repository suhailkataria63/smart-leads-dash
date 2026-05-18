import type { ButtonHTMLAttributes, ReactNode } from "react";

import { classNames } from "../utils/classNames";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

const variantClasses: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500",
  secondary:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 focus-visible:ring-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800",
  danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
};

function Button({
  children,
  className,
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={classNames(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-slate-950",
        variantClasses[variant],
        className,
      )}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export { Button };
