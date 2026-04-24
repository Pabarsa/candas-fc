import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "La Plantilla — Fondo Sur Canijo",
  description: "Conoce a los jugadores del Candás CF. Plantilla completa temporada 2025/26.",
};
export const dynamic = "force-dynamic";

type MiembroCT = { id: number; nombre: string; cargo: string; foto_url: string | null; orden: number; };
type Jugador = { id: number; nombre: string; dorsal: number | null; posicion: string | null; foto_url: string | null; };

const ORDEN_POSICION = ["Portero", "Defensa", "Centrocampista", "Delantero"];

const COLOR_POSICION: Record<string, string> = {
  Portero:        "bg-yellow-500/15 text-yellow-400",
  Defensa:        "bg-blue-500/15 text-blue-400",
  Centrocampista: "bg-green-500/15 text-green-400",
  Delantero:      "bg-candas-rojo/15 text-red-400",
};

export default async function EquipoPage() {
  const supabase = createClient();
  const [{ data }, { data: dataCT }] = await Promise.all([
    supabase.from("jugadores").select("id, nombre, dorsal, posicion, foto_url").eq("activo", true).order("dorsal", { ascending: true, nullsFirst: false }),
    supabase.from("cuerpo_tecnico").select("id, nombre, cargo, foto_url, orden").eq("activo", true).order("orden", { ascending: true }),
  ]);

  const jugadores = (data as Jugador[]) ?? [];
  const cuerpoTecnico = (dataCT as MiembroCT[]) ?? [];
  const grupos = ORDEN_POSICION.map((pos) => ({ posicion: pos, jugadores: jugadores.filter((j) => j.posicion === pos) })).filter((g) => g.jugadores.length > 0);
  const sinPosicion = jugadores.filter((j) => !j.posicion);

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-12">
      <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Temporada 2025/26</p>
      <h1 className="font-poppins font-black text-3xl sm:text-5xl text-white mb-2">La Plantilla</h1>
      <p className="text-white/40 mb-12">Candás CF · {jugadores.length} jugadores</p>

      {/* Cuerpo técnico */}
      {cuerpoTecnico.length > 0 && (
        <section className="mb-14">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-6">Cuerpo técnico</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {cuerpoTecnico.map((m) => (
              <div key={m.id} className="group relative overflow-hidden rounded-2xl bg-surface-2 border border-white/5 cursor-default">
                <div className="relative aspect-[3/4] overflow-hidden">
                  {m.foto_url ? (
                    <img src={m.foto_url} alt={m.nombre}
                      className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-2 to-surface-3">
                      <span className="text-4xl opacity-10">?</span>
                    </div>
                  )}
                  {/* Overlay hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {/* Info en hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                      {m.cargo}
                    </span>
                  </div>
                </div>
                {/* Info visible siempre */}
                <div className="p-3">
                  <p className="font-bold text-white text-xs leading-tight truncate">{m.nombre}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Jugadores por posición */}
      <div className="space-y-12">
        {grupos.map(({ posicion, jugadores: grupo }) => (
          <section key={posicion}>
            <div className="flex items-center gap-3 mb-6">
              <p className="text-white/30 text-xs uppercase tracking-widest">{posicion}s</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${COLOR_POSICION[posicion]}`}>
                {grupo.length}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {grupo.map((j) => <TarjetaJugador key={j.id} jugador={j} />)}
            </div>
          </section>
        ))}
        {sinPosicion.length > 0 && (
          <section>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-6">Otros</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {sinPosicion.map((j) => <TarjetaJugador key={j.id} jugador={j} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function TarjetaJugador({ jugador }: { jugador: Jugador }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-surface-2 border border-white/5 cursor-default hover:border-white/10 transition-all duration-300">
      <div className="relative aspect-[3/4] overflow-hidden">
        {jugador.foto_url ? (
          <img src={jugador.foto_url} alt={jugador.nombre}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-candas-rojo/20 to-candas-rojoOscuro/20">
            <span className="font-poppins font-black text-white/10 text-5xl">{jugador.dorsal ?? "?"}</span>
          </div>
        )}
        {/* Dorsal */}
        {jugador.dorsal && (
          <div className="absolute top-2 left-2 bg-candas-rojo text-white text-xs font-black w-7 h-7 rounded-lg flex items-center justify-center shadow-glow-red-sm z-10">
            {jugador.dorsal}
          </div>
        )}
        {/* Overlay con info al hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-10">
          {jugador.posicion && (
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${COLOR_POSICION[jugador.posicion] ?? "bg-white/10 text-white/50"}`}>
              {jugador.posicion}
            </span>
          )}
        </div>
      </div>
      {/* Info siempre visible abajo */}
      <div className="p-3">
        <p className="font-bold text-white text-xs leading-tight truncate">{jugador.nombre}</p>
      </div>
    </div>
  );
}