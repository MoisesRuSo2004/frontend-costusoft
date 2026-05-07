"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BrainCircuit,
  Building2,
  Calculator,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Package,
  Shirt,
} from "lucide-react";
import RoleSidebar, { type SidebarNavGroup } from "@/app/components/shared/layout/RoleSidebar";
import { useNotificaciones } from "@/app/context/NotificacionesContext";

export default function UserSidebar() {
  const { total, solicitudesCount } = useNotificaciones();

  const NAV: SidebarNavGroup[] = [
    // 1 — siempre visible, muestra resumen global
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
    // 2 — lo más urgente: solicitudes de colegios con badge de pendientes
    {
      heading: "Instituciones",
      items: [
        {
          label: "Solicitudes",
          href:  "/user/solicitudes-institucionales",
          icon:  MessageSquare,
          badge: solicitudesCount > 0 ? solicitudesCount : undefined,
        },
      ],
    },
    // 3 — catálogo que la secretaria mantiene activo
    {
      heading: "Gestión",
      items: [
        { label: "Uniformes", href: "/user/uniformes", icon: Shirt     },
        { label: "Colegios",  href: "/user/colegios",  icon: Building2 },
      ],
    },
    // 4 — movimientos diarios de inventario y pedidos
    {
      heading: "Operaciones",
      items: [
        { label: "Pedidos",       href: "/user/pedidos",      icon: ClipboardList  },
        { label: "Nueva Entrada", href: "/user/entradas/add", icon: ArrowDownToLine },
        { label: "Nueva Salida",  href: "/user/salidas/add",  icon: ArrowUpFromLine },
        { label: "Calculadora",   href: "/user/calculadora",  icon: Calculator      },
      ],
    },
    // 5 — consulta de stock (solo lectura)
    {
      heading: "Consultas",
      items: [
        { label: "Inventario", href: "/user/inventario", icon: Package },
      ],
    },
    // 6 — herramienta de apoyo, no esencial
    {
      heading: "Inteligencia",
      items: [
        { label: "Asistente IA", href: "/user/ia", icon: BrainCircuit },
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
