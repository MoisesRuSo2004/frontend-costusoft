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
    <div className="relative flex w-full h-screen overflow-hidden bg-white">
      {/* ── LADO IZQUIERDO: Formulario ── */}
      <div className="relative flex flex-col w-full lg:w-1/2 h-full bg-white overflow-y-auto">
        {children}
      </div>

      {/* ── LADO DERECHO: Azul corporativo ── */}
      <div
        className="hidden lg:flex lg:w-1/2 h-full relative overflow-hidden items-center justify-center"
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
            <pattern
              id="grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="white"
                strokeWidth="1"
              />
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

        {/* Círculo decorativo top-right */}
        <div
          className="absolute -top-24 -right-24 rounded-full"
          style={{
            width: 300,
            height: 300,
            backgroundColor: "rgba(73,194,27,0.08)",
          }}
        />
        {/* Círculo decorativo bottom-left */}
        <div
          className="absolute -bottom-20 -left-20 rounded-full"
          style={{
            width: 240,
            height: 240,
            backgroundColor: "rgba(255,255,255,0.04)",
          }}
        />

        {/* Contenido central */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="-mb-0"
          >
            <Image
              src="/logo/logo-login.svg"
              alt="CostuSoft Control"
              width={320}
              height={140}
              className="object-contain"
              style={{
                filter: "drop-shadow(0 20px 40px rgba(73,194,27,0.3))",
                maxWidth: 320,
              }}
              priority
            />
          </motion.div>

          {/* Divider */}
          <div className="flex items-center gap-3 w-full mb-8">
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            />
            <div className="flex gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "#49c21b" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              />
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: "rgba(255,255,255,0.3)" }}
              />
            </div>
            <div
              className="flex-1 h-px"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            />
          </div>

          {/* Título */}
          <h2
            className="text-3xl font-bold text-white mb-3"
            style={{ fontFamily: "'Poppins', sans-serif", lineHeight: 1.25 }}
          >
            Bienvenido al panel de gestión
          </h2>

          <p
            className="text-base leading-relaxed mb-10"
            style={{
              color: "rgba(255,255,255,0.55)",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 300,
            }}
          >
            Administra tu operación de costura, productos y pedidos desde un
            solo lugar.
          </p>

          {/* Features */}
          <div className="space-y-4 text-left w-full">
            {[
              { icon: Scissors, label: "Gestiona órdenes de trabajo" },
              { icon: Shirt, label: "Administra productos y referencias" },
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
                    width: 36,
                    height: 36,
                    backgroundColor: "rgba(73,194,27,0.15)",
                    border: "1px solid rgba(73,194,27,0.3)",
                  }}
                >
                  <Icon size={17} style={{ color: "#49c21b" }} />
                </div>
                <span
                  className="text-sm"
                  style={{
                    color: "rgba(255,255,255,0.8)",
                    fontFamily: "'Poppins', sans-serif",
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
            className="mt-10 px-5 py-2 rounded-full text-xs tracking-widest uppercase"
            style={{
              backgroundColor: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "'Poppins', sans-serif",
              letterSpacing: "0.22em",
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
