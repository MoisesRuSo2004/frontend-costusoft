import type { Metadata } from "next";
import PerfilView from "@/app/components/shared/perfil/PerfilView";

export const metadata: Metadata = {
  title: "Mi Perfil",
};

export default function UserPerfilPage() {
  return (
    <PerfilView
      accentColor="#1d4ed8"
      accentSoft="#eff6ff"
      gradient="linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)"
    />
  );
}
