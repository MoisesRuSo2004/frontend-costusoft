"use client";

import RoleTopbar from "@/app/components/shared/layout/RoleTopbar";

const PAGE_TITLES: Record<string, string> = {
  "/user": "Panel User",
  "/user/calculadora": "Calculadora",
  "/user/colegios": "Colegios",
};

export default function UserTopbar() {
  return (
    <RoleTopbar
      pageTitles={PAGE_TITLES}
      fallbackTitle="Panel User"
      accentColor="#1d4ed8"
      accentSoft="#eff6ff"
      userName="Secretaria"
      userRoleLabel="Rol USER"
      userEmail="daniela@costusoft.com"
      showLogout
    />
  );
}
