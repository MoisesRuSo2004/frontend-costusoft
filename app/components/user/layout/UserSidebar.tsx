"use client";

import { Building2, Calculator, ClipboardList, LayoutDashboard } from "lucide-react";
import RoleSidebar, { type SidebarNavGroup } from "@/app/components/shared/layout/RoleSidebar";

const NAV: SidebarNavGroup[] = [
  {
    heading: "Operaciones",
    items: [
      { label: "Calculadora", href: "/user/calculadora", icon: Calculator },
      { label: "Solicitudes", href: "/user", icon: ClipboardList },
    ],
  },
  {
    heading: "Gestion",
    items: [{ label: "Colegios", href: "/user/colegios", icon: Building2 }],
  },
  {
    heading: "Analitica",
    items: [{ label: "Dashboard", href: "/user", icon: LayoutDashboard }],
  },
];

export default function UserSidebar() {
  return (
    <RoleSidebar
      nav={NAV}
      brandSubtitle="Panel Secretaria"
      gradient="linear-gradient(180deg, #0f172a 0%, #172554 55%, #1d4ed8 100%)"
      shadow="4px 0 24px rgba(15, 23, 42, 0.18)"
      activeBackground="rgba(255,255,255,0.14)"
      activeText="#ffffff"
      activeIndicator="#ffffff"
      hoverBackground="rgba(255,255,255,0.10)"
    />
  );
}
