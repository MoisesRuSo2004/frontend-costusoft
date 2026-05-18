import type { Metadata } from "next";
import BodegaPedidosClient from "@/app/components/bodega/pedidos/BodegaPedidosClient";

export const metadata: Metadata = {
  title: "Pedidos de Producción — Bodega | CostuSoft",
};

export default async function BodegaPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ pedidoId?: string }>;
}) {
  const params = await searchParams;
  const pedidoId = params.pedidoId ? parseInt(params.pedidoId, 10) : undefined;
  const initialPedidoId = pedidoId && Number.isFinite(pedidoId) ? pedidoId : undefined;

  return <BodegaPedidosClient initialPedidoId={initialPedidoId} />;
}
