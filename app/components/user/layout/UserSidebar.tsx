"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Building2,
  Calculator,
  LayoutDashboard,
} from "lucide-react";
import RoleSidebar, { type SidebarNavGroup } from "@/app/components/shared/layout/RoleSidebar";
import { useNotificaciones } from "@/app/context/NotificacionesContext";

export default function UserSidebar() {
  const { total } = useNotificaciones();

  const NAV: SidebarNavGroup[] = [
    {
      heading: "Principal",
      items: [
        {
          label: "Dashboard",
          href: "/user",
          icon: LayoutDashboard,
          badge: total > 0 ? total : undefined,
        },
      ],
    },
    {
      heading: "Operaciones",
      items: [
        { label: "Calculadora",    href: "/user/calculadora",  icon: Calculator },
        { label: "Nueva Entrada",  href: "/user/entradas/add", icon: ArrowDownToLine },
        { label: "Nueva Salida",   href: "/user/salidas/add",  icon: ArrowUpFromLine },
      ],
    },
    {
      heading: "Consultas",
      items: [
        { label: "Colegios", href: "/user/colegios", icon: Building2 },
      ],
    },
  ];

  return (
    <RoleSidebar
      nav={NAV}
      brandSubtitle="Secretaria"
      gradient="linear-gradient(180deg, #0f172a 0%, #172554 55%, #1d4ed8 100%)"
      shadow="4px 0 24px rgba(15,23,42,0.18)"
      activeBackground="rgba(255,255,255,0.14)"
      activeText="#ffffff"
      activeIndicator="#60a5fa"
      hoverBackground="rgba(255,255,255,0.08)"
    />
  );
}
