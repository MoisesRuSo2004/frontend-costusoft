"use client";

import { createContext, useCallback, useContext, useState } from "react";

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

  // useCallback garantiza referencias estables entre renders.
  // Sin esto, el useEffect del sidebar (que depende de closeMobile) dispara
  // closeMobile() en cada render, cerrando el sidebar nada más abrirse.
  const toggleCollapsed = useCallback(() => setCollapsed((c) => !c), []);
  const openMobile     = useCallback(() => setMobileOpen(true), []);
  const closeMobile    = useCallback(() => setMobileOpen(false), []);
  const toggleMobile   = useCallback(() => setMobileOpen((c) => !c), []);

  return (
    <SidebarContext.Provider
      value={{ collapsed, mobileOpen, toggleCollapsed, openMobile, closeMobile, toggleMobile }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
