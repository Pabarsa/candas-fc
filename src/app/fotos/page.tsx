import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import GaleriaPublica from "@/components/GaleriaPublica";

export const metadata = {
  title: "Fotos — Fondo Sur Canijo",
  description: "Galería de fotos del Candás CF. Fotografías de partidos y momentos del equipo.",
};

export const dynamic = "force-dynamic";

type Post = {
  id: number;
  titulo: string;
  descripcion: string | null;
  foto_url: string;
  instagram_fotografa: string | null;
  created_at: string;
};

export default async function FotosPage() {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const esAbonado = !!user;

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  const fotos = (posts as Post[]) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black mb-1">📸 Fotos</h1>
          <p className="text-gray-500">Momentos del Candás CF captados por nuestra afición</p>
        </div>
        {!esAbonado && (
          <Link
            href="/registro"
            className="flex-shrink-0 bg-candas-rojo text-white font-bold px-5 py-2.5 rounded-xl hover:bg-candas-rojoOscuro transition text-sm text-center"
          >
            🔴 Hazte abonado para descargarlas
          </Link>
        )}
      </div>

      {fotos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📷</p>
          <p className="font-medium text-lg">Pronto habrá fotos aquí</p>
          <p className="text-sm mt-1">¡Vamos Canijo! 🔴⚪</p>
        </div>
      ) : (
        <GaleriaPublica fotos={fotos} esAbonado={esAbonado} />
      )}

      {/* CTA solo para no abonados */}
      {fotos.length > 0 && !esAbonado && (
        <div className="mt-12 text-center bg-candas-crema border border-red-100 rounded-2xl p-8">
          <p className="text-lg font-black text-gray-900 mb-1">¿Quieres descargar las fotos?</p>
          <p className="text-gray-500 text-sm mb-4">Regístrate como abonado, es gratis y tienes acceso a todo.</p>
          <Link
            href="/registro"
            className="inline-block bg-candas-rojo text-white font-bold px-8 py-3 rounded-xl hover:bg-candas-rojoOscuro transition"
          >
            Crear cuenta gratis
          </Link>
        </div>
      )}
    </div>
  );
}