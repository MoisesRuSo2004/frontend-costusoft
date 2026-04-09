export interface UniformOption {
  id: string;
  nombre: string;
}

export interface ColegioOption {
  id: string;
  nombre: string;
  uniformes: UniformOption[];
}

export interface CalculadoraFormValues {
  colegioId: string;
  uniformeId: string;
  cantidad: number;
}

export interface CalculadoraResultadoItem {
  id: string;
  nombre: string;
  unidad: string;
  cantidadRequerida: number;
  stockDisponible: number;
  suficiente: boolean;
}

export interface CalculadoraResultado {
  items: CalculadoraResultadoItem[];
  suficiente: boolean;
  mensaje?: string;
  raw: unknown;
}

export interface SolicitudSalidaPayload {
  colegioId: string;
  uniformeId: string;
  cantidad: number;
  items: CalculadoraResultadoItem[];
}
