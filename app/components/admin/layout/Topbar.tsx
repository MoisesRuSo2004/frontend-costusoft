"use client";

import RoleTopbar from "@/app/components/shared/layout/RoleTopbar";
import { useNotificaciones } from "@/app/context/NotificacionesContext";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Panel Admin",
  "/admin/calculadora": "Calculadora",
  "/admin/colegios": "Colegios",
  "/admin/pedidos": "Pedidos",
  "/admin/uniformes": "Uniformes",
  "/dashboard": "Dashboard",
  "/inventario": "Inventario",
  "/entradas": "Entradas",
  "/salidas": "Salidas",
  "/reporte": "Reportes",
  "/usuarios": "Usuarios",
  "/proveedores": "Proveedores",
  "/prediccion": "Prediccion de Insumos",
  "/perfil": "Mi Perfil",
  "/solicitudes": "Solicitudes",
  "/admin/ia":    "Asistente IA",
};

export default function Topbar() {
  const { items, total, loading, refetch } = useNotificaciones();

  return (
    <RoleTopbar
      pageTitles={PAGE_TITLES}
      fallbackTitle="Panel Administrativo"
      accentColor="#0b3d91"
      accentSoft="#f0f5ff"
      profileHref="/perfil"
      showLogout
      notifItems={items}
      notifTotal={total}
      notifLoading={loading}
      onNotifRefetch={refetch}
    />
  );
}
