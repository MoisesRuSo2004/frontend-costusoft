import type { Metadata } from "next";
import IAView from "@/app/modules/ia/IAView";

export const metadata: Metadata = { title: "Asistente IA" };

export default function BodegaIAPage() {
  // BODEGA no tiene acceso a generar órdenes de compra
  return <IAView canOrdenCompra={false} />;
}
