"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  AlertCircle,
  BrainCircuit,
  Building2,
  ClipboardList,
  MessageSquarePlus,
  Package,
  PlusCircle,
  RefreshCw,
  Shirt,
} from "lucide-react";
import { institucionService } from "@/app/services/institucion.service";
import type { InstitucionPerfilResponse } from "@/app/types/institucion";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function KpiCard({
  title,
  value,
  subtitle,
  accent,
  icon: Icon,
  href,
}: {
  title: string;
  value: number;
  subtitle: string;
  accent: string;
  icon: typeof Package;
  href?: string;
}) {
  const content = (
    <div
      className="rounded-3xl border p-5 transition-shadow duration-200"
      style={{
        borderColor: "#eaecf0",
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 20px rgba(15,23,42,0.05)",
        cursor: href ? "pointer" : "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 32px rgba(15,23,42,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 2px 20px rgba(15,23,42,0.05)";
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-[0.12em]"
            style={{ color: "#667085", fontFamily: "'Poppins', sans-serif" }}
          >
            {title}
          </p>
          <p
            className="mt-2 text-3xl font-bold"
            style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
          >
            {value}
          </p>
          <p
            className="mt-1.5 text-xs leading-relaxed"
            style={{ color: "#98a2b3", fontFamily: "'Poppins', sans-serif" }}
          >
            {subtitle}
          </p>
        </div>
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: "none" }}>{content}</Link>;
  }
  return content;
}

function SkeletonCard() {
  return (
    <div
      className="animate-pulse rounded-3xl border p-5"
      style={{ borderColor: "#eaecf0", backgroundColor: "#ffffff" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-3 flex-1">
          <div className="h-3 w-24 rounded-full" style={{ backgroundColor: "#e5e7eb" }} />
          <div className="h-8 w-16 rounded-full" style={{ backgroundColor: "#e5e7eb" }} />
          <div className="h-2.5 w-32 rounded-full" style={{ backgroundColor: "#e5e7eb" }} />
        </div>
        <div className="h-11 w-11 rounded-2xl" style={{ backgroundColor: "#e5e7eb" }} />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function InstitucionDashboardPage() {
  const [perfil, setPerfil] = useState<InstitucionPerfilResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await institucionService.getPerfil();
      setPerfil(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar el perfil.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  return (
    <section className="flex flex-col gap-6 pb-10">

      {/* ── Header de bienvenida ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="rounded-3xl border p-6"
        style={{
          background: "linear-gradient(135deg, #065f73 0%, #0891b2 100%)",
          borderColor: "transparent",
          boxShadow: "0 4px 24px rgba(8,145,178,0.25)",
        }}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 size={20} style={{ color: "rgba(255,255,255,0.8)" }} />
              <span
                className="text-xs font-semibold uppercase tracking-[0.16em]"
                style={{ color: "rgba(255,255,255,0.65)", fontFamily: "'Poppins', sans-serif" }}
              >
                Portal Institucional
              </span>
            </div>
            {loading ? (
              <div className="flex flex-col gap-2">
                <div className="h-7 w-56 animate-pulse rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
                <div className="h-4 w-40 animate-pulse rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.10)" }} />
              </div>
            ) : perfil ? (
              <>
                <h1
                  className="text-2xl font-bold text-white"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {perfil.nombreColegio}
                </h1>
                <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.70)", fontFamily: "'Poppins', sans-serif" }}>
                  {perfil.direccionColegio} · @{perfil.username}
                </p>
              </>
            ) : null}
          </div>

          <button
            onClick={cargar}
            disabled={loading}
            className="flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition-all"
            style={{
              borderColor: "rgba(255,255,255,0.22)",
              backgroundColor: "rgba(255,255,255,0.10)",
              color: "#ffffff",
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>
      </motion.div>

      {/* ── Error ────────────────────────────────────────────────── */}
      {error && (
        <div
          className="flex items-center gap-3 rounded-2xl border px-5 py-3.5"
          style={{ borderColor: "#fecaca", backgroundColor: "#fef2f2" }}
        >
          <AlertCircle size={18} style={{ color: "#dc2626", flexShrink: 0 }} />
          <p className="text-sm" style={{ color: "#b42318", fontFamily: "'Poppins', sans-serif" }}>
            {error}
          </p>
        </div>
      )}

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 xl:grid-cols-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : perfil ? (
          <>
            <KpiCard
              title="Total pedidos"
              value={perfil.totalPedidos}
              subtitle="Pedidos realizados desde tu colegio"
              accent="#0891b2"
              icon={ClipboardList}
              href="/institucion/pedidos"
            />
            <KpiCard
              title="Pedidos activos"
              value={perfil.pedidosActivos}
              subtitle="En proceso de producción o entrega"
              accent="#f59e0b"
              icon={Package}
              href="/institucion/pedidos"
            />
            <KpiCard
              title="Uniformes"
              value={perfil.totalUniformes}
              subtitle="Prendas configuradas para tu colegio"
              accent="#0891b2"
              icon={Shirt}
            />
            <KpiCard
              title="Solicitudes"
              value={perfil.solicitudesPendientes}
              subtitle={perfil.solicitudesPendientes === 0 ? "Sin solicitudes pendientes" : "Esperando respuesta"}
              accent={perfil.solicitudesPendientes > 0 ? "#dc2626" : "#16a34a"}
              icon={MessageSquarePlus}
              href="/institucion/solicitudes"
            />
          </>
        ) : null}
      </div>

      {/* ── Accesos rápidos ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="rounded-3xl border p-6"
        style={{
          borderColor: "#eaecf0",
          backgroundColor: "#ffffff",
          boxShadow: "0 2px 20px rgba(15,23,42,0.05)",
        }}
      >
        <h2
          className="mb-4 text-base font-semibold"
          style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
        >
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              href: "/institucion/pedidos/nuevo",
              icon: PlusCircle,
              label: "Nuevo pedido",
              desc: "Solicitar uniformes del catálogo",
              color: "#0891b2",
              bg: "#ecf9fc",
            },
            {
              href: "/institucion/solicitudes/nueva",
              icon: MessageSquarePlus,
              label: "Nueva solicitud",
              desc: "Contactar al equipo Costusoft",
              color: "#f59e0b",
              bg: "#fffbeb",
            },
            {
              href: "/institucion/ia",
              icon: BrainCircuit,
              label: "Asistente IA",
              desc: "Consultar estado de pedidos",
              color: "#7c3aed",
              bg: "#f5f3ff",
            },
          ].map(({ href, icon: Icon, label, desc, color, bg }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200"
              style={{
                borderColor: "#eaecf0",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = color;
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = bg;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = "#eaecf0";
                (e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent";
              }}
            >
              <div
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: bg, color }}
              >
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <p
                  className="text-sm font-semibold"
                  style={{ color: "#101828", fontFamily: "'Poppins', sans-serif" }}
                >
                  {label}
                </p>
                <p
                  className="text-xs"
                  style={{ color: "#9ca3af", fontFamily: "'Poppins', sans-serif" }}
                >
                  {desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
