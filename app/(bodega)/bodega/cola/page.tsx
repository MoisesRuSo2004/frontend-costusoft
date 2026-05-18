import type { Metadata } from "next";
import BodegaColaClient from "@/app/components/bodega/cola/BodegaColaClient";
import type { ColaTab } from "@/app/hooks/useBodegaCola";

export const metadata: Metadata = {
  title: "Cola de Trabajo — Bodega | CostuSoft",
};

export default async function BodegaColaPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab: ColaTab = params.tab === "salidas" ? "salidas" : "entradas";

  return <BodegaColaClient initialTab={tab} />;
}
