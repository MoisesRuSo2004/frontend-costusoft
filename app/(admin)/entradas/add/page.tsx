import type { Metadata } from "next";
import AgregarEntradaForm from "@/app/components/admin/forms/AgregarEntradaForm";
export const metadata: Metadata = { title: "Nueva Entrada" };
export default function EntradasAddPage() {
  return <AgregarEntradaForm />;
}
