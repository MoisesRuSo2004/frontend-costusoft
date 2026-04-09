import type { Metadata } from "next";
import UsuariosClient from "@/app/components/admin/usuarios/UsuariosClient";

export const metadata: Metadata = {
  title: "Usuarios",
};

export default function UsuariosPage() {
  return <UsuariosClient />;
}
