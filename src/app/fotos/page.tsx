import { createClient } from "@/lib/supabase/server";
import FotosCliente from "@/components/FotosCliente";

export const metadata = {
  title: "Fotos — Fondo Sur Canijo",
  description: "Galería de fotos del Candás CF. Imágenes de partidos, afición y momentos del club de Candás, Carreño, Asturias.",
  openGraph: {
    title: "Fotos del Candás CF — Fondo Sur Canijo",
    description: "Galería de fotos del Candás CF. Partidos, afición y momentos del club.",
    url: "https://fondosurcanijo.com/fotos",
  },
};
export const dynamic = "force-dynamic";

type Post = {
  id: number;
  titulo: string;
  descripcion: string | null;
  foto_url: string;
  instagram_fotografa: string | null;
  tipo: "previa" | "partido" | "aficion" | "general";
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
    <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-12">
      <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Galería</p>
      <h1 className="font-poppins font-black text-3xl sm:text-5xl text-white mb-2">Fotos</h1>
      <p className="text-white/40 mb-8">Momentos del Candás CF captados por la afición</p>
      <FotosCliente fotos={fotos} />
    </div>
  );
}