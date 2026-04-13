import type { Metadata } from "next";
import IAView from "@/app/modules/ia/IAView";

export const metadata: Metadata = { title: "Asistente IA" };

export default function UserIAPage() {
  return <IAView canOrdenCompra />;
}
