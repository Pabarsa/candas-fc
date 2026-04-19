import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Candás CF — Segunda Asturfútbol",
  description:
    "Web oficial de aficionados del Candás CF: clasificación en directo, simulador y zona de abonados.",
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
        <footer className="bg-candas-negro text-white/70 text-sm">
          <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between gap-2">
            <p>© {new Date().getFullYear()} Candás CF — Web de aficionados</p>
            <p>Hecho con ❤️ en Candás</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
