import type { Colegio } from "@/app/types/colegio";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
  }).format(new Date(date));
}

export default function ColegiosTable({
  colegios,
  loading,
}: {
  colegios: Colegio[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-3">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="h-20 animate-pulse rounded-3xl"
            style={{ backgroundColor: "#e5e7eb" }}
          />
        ))}
      </div>
    );
  }

  if (colegios.length === 0) {
    return (
      <div
        className="rounded-3xl border border-dashed p-10 text-center"
        style={{ borderColor: "#d0d5dd", backgroundColor: "#ffffff" }}
      >
        <h3
          className="text-base font-semibold"
          style={{
            color: "#101828",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          Aun no hay colegios registrados
        </h3>
        <p
          className="mt-2 text-sm"
          style={{
            color: "#667085",
            fontFamily: "var(--font-poppins), sans-serif",
          }}
        >
          Usa el formulario para crear el primer cliente del sistema.
        </p>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-3xl border"
      style={{
        borderColor: "#eaecf0",
        backgroundColor: "#ffffff",
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead style={{ backgroundColor: "#f8fafc" }}>
            <tr>
              {[
                "Colegio",
                "Ubicacion",
                "Contacto",
                "Telefono",
                "Estado",
                "Registro",
              ].map((label) => (
                <th
                  key={label}
                  className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em]"
                  style={{
                    color: "#667085",
                    fontFamily: "var(--font-poppins), sans-serif",
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {colegios.map((colegio) => (
              <tr
                key={colegio.id}
                className="border-t transition-colors duration-200 ease-in-out hover:bg-[#f8fafc]"
                style={{ borderColor: "#f2f4f7" }}
              >
                <td className="px-6 py-4">
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "#101828",
                      fontFamily: "var(--font-poppins), sans-serif",
                    }}
                  >
                    {colegio.nombre}
                  </p>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: "#475467" }}>
                  {colegio.ciudad}, {colegio.departamento}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: "#475467" }}>
                  {colegio.contacto}
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: "#475467" }}>
                  {colegio.telefono}
                </td>
                <td className="px-6 py-4">
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor:
                        colegio.estado === "ACTIVO" ? "#ecfdf3" : "#fef3f2",
                      color:
                        colegio.estado === "ACTIVO" ? "#027a48" : "#b42318",
                      fontFamily: "var(--font-poppins), sans-serif",
                    }}
                  >
                    {colegio.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm" style={{ color: "#475467" }}>
                  {formatDate(colegio.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
