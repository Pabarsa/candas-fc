import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CookieBanner from "@/components/CookieBanner";
import ScrollToTop from "@/components/ScrollToTop";
import Link from "next/link";

export const metadata: Metadata = {
  metadataBase: new URL("https://fondosurcanijo.com"),
  title: {
    default: "Fondo Sur Canijo — Aficionados del Candás CF",
    template: "%s — Fondo Sur Canijo",
  },
  description:
    "Web oficial de la afición del Candás CF. Clasificación en directo, simulador de liga, galería de fotos, plantilla, zona de abonados y más. ¡Vamos Canijo! 🔴⚪",
  keywords: [
    "Candás CF", "Fondo Sur Canijo", "Segunda Asturfútbol", "fútbol Asturias",
    "Candás fútbol", "Carreño", "clasificación Asturfútbol", "Candás CF resultados",
  ],
  authors: [{ name: "Fondo Sur Canijo", url: "https://fondosurcanijo.com" }],
  creator: "Fondo Sur Canijo",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://fondosurcanijo.com",
    siteName: "Fondo Sur Canijo",
    title: "Fondo Sur Canijo — Aficionados del Candás CF",
    description:
      "Web oficial de la afición del Candás CF. Clasificación, fotos, plantilla y zona de abonados. ¡Vamos Canijo! 🔴⚪",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Fondo Sur Canijo — Aficionados del Candás CF",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fondo Sur Canijo — Aficionados del Candás CF",
    description: "Web oficial de la afición del Candás CF. ¡Vamos Canijo! 🔴⚪",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://fondosurcanijo.com",
  },
  icons: {
    icon: "/630.png",
    apple: "/630.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">{children}</main>

        <footer className="bg-candas-negro text-white/70 text-sm mt-10">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div>
                <p className="font-bold text-white mb-1">Fondo Sur Canijo</p>
                <p className="text-xs text-white/50 mb-2">
                  Web no oficial de aficionados del Candás CF · ¡Vamos Canijo! 🔴⚪
                </p>
                <a
                  href="https://www.instagram.com/candascf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-white/70 hover:text-white transition"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  @candascf
                </a>
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
              © {new Date().getFullYear()} Fondo Sur Canijo · Hecho con ❤️ en Candás
            </p>
          </div>
        </footer>

        <CookieBanner />
      </body>
    </html>
  );
}