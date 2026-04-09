import type { Metadata } from "next";
import SalidasClient from "@/app/components/admin/salidas/SalidasClient";

export const metadata: Metadata = {
  title: "Salidas",
};

export default function SalidasPage() {
  return <SalidasClient />;
}
