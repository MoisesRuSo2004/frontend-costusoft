import type { Metadata } from "next";
import AgregarSalidaForm from "@/app/components/admin/forms/AgregarSalidaForm";

export const metadata: Metadata = {
  title: "Nueva Salida — Secretaria",
};

export default function UserAgregarSalidaPage() {
  return <AgregarSalidaForm returnPath="/user" />;
}
