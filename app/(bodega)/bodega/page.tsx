import type { Metadata } from "next";
import BodegaDashboard from "@/app/modules/bodega/dashboard/BodegaDashboard";

export const metadata: Metadata = {
  title: "Bodega",
};

export default function BodegaPage() {
  return <BodegaDashboard />;
}
