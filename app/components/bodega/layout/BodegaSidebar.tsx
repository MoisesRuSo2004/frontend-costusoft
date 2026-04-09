"use client";

import { ClipboardCheck, Clock3, PackageOpen } from "lucide-react";
import RoleSidebar, { type SidebarNavGroup } from "@/app/components/shared/layout/RoleSidebar";

const NAV: SidebarNavGroup[] = [
  {
    heading: null,
    items: [{ label: "Panel Bodega", href: "/bodega", icon: ClipboardCheck }],
  },
  {
    heading: "Operacion",
    items: [
      { label: "Pendientes", href: "/bodega", icon: Clock3 },
      { label: "Validacion fisica", href: "/bodega", icon: PackageOpen },
    ],
  },
];

export default function BodegaSidebar() {
  return (
    <RoleSidebar
      nav={NAV}
      brandSubtitle="Panel Bodega"
      gradient="linear-gradient(180deg, #14532d 0%, #166534 45%, #052e16 100%)"
      shadow="4px 0 24px rgba(5, 46, 22, 0.22)"
      activeBackground="rgba(255,255,255,0.14)"
      activeText="#ffffff"
      activeIndicator="#ffffff"
      hoverBackground="rgba(255,255,255,0.10)"
    />
  );
}
