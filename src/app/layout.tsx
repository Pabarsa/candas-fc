import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import CookieBanner from "@/components/CookieBanner";
import ScrollToTop from "@/components/ScrollToTop";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://fondosurcanijo.com"),
  title: {
    default: "Fondo Sur Canijo — Aficionados del Candás CF",
    template: "%s — Fondo Sur Canijo",
  },
  description:
    "Web oficial de la afición del Candás CF. Clasificación en directo, simulador de liga, galería de fotos, plantilla, zona de abonados y más.",
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
    description: "Web oficial de la afición del Candás CF. Clasificación, fotos, plantilla y zona de abonados.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Fondo Sur Canijo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fondo Sur Canijo — Aficionados del Candás CF",
    description: "Web oficial de la afición del Candás CF.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  alternates: { canonical: "https://fondosurcanijo.com" },
  icons: { icon: "/630.png", apple: "/630.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen flex flex-col bg-site text-white antialiased">
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">{children}</main>

        {/* ── PATROCINADORES ── */}
        <div className="border-t border-white/5 bg-black/40 py-12 px-5 sm:px-6">
          <div className="max-w-6xl mx-auto">
            <p className="text-white/20 text-[10px] uppercase tracking-widest text-center mb-10">Patrocinadores del Candás CF</p>

            {/* Oficial — el más grande */}
            <div className="flex justify-center mb-12">
              <a href="https://www.agromar.es" target="_blank" rel="noopener noreferrer"
                className="block opacity-90 hover:opacity-100 transition-opacity duration-200">
                <img src="/patrocinadores/agromar.png" alt="Agromar" className="h-28 object-contain" />
              </a>
            </div>

            {/* Fila 1 — 4 logos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8 items-center justify-items-center">
              {[
                { name: "Helados Helio",   url: "https://www.instagram.com/heladoshelio/",         img: "/patrocinadores/helados-helio.png" },
                { name: "Clínica Bejerano",url: "https://clinicabejerano.com",                      img: "/patrocinadores/bejerano.png" },
                { name: "Las Terrazas",    url: "https://lasterrazasdecandas.es",                   img: "/patrocinadores/las-terrazas.png" },
                { name: "Tierras Gallegas",url: "https://www.tierrasgallegas.com",                  img: "/patrocinadores/tierras-gallegas.png" },
              ].map((p) => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="block opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-200">
                  <img src={p.img} alt={p.name} className="h-14 object-contain" />
                </a>
              ))}
            </div>

            {/* Fila 2 — 4 logos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8 items-center justify-items-center">
              {[
                { name: "Vinos Tascón",      url: "https://www.facebook.com/vinostascon/",             img: "/patrocinadores/vinos-tascon.png" },
                { name: "Sidra Peñón",        url: "https://www.sidrapenon.com",                        img: "/patrocinadores/sidra-penon.png" },
                { name: "Transportes Pico",   url: "https://grupopico.es",                              img: "/patrocinadores/transportes-pico.png" },
                { name: "Muebles Novar",      url: "https://www.instagram.com/muebles_novar_luanco/",   img: "/patrocinadores/muebles-novar.png" },
              ].map((p) => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="block opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-200">
                  <img src={p.img} alt={p.name} className="h-14 object-contain" />
                </a>
              ))}
            </div>

            {/* Fila 3 — 4 logos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8 items-center justify-items-center">
              {[
                { name: "Bar Domingo",  url: "https://www.facebook.com/bardomingo/",          img: "/patrocinadores/bar-domingo.png" },
                { name: "Hotel Piedra", url: "https://hotelpiedra.es",                        img: "/patrocinadores/hotel-piedra.png" },
                { name: "Copy Flash",   url: "https://copisteriacopyflash.es",                img: "/patrocinadores/copy-flash.png" },
                { name: "CD Autos",     url: null,                                             img: "/patrocinadores/cd-autos.png" },
              ].map((p) => (
                p.url ? (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                    className="block opacity-85 hover:opacity-100 hover:scale-105 transition-all duration-200">
                    <img src={p.img} alt={p.name} className="h-14 object-contain" />
                  </a>
                ) : (
                  <div key={p.name} className="block opacity-80">
                    <img src={p.img} alt={p.name} className="h-14 object-contain" />
                  </div>
                )
              ))}
            </div>

            {/* Fila 4 — 5 logos medianos */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-6 mb-8 items-center justify-items-center">
              {[
                { name: "El Cubano",  url: "https://www.instagram.com/restaurante.cubano/",        img: "/patrocinadores/el-cubano.png" },
                { name: "La Calma",   url: "https://www.instagram.com/lacalmacandas/",              img: "/patrocinadores/la-calma.png" },
                { name: "B3rto's",    url: "https://www.instagram.com/b3rtosbarcafeteria/",         img: "/patrocinadores/bertos.png" },
                { name: "El Mirados", url: null,                                                     img: "/patrocinadores/el-mirados.png" },
                { name: "Iris Café",  url: "https://www.facebook.com/people/Iris-Caf%C3%A9/100057402822406/", img: "/patrocinadores/iris-cafe.png" },
              ].map((p) => (
                p.url ? (
                  <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                    className="block opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-200">
                    <img src={p.img} alt={p.name} className="h-12 object-contain" />
                  </a>
                ) : (
                  <div key={p.name} className="block opacity-75">
                    <img src={p.img} alt={p.name} className="h-12 object-contain" />
                  </div>
                )
              ))}
            </div>

            {/* Fila 5 — 3 logos pequeños */}
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto items-center justify-items-center">
              {[
                { name: "Socializ",             url: "https://www.instagram.com/socialiteshop/",                                 img: "/patrocinadores/socializ.png" },
                { name: "Carrocerías Sirgo",     url: "https://redcomercial.peugeot.es/sirgo/",                                  img: "/patrocinadores/carrocerias-sirgo.png" },
                { name: "Fisioterapia Integral", url: "https://medicalfisio.es/candas-fisioterapia-integral-en-candas-asturias/", img: "/patrocinadores/medicalfisio.png" },
              ].map((p) => (
                <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
                  className="block opacity-75 hover:opacity-100 hover:scale-105 transition-all duration-200">
                  <img src={p.img} alt={p.name} className="h-10 object-contain" />
                </a>
              ))}
            </div>

          </div>
        </div>

        <footer className="bg-black/60 border-t border-white/5 text-white/50 text-sm mt-0">
          <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div>
                <p className="font-poppins font-700 text-white text-base mb-1 tracking-tight">
                  Fondo Sur Canijo
                </p>
                <p className="text-xs text-white/30 mb-3">
                  Web de aficionados del Candás CF · Carreño, Asturias
                </p>
                <a
                  href="https://www.instagram.com/candascf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors duration-200"
                >
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  @candascf
                </a>
              </div>
              <div className="flex flex-col sm:flex-row gap-x-8 gap-y-1 text-xs text-white/30">
                <Link href="/legal/aviso-legal" className="hover:text-white/70 transition-colors duration-200">Aviso Legal</Link>
                <Link href="/legal/privacidad" className="hover:text-white/70 transition-colors duration-200">Privacidad</Link>
                <Link href="/legal/cookies" className="hover:text-white/70 transition-colors duration-200">Cookies</Link>
              </div>
            </div>
            <p className="text-xs text-white/20 mt-8 text-center tracking-widest uppercase">
              &copy; {new Date().getFullYear()} Fondo Sur Canijo
            </p>
          </div>
        </footer>

        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}