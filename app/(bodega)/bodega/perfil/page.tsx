import type { Metadata } from "next";
import PerfilView from "@/app/components/shared/perfil/PerfilView";

export const metadata: Metadata = {
  title: "Mi Perfil",
};

export default function BodegaPerfilPage() {
  return (
    <PerfilView
      accentColor="#15803d"
      accentSoft="#f0fdf4"
      gradient="linear-gradient(135deg, #14532d 0%, #166534 100%)"
    />
  );
}
