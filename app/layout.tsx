import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext";

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
      <body className={`${poppins.className} antialiased`}>
          <AuthProvider>{children}</AuthProvider>
        </body>
    </html>
  );
}
