export const revalidate = 3600;
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Veteranos — Fondo Sur Canijo",
  description: "Conoce a los jugadores veteranos del Candás CF.",
};
export const dynamic = "force-dynamic";

type Veterano = {
  id: number;
  nombre: string;
  dorsal: number | null;
  posicion: string | null;
  foto_url: string | null;
};

export default async function VeteranosPage() {
  const supabase = createClient();
  const { data } = await supabase
    .from("veteranos")
    .select("id, nombre, dorsal, posicion, foto_url")
    .eq("activo", true)
    .order("dorsal", { ascending: true, nullsFirst: false });

  const veteranos = (data as Veterano[]) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-12">
      <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Candás CF</p>
      <h1 className="font-poppins font-black text-3xl sm:text-5xl text-white mb-2">Veteranos</h1>
      <p className="text-white/40 mb-12">{veteranos.length} jugadores</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {veteranos.map((v) => (
          <TarjetaVeterano key={v.id} veterano={v} />
        ))}
      </div>
    </div>
  );
}

function TarjetaVeterano({ veterano }: { veterano: Veterano }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-surface-2 border border-white/5 cursor-default hover:border-white/10 transition-all duration-300">
      <div className="relative aspect-square overflow-hidden">
        {veterano.foto_url ? (
          <img
            src={veterano.foto_url}
            alt={veterano.nombre}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-candas-rojo/20 to-candas-rojoOscuro/20">
            <span className="font-poppins font-black text-white/10 text-5xl">
              {veterano.dorsal ?? "?"}
            </span>
          </div>
        )}
        {/* Dorsal */}
        {veterano.dorsal && (
          <div className="absolute top-2 left-2 bg-candas-rojo text-white text-xs font-black w-7 h-7 rounded-lg flex items-center justify-center shadow-glow-red-sm z-10">
            {veterano.dorsal}
          </div>
        )}
        {/* Overlay hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          {veterano.posicion && (
            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/60">
              {veterano.posicion}
            </span>
          )}
        </div>
      </div>
      <div className="p-3">
        <p className="font-bold text-white text-xs leading-tight truncate">{veterano.nombre}</p>
      </div>
    </div>
  );
}