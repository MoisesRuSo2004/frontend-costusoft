"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { Scissors, Shirt, ClipboardList } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex w-full min-h-screen bg-white">

      {/* ── LADO IZQUIERDO: Formulario ── */}
      <div className="relative flex flex-col w-full lg:w-1/2 min-h-screen lg:h-screen bg-white overflow-y-auto">
        {/* Logo visible solo en móvil/tablet (panel derecho oculto) */}
        <div className="flex justify-center pt-8 pb-2 lg:hidden">
          <Image
            src="/logo/logo-login.svg"
            alt="CostuSoft"
            width={160}
            height={60}
            className="object-contain"
            priority
          />
        </div>
        {children}
      </div>

      {/* ── LADO DERECHO: Azul corporativo ── */}
      <div
        className="hidden lg:flex lg:w-1/2 min-h-screen sticky top-0 h-screen relative overflow-hidden items-center justify-center"
        style={{
          background:
            "linear-gradient(145deg, #0b3d91 0%, #072d6e 60%, #041d47 100%)",
        }}
      >
        {/* Grid pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.06]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Partículas flotantes */}
        <FloatingParticles />

        {/* Glow verde */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 480,
            height: 480,
            background:
              "radial-gradient(circle, rgba(73,194,27,0.12) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Círculos decorativos */}
        <div className="absolute -top-24 -right-24 rounded-full"
          style={{ width: 300, height: 300, backgroundColor: "rgba(73,194,27,0.08)" }} />
        <div className="absolute -bottom-20 -left-20 rounded-full"
          style={{ width: 240, height: 240, backgroundColor: "rgba(255,255,255,0.04)" }} />

        {/* Contenido central — sin scroll, todo escala con clamp() */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center w-full max-w-md"
          style={{ padding: "clamp(1.5rem, 4vh, 3.5rem) clamp(1.5rem, 3vw, 3.5rem)" }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            style={{ marginBottom: "clamp(0.75rem, 2.5vh, 1.5rem)" }}
          >
            <Image
              src="/logo/logo-login.svg"
              alt="CostuSoft Control"
              width={260}
              height={110}
              className="object-contain"
              style={{
                width: "clamp(180px, 20vw, 300px)",
                height: "auto",
                filter: "drop-shadow(0 12px 28px rgba(73,194,27,0.3))",
              }}
              priority
            />
          </motion.div>

          {/* Divider */}
          <div
            className="flex items-center gap-3 w-full"
            style={{ marginBottom: "clamp(1rem, 3vh, 2rem)" }}
          >
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
            <div className="flex gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "#49c21b" }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.3)" }} />
            </div>
            <div className="flex-1 h-px" style={{ backgroundColor: "rgba(255,255,255,0.15)" }} />
          </div>

          {/* Título */}
          <h2
            className="font-bold text-white"
            style={{
              fontFamily: "'Poppins', sans-serif",
              lineHeight: 1.25,
              fontSize: "clamp(1.35rem, 2.5vh, 2rem)",
              marginBottom: "clamp(0.5rem, 1.5vh, 1rem)",
            }}
          >
            Bienvenido al panel de gestión
          </h2>

          <p
            style={{
              color: "rgba(255,255,255,0.55)",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 300,
              fontSize: "clamp(0.8rem, 1.6vh, 1rem)",
              lineHeight: 1.6,
              marginBottom: "clamp(1.25rem, 3.5vh, 2.5rem)",
            }}
          >
            Administra tu operación de costura, productos y pedidos desde un solo lugar.
          </p>

          {/* Features */}
          <div className="text-left w-full" style={{ gap: "clamp(0.75rem, 2vh, 1.25rem)", display: "flex", flexDirection: "column" }}>
            {[
              { icon: Scissors,      label: "Gestiona órdenes de trabajo" },
              { icon: Shirt,         label: "Administra productos y referencias" },
              { icon: ClipboardList, label: "Controla pedidos y entregas" },
            ].map(({ icon: Icon, label }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + i * 0.15, duration: 0.5 }}
                whileHover={{ x: 6 }}
                className="flex items-center gap-3"
              >
                <div
                  className="flex items-center justify-center rounded-lg flex-shrink-0"
                  style={{
                    width: "clamp(32px, 4vh, 42px)",
                    height: "clamp(32px, 4vh, 42px)",
                    backgroundColor: "rgba(73,194,27,0.15)",
                    border: "1px solid rgba(73,194,27,0.3)",
                  }}
                >
                  <Icon size={15} style={{ color: "#49c21b" }} />
                </div>
                <span
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "clamp(0.8rem, 1.6vh, 0.95rem)",
                  }}
                >
                  {label}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Badge corporativo */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="rounded-full text-xs tracking-widest uppercase"
            style={{
              marginTop: "clamp(1.25rem, 3.5vh, 2.5rem)",
              padding: "0.4rem 1.25rem",
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "0.22em",
              fontSize: "clamp(0.65rem, 1.1vh, 0.75rem)",
            }}
          >
            Panel Administrativo
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 14 });
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: i % 3 === 0 ? 6 : 4,
            height: i % 3 === 0 ? 6 : 4,
            backgroundColor:
              i % 4 === 0 ? "rgba(73,194,27,0.5)" : "rgba(255,255,255,0.15)",
            left: `${10 + ((i * 73) % 80)}%`,
            top: `${5 + ((i * 61) % 90)}%`,
          }}
          animate={{
            y: [0, -(30 + (i % 3) * 15), 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 5 + (i % 4) * 1.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
