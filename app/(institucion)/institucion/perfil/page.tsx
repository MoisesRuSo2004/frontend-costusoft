import type { Metadata } from "next";
import PerfilView from "@/app/components/shared/perfil/PerfilView";

export const metadata: Metadata = {
  title: "Mi Perfil",
};

export default function InstitucionPerfilPage() {
  return (
    <PerfilView
      accentColor="#0891b2"
      accentSoft="#ecf9fc"
      gradient="linear-gradient(135deg, #065f73 0%, #0891b2 100%)"
    />
  );
}
