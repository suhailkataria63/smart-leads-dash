import type { HTMLAttributes, ReactNode } from "react";

import { classNames } from "../utils/classNames";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={classNames("rounded-lg border border-slate-200 bg-white p-6 shadow-sm", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export { Card };

