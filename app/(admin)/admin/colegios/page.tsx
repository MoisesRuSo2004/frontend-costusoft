import type { Metadata } from "next";
import ColegiosView from "@/app/modules/colegios/ColegiosView";

export const metadata: Metadata = {
  title: "Colegios",
};

export default function AdminColegiosPage() {
  return <ColegiosView />;
}
