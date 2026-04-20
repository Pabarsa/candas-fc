import { createClient } from "@/lib/supabase/server";
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

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  const fotos = (posts as Post[]) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black mb-1">📸 Fotos</h1>
        <p className="text-gray-500">Momentos del Candás CF captados por nuestra afición</p>
      </div>

      {fotos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📷</p>
          <p className="font-medium text-lg">Pronto habrá fotos aquí</p>
          <p className="text-sm mt-1">¡Vamos Canijo! 🔴⚪</p>
        </div>
      ) : (
        <GaleriaPublica fotos={fotos} />
      )}
    </div>
  );
}