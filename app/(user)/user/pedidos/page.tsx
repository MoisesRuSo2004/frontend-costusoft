import type { Metadata } from "next";
import PedidosClient from "@/app/components/admin/pedidos/PedidosClient";

export const metadata: Metadata = {
  title: "Pedidos — Secretaria",
};

export default function UserPedidosPage() {
  return <PedidosClient />;
}
