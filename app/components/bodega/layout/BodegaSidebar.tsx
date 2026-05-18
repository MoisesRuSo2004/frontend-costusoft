"use client";

import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BrainCircuit,
  LayoutDashboard,
  Package,
  ClipboardList,
} from "lucide-react";
import RoleSidebar, { type SidebarNavGroup } from "@/app/components/shared/layout/RoleSidebar";
import { useNotificaciones } from "@/app/context/NotificacionesContext";

export default function BodegaSidebar() {
  const { total, pedidosConfirmadosCount } = useNotificaciones();

  const NAV: SidebarNavGroup[] = [
    // 1 — vista general y cola de trabajo activa
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
    // 2 — pedidos asignados a bodega
    {
      heading: "Producción",
      items: [
        {
          label: "Pedidos",
          href: "/bodega/pedidos",
          icon: ClipboardList,
          badge: pedidosConfirmadosCount > 0 ? pedidosConfirmadosCount : undefined,
        },
      ],
    },
    // 3 — accesos rápidos a filtros de la cola
    {
      heading: "Cola de trabajo",
      items: [
        { label: "Entradas pendientes", href: "/bodega", icon: ArrowDownToLine },
        { label: "Salidas pendientes",  href: "/bodega", icon: ArrowUpFromLine },
      ],
    },
    // 3 — consulta de stock para validar disponibilidad física
    {
      heading: "Consultas",
      items: [
        { label: "Inventario", href: "/bodega/inventario", icon: Package },
      ],
    },
    // 4 — apoyo, no esencial
    {
      heading: "Inteligencia",
      items: [
        { label: "Asistente IA", href: "/bodega/ia", icon: BrainCircuit },
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
