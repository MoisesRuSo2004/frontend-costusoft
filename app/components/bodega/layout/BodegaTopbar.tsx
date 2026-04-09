"use client";

import RoleTopbar from "@/app/components/shared/layout/RoleTopbar";

const PAGE_TITLES: Record<string, string> = {
  "/bodega": "Panel Bodega",
};

export default function BodegaTopbar() {
  return (
    <RoleTopbar
      pageTitles={PAGE_TITLES}
      fallbackTitle="Panel Bodega"
      accentColor="#15803d"
      accentSoft="#f0fdf4"
      userName="Operador Bodega"
      userRoleLabel="Rol BODEGA"
      userEmail="jorge.bodega@costusoft.com"
      showLogout
    />
  );
}
