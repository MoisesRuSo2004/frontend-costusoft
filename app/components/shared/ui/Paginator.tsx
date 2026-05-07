"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Shared elegant paginator
// page        → 0-indexed current page
// totalPages  → total number of pages
// totalElements → (optional) total record count for the "Mostrando X-Y de Z" label
// pageSize    → (optional) records per page, used only to compute range label
// label       → (optional) noun used in the count label, e.g. "insumos"
// accentColor → (optional) active button color, default navy blue
// ─────────────────────────────────────────────────────────────────────────────

interface PaginatorProps {
  page: number;
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  label?: string;
  accentColor?: string;
  onChange: (page: number) => void;
}

/** Builds the window of page indices to display (max 7 slots). */
function buildWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);

  const left  = Math.max(1, current - 1);
  const right = Math.min(total - 2, current + 1);

  const showLeftEllipsis  = left > 2;
  const showRightEllipsis = right < total - 3;

  const pages: (number | "…")[] = [0];

  if (showLeftEllipsis) {
    pages.push("…");
  } else {
    for (let i = 1; i < left; i++) pages.push(i);
  }

  for (let i = left; i <= right; i++) pages.push(i);

  if (showRightEllipsis) {
    pages.push("…");
  } else {
    for (let i = right + 1; i < total - 1; i++) pages.push(i);
  }

  pages.push(total - 1);
  return pages;
}

export default function Paginator({
  page,
  totalPages,
  totalElements,
  pageSize = 10,
  label = "registros",
  accentColor = "#0b3d91",
  onChange,
}: PaginatorProps) {
  if (totalPages <= 1 && !totalElements) return null;
  if (totalPages <= 0) return null;

  const from = totalElements != null ? page * pageSize + 1 : null;
  const to   = totalElements != null ? Math.min((page + 1) * pageSize, totalElements) : null;

  const window = buildWindow(page, totalPages);

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: 32,
    minWidth: 32,
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    backgroundColor: "#fff",
    color: "#374151",
    fontSize: 13,
    fontFamily: "var(--font-poppins), sans-serif",
    fontWeight: 500,
    cursor: "pointer",
    padding: "0 6px",
    transition: "all 0.15s",
    userSelect: "none",
  };

  const btnActive: React.CSSProperties = {
    ...btnBase,
    backgroundColor: accentColor,
    borderColor: accentColor,
    color: "#fff",
    fontWeight: 600,
  };

  const btnDisabled: React.CSSProperties = {
    ...btnBase,
    opacity: 0.35,
    cursor: "not-allowed",
  };

  return (
    <div
      className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-between"
      style={{ borderTop: "1px solid #f3f4f6", paddingTop: 14, marginTop: 4 }}
    >
      {/* Info text */}
      <p
        style={{
          fontSize: 12,
          color: "#9ca3af",
          fontFamily: "var(--font-poppins), sans-serif",
          lineHeight: 1,
        }}
      >
        {from != null && to != null && totalElements != null
          ? `Mostrando ${from.toLocaleString()}–${to.toLocaleString()} de ${totalElements.toLocaleString()} ${label}`
          : `Página ${page + 1} de ${totalPages}`}
      </p>

      {/* Page buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {/* Prev */}
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 0}
          style={page === 0 ? btnDisabled : btnBase}
          aria-label="Página anterior"
        >
          <ChevronLeft size={14} />
        </button>

        {/* Page number window */}
        {window.map((w, i) =>
          w === "…" ? (
            <span
              key={`ellipsis-${i}`}
              style={{ ...btnBase, border: "none", backgroundColor: "transparent", cursor: "default", color: "#9ca3af" }}
            >
              …
            </span>
          ) : (
            <button
              key={w}
              onClick={() => onChange(w as number)}
              style={w === page ? btnActive : btnBase}
              onMouseEnter={(e) => {
                if (w !== page) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f3f4f6";
                }
              }}
              onMouseLeave={(e) => {
                if (w !== page) {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fff";
                }
              }}
            >
              {(w as number) + 1}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages - 1}
          style={page >= totalPages - 1 ? btnDisabled : btnBase}
          aria-label="Página siguiente"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
