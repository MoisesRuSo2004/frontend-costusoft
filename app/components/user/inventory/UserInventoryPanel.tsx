import type { InventoryItemOption } from "@/app/types/user-request";

function getStockState(item: InventoryItemOption) {
  if (item.stock === 0) {
    return { label: "Sin stock", background: "#fef3f2", color: "#b42318" };
  }

  if (item.stock <= item.minimumStock) {
    return { label: "Stock bajo", background: "#fff7e6", color: "#b76e00" };
  }

  return { label: "Disponible", background: "#ecfdf3", color: "#027a48" };
}

export default function UserInventoryPanel({
  inventory,
}: {
  inventory: InventoryItemOption[];
}) {
  return (
    <div
      className="rounded-3xl border p-5"
      style={{
        borderColor: "#eaecf0",
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2
            className="text-lg font-semibold"
            style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            Insumos visibles
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
          >
            Consulta el stock actual, pero recuerda que solo bodega confirma cambios.
          </p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: "#eff8ff", color: "#175cd3", fontFamily: "var(--font-poppins), sans-serif" }}
        >
          Solo lectura
        </span>
      </div>

      <div className="mt-5 space-y-3">
        {inventory.map((item) => {
          const stockState = getStockState(item);

          return (
            <div
              key={item.id}
              className="rounded-2xl border p-4"
              style={{ borderColor: "#eaecf0", backgroundColor: "#fcfcfd" }}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {item.name}
                  </p>
                  <p
                    className="mt-1 text-xs"
                    style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    Minimo recomendado: {item.minimumStock} {item.unit}
                  </p>
                </div>
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    backgroundColor: stockState.background,
                    color: stockState.color,
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                >
                  {stockState.label}
                </span>
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs" style={{ color: "#98a2b3", fontFamily: "var(--font-poppins), sans-serif" }}>
                    Stock visible
                  </p>
                  <p
                    className="text-2xl font-semibold"
                    style={{ color: "#101828", fontFamily: "var(--font-poppins), sans-serif" }}
                  >
                    {item.stock}
                  </p>
                </div>
                <p className="text-sm" style={{ color: "#667085", fontFamily: "var(--font-poppins), sans-serif" }}>
                  {item.unit}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
