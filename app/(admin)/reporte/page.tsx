import type { Metadata } from "next";
import ReporteClient from "@/app/components/admin/reporte/ReporteClient";

export const metadata: Metadata = {
  title: "Reportes",
};

export default function ReportePage() {
  return <ReporteClient />;
}
