import type { Metadata } from "next";
import ColegiosClient from "@/app/components/admin/colegios/ColegiosClient";

export const metadata: Metadata = {
  title: "Colegios — CostuSoft",
};

export default function ColegiosPage() {
  return <ColegiosClient />;
}
