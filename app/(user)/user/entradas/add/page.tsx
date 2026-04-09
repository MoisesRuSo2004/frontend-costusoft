import type { Metadata } from "next";
import AgregarEntradaForm from "@/app/components/admin/forms/AgregarEntradaForm";

export const metadata: Metadata = {
  title: "Nueva Entrada — Secretaria",
};

export default function UserAgregarEntradaPage() {
  return <AgregarEntradaForm returnPath="/user" />;
}
