"use client";

import RoleTopbar from "@/app/components/shared/layout/RoleTopbar";
import { useNotificaciones } from "@/app/context/NotificacionesContext";

const PAGE_TITLES: Record<string, string> = {
  "/bodega":          "Dashboard",
  "/bodega/pedidos":  "Pedidos de Producción",
  "/bodega/cola":     "Cola de Trabajo",
  "/bodega/perfil":   "Mi Perfil",
  "/bodega/ia":       "Asistente IA",
};

export default function BodegaTopbar() {
  const { items, total, loading, refetch } = useNotificaciones();

  return (
    <RoleTopbar
      pageTitles={PAGE_TITLES}
      fallbackTitle="Panel Bodega"
      accentColor="#15803d"
      accentSoft="#f0fdf4"
      profileHref="/bodega/perfil"
      showLogout
      notifItems={items}
      notifTotal={total}
      notifLoading={loading}
      onNotifRefetch={refetch}
      notifHref="/bodega"
    />
  );
}
