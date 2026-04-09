import type { Metadata } from "next";
import ProveedoresClient from "@/app/components/admin/proveedores/ProveedoresClient";

export const metadata: Metadata = {
  title: "Proveedores",
};

export default function ProveedoresPage() {
  return <ProveedoresClient />;
}
