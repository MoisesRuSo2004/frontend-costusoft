import type { Metadata } from "next";
import CalculadoraView from "@/app/modules/calculadora/CalculadoraView";

export const metadata: Metadata = {
  title: "Calculadora",
};

export default function AdminCalculadoraPage() {
  return <CalculadoraView />;
}
