import type { Metadata } from "next";
import SolicitudesInstitucionalesClient from "@/app/components/admin/solicitudesInstitucionales/SolicitudesInstitucionalesClient";

export const metadata: Metadata = {
  title: "Solicitudes Institucionales — CostuSoft",
};

export default function SolicitudesInstitucionalesPage() {
  return <SolicitudesInstitucionalesClient />;
}
