import type { Metadata } from "next";
import PedidosClient from "@/app/components/admin/pedidos/PedidosClient";

export const metadata: Metadata = {
  title: "Pedidos — CostuSoft",
};

export default async function PedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ pedidoId?: string }>;
}) {
  const params = await searchParams;
  const pedidoId = params.pedidoId ? parseInt(params.pedidoId, 10) : undefined;
  const initialPedidoId = pedidoId && Number.isFinite(pedidoId) ? pedidoId : undefined;

  return <PedidosClient initialPedidoId={initialPedidoId} />;
}
