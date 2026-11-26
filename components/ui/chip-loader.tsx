"use client";

import * as React from "react";

interface ChipLoaderProps {
  /** Full-page overlay mode — centers in viewport over everything */
  fullPage?: boolean;
  /** Panel overlay — sits on top of current content (blur behind) without layout shift */
  overlay?: boolean;
  /** Optional text to show */
  label?: string;
  /** Size preset: "sm" | "md" | "lg" */
  size?: "sm" | "md" | "lg";
}

export function ChipLoader({
  fullPage = false,
  overlay = false,
  label,
  size = "md",
}: ChipLoaderProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  const spinner = (
    <div className="flex items-center gap-2.5">
      <div
        className={`${sizeClasses[size]} rounded-full border-slate-200 border-t-indigo-600 animate-spin shrink-0`}
        role="status"
        aria-label="Loading"
      />
      {label && (
        <span className="text-xs font-medium text-slate-500">{label}</span>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
        {spinner}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-[2px]">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      {spinner}
    </div>
  );
}
