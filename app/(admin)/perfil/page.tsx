import type { Metadata } from "next";
import PerfilClient from "@/app/components/admin/perfil/PerfilClient";

export const metadata: Metadata = {
  title: "Mi Perfil",
};

export default function PerfilPage() {
  return <PerfilClient />;
}
