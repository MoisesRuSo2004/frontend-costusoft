"use client";

import RoleTopbar from "@/app/components/shared/layout/RoleTopbar";
import { useNotificaciones } from "@/app/context/NotificacionesContext";

const PAGE_TITLES: Record<string, string> = {
  "/user":              "Dashboard",
  "/user/calculadora":  "Calculadora",
  "/user/colegios":     "Colegios",
  "/user/entradas/add": "Nueva Entrada",
  "/user/salidas/add":  "Nueva Salida",
  "/user/perfil":       "Mi Perfil",
  "/user/ia":           "Asistente IA",
};

export default function UserTopbar() {
  const { items, total, loading, refetch } = useNotificaciones();

  return (
    <RoleTopbar
      pageTitles={PAGE_TITLES}
      fallbackTitle="Panel Secretaria"
      accentColor="#1d4ed8"
      accentSoft="#eff6ff"
      profileHref="/user/perfil"
      showLogout
      notifItems={items}
      notifTotal={total}
      notifLoading={loading}
      onNotifRefetch={refetch}
      notifHref="/user"
    />
  );
}
