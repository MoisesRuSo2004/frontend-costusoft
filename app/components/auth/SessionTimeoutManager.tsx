"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Clock } from "lucide-react";
import { useSessionTimeout } from "@/app/hooks/useSessionTimeout";

export function SessionTimeoutManager() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(5 * 60); // 5 minutos

  useSessionTimeout(() => {
    // Callback cuando sesión expira
    setShowWarning(false);
  });

  useEffect(() => {
    const handleSessionWarning = () => {
      setShowWarning(true);
      setTimeRemaining(5 * 60);
    };

    window.addEventListener("sessionWarning", handleSessionWarning);

    return () => {
      window.removeEventListener("sessionWarning", handleSessionWarning);
    };
  }, []);

  // Actualizar tiempo restante
  useEffect(() => {
    if (!showWarning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showWarning]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <AnimatePresence>
      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] max-w-md"
        >
          <div
            className="rounded-2xl border p-5 shadow-lg flex items-start gap-4"
            style={{
              borderColor: "#fbbf24",
              backgroundColor: "#fffbeb",
            }}
          >
            <div className="flex-shrink-0 mt-0.5">
              <Clock size={20} style={{ color: "#d97706" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="font-semibold text-sm"
                style={{ color: "#b45309", fontFamily: "'Poppins', sans-serif" }}
              >
                Sesión por expirar
              </p>
              <p
                className="text-xs mt-1"
                style={{ color: "#92400e", fontFamily: "'Poppins', sans-serif" }}
              >
                Tu sesión se cerrará en{" "}
                <span className="font-mono font-bold">
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
                {" "}si no hay actividad. Mueve el ratón o haz clic para continuar.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
