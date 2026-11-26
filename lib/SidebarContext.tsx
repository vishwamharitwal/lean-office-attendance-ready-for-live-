"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isAdminCollapsed: boolean;
  setIsAdminCollapsed: (collapsed: boolean) => void;
  isEmployeeCollapsed: boolean;
  setIsEmployeeCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isAdminCollapsed, setIsAdminCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("adminSidebarCollapsed") === "true";
    }
    return false;
  });
  const [isEmployeeCollapsed, setIsEmployeeCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("employeeSidebarCollapsed") === "true";
    }
    return false;
  });

  const setAdmin = (val: boolean) => {
    setIsAdminCollapsed(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("adminSidebarCollapsed", String(val));
    }
  };

  const setEmployee = (val: boolean) => {
    setIsEmployeeCollapsed(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("employeeSidebarCollapsed", String(val));
    }
  };

  return (
    <SidebarContext.Provider
      value={{
        isAdminCollapsed,
        setIsAdminCollapsed: setAdmin,
        isEmployeeCollapsed,
        setIsEmployeeCollapsed: setEmployee,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
