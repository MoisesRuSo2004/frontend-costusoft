import type { Metadata } from "next";
import AdminRequestsDashboard from "@/app/modules/admin/requests/AdminRequestsDashboard";

export const metadata: Metadata = {
  title: "Solicitudes — CostuSoft",
};

export default function SolicitudesPage() {
  return <AdminRequestsDashboard />;
}
