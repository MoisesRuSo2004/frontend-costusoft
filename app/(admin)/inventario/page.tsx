import type { Metadata } from "next";
import InventarioClient from "@/app/components/admin/inventario/InventarioClient";

export const metadata: Metadata = {
  title: "Inventario",
};

export default function InventarioPage() {
  return <InventarioClient />;
}
