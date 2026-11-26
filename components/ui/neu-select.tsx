"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SelectOption {
  value: string;
  label: string;
}

interface NeuSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const NeuSelect = React.forwardRef<HTMLSelectElement, NeuSelectProps>(
  ({ className, label, error, options, placeholder, id, ...props }, ref) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[var(--neu-text-secondary)] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "w-full px-4 py-2.5 rounded-lg",
              "appearance-none cursor-pointer",
              "bg-white text-slate-800",
              "border border-slate-200",
              "shadow-sm",
              "transition-all duration-200 ease-out",
              "focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              error && "border-red-400 focus:border-red-500 focus:ring-red-100",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom chevron icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--neu-text-muted)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
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

NeuSelect.displayName = "NeuSelect";

export { NeuSelect, type NeuSelectProps, type SelectOption };
