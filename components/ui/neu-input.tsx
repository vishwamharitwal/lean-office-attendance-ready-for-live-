"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface NeuInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--neu-text-secondary)] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--neu-text-muted)] pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full px-4 py-2.5 rounded-lg",
              "bg-white text-slate-800",
              "border border-slate-200",
              "shadow-sm",
              "placeholder:text-slate-400",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-400 focus:border-red-500 focus:ring-red-100",
              icon && "pl-10",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[var(--neu-danger)]">
            {error}
          </p>
        )}
      </div>
    );
  }
);

NeuInput.displayName = "NeuInput";

export { NeuInput, type NeuInputProps };
