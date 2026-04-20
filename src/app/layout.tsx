import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CookieBanner from "@/components/CookieBanner";
import Link from "next/link";

export const metadata: Metadata = {
  title: "La Peña Canijo — Aficionados del Candás CF",
  description:
    "Web de aficionados del Candás CF. Clasificación en directo, simulador de liga, zona de abonados y galería de fotos. ¡Vamos Canijo! 🔴⚪",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>

        <footer className="bg-candas-negro text-white/70 text-sm mt-10">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p className="font-bold text-white mb-1">La Peña Canijo</p>
                <p className="text-xs text-white/50">
                  Web no oficial de aficionados del Candás CF · ¡Vamos Canijo! 🔴⚪
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-x-6 gap-y-1 text-xs">
                <Link href="/legal/aviso-legal" className="hover:text-white transition">
                  Aviso Legal
                </Link>
                <Link href="/legal/privacidad" className="hover:text-white transition">
                  Política de Privacidad
                </Link>
                <Link href="/legal/cookies" className="hover:text-white transition">
                  Política de Cookies
                </Link>
              </div>
            </div>
            <p className="text-xs text-white/30 mt-6 text-center">
              © {new Date().getFullYear()} Fondo Sur Canijo · Hecho en Candás
            </p>
          </div>
        </footer>

        <CookieBanner />
      </body>
    </html>
  );
}
