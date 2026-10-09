import type { Metadata } from "next";
import MineriaClient from "@/app/components/admin/mineria/MineriaClient";

export const metadata: Metadata = {
  title: "Minería de datos",
};

export default function MineriaPage() {
  return <MineriaClient />;
}
