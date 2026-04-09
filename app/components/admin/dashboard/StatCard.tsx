"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accentColor: string; // color del borde izquierdo y del ícono
  bgIcon?: string; // bg del círculo ícono
  delay?: number;
};

export default function StatCard({
  label,
  value,
  icon: Icon,
  accentColor,
  bgIcon,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      className="relative flex items-center gap-4 rounded-2xl overflow-hidden"
      style={{
        backgroundColor: "#ffffff",
        padding: "20px 24px",
        boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
        borderLeft: `4px solid ${accentColor}`,
      }}
    >
      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold uppercase tracking-wider mb-1"
          style={{
            color: accentColor,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-bold"
          style={{ color: "#111827", fontFamily: "'Poppins', sans-serif" }}
        >
          {value}
        </p>
      </div>

      {/* Ícono */}
      <div
        className="flex items-center justify-center rounded-xl flex-shrink-0"
        style={{
          width: 48,
          height: 48,
          backgroundColor: bgIcon ?? accentColor + "18",
        }}
      >
        <Icon size={22} style={{ color: accentColor }} strokeWidth={1.8} />
      </div>
    </motion.div>
  );
}
