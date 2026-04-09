"use client";

import RoleTopbar from "@/app/components/shared/layout/RoleTopbar";

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Panel Admin",
  "/admin/calculadora": "Calculadora",
  "/admin/colegios": "Colegios",
  "/dashboard": "Dashboard",
  "/inventario": "Inventario",
  "/entradas": "Entradas",
  "/salidas": "Salidas",
  "/reporte": "Reportes",
  "/usuarios": "Usuarios",
  "/proveedores": "Proveedores",
  "/prediccion": "Prediccion de Insumos",
  "/perfil": "Mi Perfil",
  "/agregar": "Agregar Insumo",
  "/entradas-add": "Nueva Entrada",
  "/salidas-add": "Nueva Salida",
};

export default function Topbar() {
  return (
    <RoleTopbar
      pageTitles={PAGE_TITLES}
      fallbackTitle="Panel Administrativo"
      accentColor="#0b3d91"
      accentSoft="#f0f5ff"
      userName="Admin"
      userRoleLabel="Administrador"
      userEmail="admin@costusoft.com"
      profileHref="/perfil"
      showLogout
    />
  );
}
