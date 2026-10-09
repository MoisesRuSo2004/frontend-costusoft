import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";
import { SessionTimeoutManager } from "@/app/components/auth/SessionTimeoutManager";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | CostuSoft Control",
    default: "CostuSoft Control",
  },
  description: "Sistema de control CostuSoft",
  icons: {
    icon: "/img/icons8-coser-16.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={poppins.variable}>
      {/* Extensiones del navegador (p. ej. ColorZilla: cz-shortcut-listen) agregan
          atributos a <body> antes de que cargue React. Solo se ignoran las
          diferencias de atributos de esta etiqueta, no las de su contenido. */}
      <body className={`${poppins.className} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          <SessionTimeoutManager />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
