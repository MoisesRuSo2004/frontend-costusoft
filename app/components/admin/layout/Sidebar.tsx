"use client";

import {
  Archive,
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart2,
  BrainCircuit,
  Building2,
  Calculator,
  ClipboardCheck,
  ClipboardList,
  LayoutDashboard,
  MessageSquare,
  Shirt,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import RoleSidebar, { type SidebarNavGroup } from "@/app/components/shared/layout/RoleSidebar";
import { useNotificaciones } from "@/app/context/NotificacionesContext";

export default function Sidebar() {
  const { pedidosCount, solicitudesCount } = useNotificaciones();

  const NAV: SidebarNavGroup[] = [
    {
      heading: "Principal",
      items: [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Solicitudes", href: "/solicitudes", icon: ClipboardCheck },
        { label: "Inst. Solicitudes", href: "/admin/solicitudes-institucionales", icon: MessageSquare, badge: solicitudesCount > 0 ? solicitudesCount : undefined },
      ],
    },
    {
      heading: "Operaciones",
      items: [
        { label: "Calculadora", href: "/admin/calculadora", icon: Calculator },
        { label: "Pedidos", href: "/admin/pedidos", icon: ClipboardList, badge: pedidosCount > 0 ? pedidosCount : undefined },
      ],
    },
    {
      heading: "Inventario",
      items: [
        { label: "Insumos", href: "/inventario", icon: Archive },
        { label: "Entradas", href: "/entradas", icon: ArrowDownToLine },
        { label: "Salidas", href: "/salidas", icon: ArrowUpFromLine },
      ],
    },
    {
      heading: "Analitica",
      items: [
        { label: "Reportes",    href: "/reporte",    icon: BarChart2 },
        { label: "Prediccion",  href: "/prediccion", icon: TrendingUp },
        { label: "Asistente IA", href: "/admin/ia",  icon: BrainCircuit },
      ],
    },
    {
      heading: "Gestion",
      items: [
        { label: "Colegios", href: "/admin/colegios", icon: Building2 },
        { label: "Uniformes", href: "/admin/uniformes", icon: Shirt },
        { label: "Usuarios", href: "/usuarios", icon: Users },
        { label: "Proveedores", href: "/proveedores", icon: Truck },
      ],
    },
  ];

  return (
    <RoleSidebar
      nav={NAV}
      brandSubtitle="Control"
      gradient="linear-gradient(180deg, #0b3d91 0%, #072d6e 60%, #041d47 100%)"
      shadow="4px 0 24px rgba(0,0,0,0.18)"
      activeBackground="rgba(73,194,27,0.18)"
      activeText="#49c21b"
      activeIndicator="#49c21b"
      hoverBackground="rgba(255,255,255,0.07)"
      logoGlow="drop-shadow(0 2px 6px rgba(73,194,27,0.4))"
    />
  );
}
