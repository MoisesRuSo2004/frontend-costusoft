import type { Metadata } from "next";
import EntradasClient from "@/app/components/admin/entradas/EntradasClient";

export const metadata: Metadata = {
  title: "Entradas",
};

export default function EntradasPage() {
  return <EntradasClient />;
}
