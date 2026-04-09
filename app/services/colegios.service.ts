import type { Colegio, CreateColegioPayload } from "@/app/types/colegio";

const MOCK_COLEGIOS: Colegio[] = [
  {
    id: "col-001",
    nombre: "Colegio San Martin",
    ciudad: "Bogota",
    departamento: "Cundinamarca",
    contacto: "Laura Perez",
    telefono: "3104567890",
    estado: "ACTIVO",
    createdAt: "2026-03-20T08:00:00.000Z",
  },
  {
    id: "col-002",
    nombre: "Instituto Nueva Esperanza",
    ciudad: "Medellin",
    departamento: "Antioquia",
    contacto: "Carlos Ruiz",
    telefono: "3205551122",
    estado: "ACTIVO",
    createdAt: "2026-03-18T10:30:00.000Z",
  },
  {
    id: "col-003",
    nombre: "Liceo Horizonte",
    ciudad: "Cali",
    departamento: "Valle del Cauca",
    contacto: "Diana Gomez",
    telefono: "3009988776",
    estado: "INACTIVO",
    createdAt: "2026-03-15T14:15:00.000Z",
  },
];

let colegiosStore = [...MOCK_COLEGIOS];

async function simulateNetwork<T>(data: T): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return data;
}

export async function getColegiosList(): Promise<Colegio[]> {
  // TODO: reemplazar por GET /api/colegios cuando integremos backend real.
  return simulateNetwork(
    [...colegiosStore].sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    ),
  );
}

export async function createColegio(
  payload: CreateColegioPayload,
): Promise<Colegio> {
  // TODO: reemplazar por POST /api/colegios cuando integremos backend real.
  const nextColegio: Colegio = {
    id: `col-${String(colegiosStore.length + 1).padStart(3, "0")}`,
    nombre: payload.nombre,
    ciudad: payload.ciudad,
    departamento: payload.departamento,
    contacto: payload.contacto,
    telefono: payload.telefono,
    estado: "ACTIVO",
    createdAt: new Date().toISOString(),
  };

  colegiosStore = [nextColegio, ...colegiosStore];

  return simulateNetwork(nextColegio);
}
