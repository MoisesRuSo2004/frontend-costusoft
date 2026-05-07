import type { Metadata } from "next";
import UniformesClient from "@/app/components/admin/uniformes/UniformesClient";

export const metadata: Metadata = {
  title: "Uniformes",
};

export default function UniformesUserPage() {
  return <UniformesClient />;
}
