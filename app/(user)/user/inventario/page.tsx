import type { Metadata } from "next";
import InventarioUserClient from "@/app/components/user/inventario/InventarioUserClient";

export const metadata: Metadata = {
  title: "Inventario",
};

export default function InventarioUserPage() {
  return <InventarioUserClient />;
}
