import type { Metadata } from "next";
import AdminRequestsDashboard from "@/app/modules/admin/requests/AdminRequestsDashboard";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return <AdminRequestsDashboard />;
}
