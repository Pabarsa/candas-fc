import { createClient } from "@/lib/supabase/server";
import GaleriaPublica from "@/components/GaleriaPublica";

export const metadata = { title: "Fotos — Fondo Sur Canijo" };
export const dynamic = "force-dynamic";

type Post = { id: number; titulo: string; descripcion: string | null; foto_url: string; instagram_fotografa: string | null; created_at: string; };

export default async function FotosPage() {
  const supabase = createClient();
  const { data: posts } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
  const fotos = (posts as Post[]) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-12">
      <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Galería</p>
      <h1 className="font-poppins font-black text-3xl sm:text-5xl text-white mb-2">Fotos</h1>
      <p className="text-white/40 mb-10">Momentos del Candás CF captados por la afición</p>

      {fotos.length === 0 ? (
        <div className="card-dark rounded-2xl h-64 flex flex-col items-center justify-center">
          <p className="text-white/20 text-sm">Pronto habrá fotos aquí</p>
        </div>
      ) : (
        <GaleriaPublica fotos={fotos} titulo={true} />
      )}
    </div>
  );
}