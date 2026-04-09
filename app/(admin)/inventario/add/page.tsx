import type { Metadata } from "next";
import AgregarInsumoForm from "@/app/components/admin/forms/AgregarInsumoForm";
export const metadata: Metadata = { title: "Agregar Insumo" };
export default function AgregarPage() {
  return <AgregarInsumoForm />;
}
