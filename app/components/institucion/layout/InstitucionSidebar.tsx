"use client";

import {
  BrainCircuit,
  ClipboardList,
  LayoutDashboard,
  MessageSquarePlus,
  School,
} from "lucide-react";
import RoleSidebar, { type SidebarNavGroup } from "@/app/components/shared/layout/RoleSidebar";

export default function InstitucionSidebar() {
  const NAV: SidebarNavGroup[] = [
    {
      heading: "Principal",
      items: [
        { label: "Dashboard", href: "/institucion/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      heading: "Pedidos",
      items: [
        { label: "Mis Pedidos", href: "/institucion/pedidos", icon: ClipboardList },
      ],
    },
    {
      heading: "Soporte",
      items: [
        { label: "Solicitudes", href: "/institucion/solicitudes", icon: MessageSquarePlus },
      ],
    },
    {
      heading: "Asistente",
      items: [
        { label: "Asistente IA", href: "/institucion/ia", icon: BrainCircuit },
      ],
    },
  ];

  return (
    <RoleSidebar
      nav={NAV}
      brandSubtitle="Portal Institucional"
      gradient="linear-gradient(180deg, #065f73 0%, #0e7490 60%, #06485e 100%)"
      shadow="4px 0 24px rgba(0,0,0,0.22)"
      activeBackground="rgba(8,145,178,0.18)"
      activeText="#22d3ee"
      activeIndicator="#0891b2"
      hoverBackground="rgba(255,255,255,0.07)"
      logoGlow="drop-shadow(0 2px 6px rgba(8,145,178,0.5))"
    />
  );
}
