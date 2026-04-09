"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  LayoutDashboard,
} from "lucide-react";
import RoleSidebar, { type SidebarNavGroup } from "@/app/components/shared/layout/RoleSidebar";
import { useNotificaciones } from "@/app/context/NotificacionesContext";

export default function BodegaSidebar() {
  const { total } = useNotificaciones();

  const NAV: SidebarNavGroup[] = [
    {
      heading: "Principal",
      items: [
        {
          label: "Dashboard",
          href: "/bodega",
          icon: LayoutDashboard,
          badge: total > 0 ? total : undefined,
        },
      ],
    },
    {
      heading: "Cola de trabajo",
      items: [
        { label: "Entradas pendientes", href: "/bodega", icon: ArrowDownToLine },
        { label: "Salidas pendientes",  href: "/bodega", icon: ArrowUpFromLine },
      ],
    },
  ];

  return (
    <RoleSidebar
      nav={NAV}
      brandSubtitle="Bodega"
      gradient="linear-gradient(180deg, #14532d 0%, #166534 45%, #052e16 100%)"
      shadow="4px 0 24px rgba(5,46,22,0.22)"
      activeBackground="rgba(255,255,255,0.14)"
      activeText="#ffffff"
      activeIndicator="#86efac"
      hoverBackground="rgba(255,255,255,0.10)"
    />
  );
}
