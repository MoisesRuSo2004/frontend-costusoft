export interface Colegio {
  id: string;
  nombre: string;
  ciudad: string;
  departamento: string;
  contacto: string;
  telefono: string;
  estado: "ACTIVO" | "INACTIVO";
  createdAt: string;
}

export interface CreateColegioPayload {
  nombre: string;
  ciudad: string;
  departamento: string;
  contacto: string;
  telefono: string;
}
