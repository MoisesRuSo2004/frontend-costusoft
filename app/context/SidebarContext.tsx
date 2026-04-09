"use client";

import { createContext, useContext, useState } from "react";

type SidebarContextType = {
  collapsed: boolean;
  mobileOpen: boolean;
  toggleCollapsed: () => void;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
};

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  mobileOpen: false,
  toggleCollapsed: () => {},
  openMobile: () => {},
  closeMobile: () => {},
  toggleMobile: () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        mobileOpen,
        toggleCollapsed: () => setCollapsed((current) => !current),
        openMobile: () => setMobileOpen(true),
        closeMobile: () => setMobileOpen(false),
        toggleMobile: () => setMobileOpen((current) => !current),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
