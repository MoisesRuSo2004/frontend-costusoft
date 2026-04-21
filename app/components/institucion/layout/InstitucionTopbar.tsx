"use client";

import RoleTopbar from "@/app/components/shared/layout/RoleTopbar";

const PAGE_TITLES: Record<string, string> = {
  "/institucion/dashboard": "Mi Panel",
  "/institucion/perfil": "Mi Perfil",
  "/institucion/pedidos": "Mis Pedidos",
  "/institucion/pedidos/nuevo": "Nuevo Pedido",
  "/institucion/solicitudes": "Mis Solicitudes",
  "/institucion/solicitudes/nueva": "Nueva Solicitud",
  "/institucion/ia": "Asistente IA",
};

export default function InstitucionTopbar() {
  return (
    <RoleTopbar
      pageTitles={PAGE_TITLES}
      fallbackTitle="Portal Institucional"
      accentColor="#0891b2"
      accentSoft="#ecf9fc"
      profileHref="/institucion/perfil"
      showLogout
    />
  );
}
