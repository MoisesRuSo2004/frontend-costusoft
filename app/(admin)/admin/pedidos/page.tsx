import type { Metadata } from "next";
import PedidosClient from "@/app/components/admin/pedidos/PedidosClient";

export const metadata: Metadata = {
  title: "Pedidos — CostuSoft",
};

export default function PedidosPage() {
  return <PedidosClient />;
}
