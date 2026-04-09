import type { Metadata } from "next";
import PrediccionClient from "@/app/components/admin/prediccion/PrediccionClient";

export const metadata: Metadata = {
  title: "Predicción de Insumos",
};

export default function PrediccionPage() {
  return <PrediccionClient />;
}