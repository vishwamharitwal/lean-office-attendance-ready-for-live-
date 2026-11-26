"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const neuButtonVariants = cva(
  "inline-flex items-center justify-center transition-all cursor-pointer outline-none font-medium shrink-0 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm border border-indigo-600 rounded-lg",
        accent: "text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm border border-indigo-600 rounded-lg",
        ghost: "text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm rounded-lg",
        danger: "text-white bg-rose-600 hover:bg-rose-700 shadow-sm border border-rose-600 rounded-lg",
        outline: "text-slate-700 border border-slate-200 bg-white hover:bg-slate-50 shadow-sm rounded-lg",
      },
      size: {
        md: "px-4 py-2.5 text-sm",
        sm: "px-3 py-1.5 text-xs",
        lg: "px-6 py-3 text-base",
        icon: "w-9 h-9 p-0",
        full: "w-full py-2.5 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface NeuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neuButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const NeuButton = React.forwardRef<HTMLButtonElement, NeuButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={ref}
        className={cn(neuButtonVariants({ variant, size, className }), (loading || disabled) && "opacity-60 pointer-events-none")}
        disabled={disabled || loading}
        {...props}
      >
        <span className="flex items-center justify-center gap-2">
          {loading && (
            <svg
              className="animate-spin h-3.5 w-3.5 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          )}
          {children}
        </span>
      </Comp>
    );
  }
);

NeuButton.displayName = "NeuButton";

export { NeuButton };
