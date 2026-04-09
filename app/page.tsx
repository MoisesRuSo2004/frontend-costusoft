import { redirect } from "next/navigation";

// El middleware redirige / → /login o al dashboard del rol.
// Este redirect es un fallback por si el middleware no intercepta.
export default function HomePage() {
  redirect("/login");
}
