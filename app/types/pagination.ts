/** Respuesta paginada genérica de Spring Boot (PageDTO<T>) */
export interface PageData<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // página actual (0-based)
  size: number;
  first: boolean;
  last: boolean;
}
