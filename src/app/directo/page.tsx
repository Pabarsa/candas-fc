import { createClient } from "@/lib/supabase/server";
import CuentaAtras from "@/components/CuentaAtras";

export const metadata = { title: "Directo — Fondo Sur Canijo" };
export const dynamic = "force-dynamic";
export const revalidate = 120; // Revalidar cada 2 minutos

type Retransmision = {
  id: number; titulo: string; descripcion: string | null;
  url_tiivii: string; miniatura_url: string | null;
  fecha: string | null; es_directo: boolean; activo: boolean;
};

export default async function DirectoPage() {
  const supabase = createClient();
  const { data } = await supabase.from("retransmisiones").select("*").eq("activo", true).order("fecha", { ascending: false });
  const retransmisiones = (data as Retransmision[]) ?? [];
  const directo = retransmisiones.find((r) => r.es_directo);
  const anteriores = retransmisiones.filter((r) => !r.es_directo);

  const { data: equipos } = await supabase.from("equipos").select("id, nombre");
  const candas = equipos?.find((e) => e.nombre === "Candás CF");
  let proximoPartido = null;
  if (candas) {
    const { data: partidos } = await supabase
      .from("partidos")
      .select("*, local:equipos!partidos_local_id_fkey(nombre), visitante:equipos!partidos_visitante_id_fkey(nombre)")
      .eq("jugado", false)
      .or(`local_id.eq.${candas.id},visitante_id.eq.${candas.id}`)
      .not("fecha", "is", null)
      .order("fecha", { ascending: true })
      .limit(1);
    proximoPartido = partidos?.[0] ?? null;
  }

  // Buscar partido hoy
  const hoy = new Date();
  const inicioHoy = new Date(hoy); inicioHoy.setHours(0,0,0,0);
  const finHoy    = new Date(hoy); finHoy.setHours(23,59,59,999);

  const { data: equiposDirec } = await supabase.from("equipos").select("id, nombre");
  const candasDirec = equiposDirec?.find(e => e.nombre === "Candás CF");

  let partidoHoy = null;
  if (candasDirec) {
    const { data: ph } = await supabase
      .from("partidos")
      .select("*, local:equipos!partidos_local_id_fkey(nombre), visitante:equipos!partidos_visitante_id_fkey(nombre)")
      .or(`local_id.eq.${candasDirec.id},visitante_id.eq.${candasDirec.id}`)
      .gte("fecha", inicioHoy.toISOString())
      .lte("fecha", finHoy.toISOString())
      .limit(1);
    partidoHoy = ph?.[0] ?? null;
  }

  // Buscar último resultado scrapeado
  let marcadorVivo: { golesLocal: number; golesVisitante: number; enJuego: boolean; finalizado: boolean } | null = null;
  if (partidoHoy) {
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fondosurcanijo.com";
      const res = await fetch(`${siteUrl}/api/scraper-asturfutbol?secret=${process.env.CRON_SECRET ?? ""}`, { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.enJuego !== undefined) {
          marcadorVivo = { golesLocal: json.golesLocal, golesVisitante: json.golesVisitante, enJuego: json.enJuego, finalizado: json.finalizado };
        }
      }
    } catch {}
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-12">

      {/* ─── MARCADOR EN VIVO ── */}
      {partidoHoy && (
        <div className="card-dark rounded-2xl p-6 sm:p-10 mb-10 border border-candas-rojo/30">
          <div className="flex items-center justify-center gap-2 mb-6">
            {marcadorVivo?.enJuego ? (
              <>
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-bold text-xs uppercase tracking-widest">En juego</span>
              </>
            ) : marcadorVivo?.finalizado ? (
              <span className="text-white/40 font-bold text-xs uppercase tracking-widest">Finalizado</span>
            ) : (
              <span className="text-white/40 font-bold text-xs uppercase tracking-widest">J{(partidoHoy as any).jornada} · Hoy</span>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 sm:gap-12">
            <p className="font-poppins font-black text-lg sm:text-2xl text-white text-right flex-1">
              {(partidoHoy.local as any)?.nombre}
            </p>
            <div className="text-center flex-shrink-0">
              {marcadorVivo ? (
                <p className="font-poppins font-black text-5xl sm:text-7xl text-white tabular-nums">
                  {marcadorVivo.golesLocal} <span className="text-white/20">-</span> {marcadorVivo.golesVisitante}
                </p>
              ) : (
                <div className="px-6 py-3 rounded-xl bg-white/5 border border-white/10">
                  <p className="font-poppins font-black text-white/40 text-3xl">vs</p>
                </div>
              )}
            </div>
            <p className="font-poppins font-black text-lg sm:text-2xl text-white flex-1">
              {(partidoHoy.visitante as any)?.nombre}
            </p>
          </div>
          {marcadorVivo?.enJuego && (
            <p className="text-center text-white/20 text-xs mt-6">
              Marcador actualizado automáticamente desde Asturfútbol · Se refresca cada 2 min
            </p>
          )}
        </div>
      )}

      <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Retransmisiones</p>
      <h1 className="font-poppins font-black text-3xl sm:text-5xl text-white mb-2">En Directo</h1>
      <p className="text-white/40 mb-10">Partidos del Candás CF en tiivii.tv</p>

      {/* DIRECTO */}
      <section className="mb-12">
        {directo ? (
          <div className="relative rounded-2xl overflow-hidden bg-surface-2 border border-white/5 shadow-xl">
            {directo.miniatura_url && (
              <img src={directo.miniatura_url} alt={directo.titulo} className="w-full h-64 object-cover opacity-30" />
            )}
            <div className={`${directo.miniatura_url ? "absolute inset-0" : ""} flex flex-col items-center justify-center p-12 text-center`}>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-semibold text-xs uppercase tracking-widest">En directo ahora</span>
              </div>
              <h2 className="font-poppins font-black text-2xl md:text-3xl text-white mb-2">{directo.titulo}</h2>
              {directo.descripcion && <p className="text-white/40 mb-8 text-sm">{directo.descripcion}</p>}
              <a href={directo.url_tiivii} target="_blank" rel="noopener noreferrer"
                className="btn-primary bg-candas-rojo text-white font-bold px-10 py-4 rounded-xl text-sm">
                Ver partido en directo
              </a>
              <p className="text-white/20 text-xs mt-4">Se abrirá en tiivii.tv</p>
            </div>
          </div>
        ) : (
          <div className="card-dark rounded-2xl p-12 text-center">
            <p className="text-4xl mb-4 opacity-20"></p>
            <p className="font-poppins font-bold text-white text-xl mb-1">No hay partido en directo ahora mismo</p>
            {proximoPartido ? (
              <div className="mt-5 space-y-2">
                <p className="text-white/40 text-sm">
                  Próximo: <span className="text-white">{(proximoPartido.local as any)?.nombre} vs {(proximoPartido.visitante as any)?.nombre}</span>
                </p>
                {proximoPartido.fecha && (
                  <div className="flex justify-center mt-3">
                    <div className="bg-white/5 border border-white/10 px-5 py-2 rounded-xl inline-flex items-center gap-2">
                      <CuentaAtras fecha={proximoPartido.fecha} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white/20 text-sm mt-2">Vuelve el día del partido</p>
            )}
          </div>
        )}
      </section>

      {/* GRABADOS */}
      {anteriores.length > 0 && (
        <section>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-6">Partidos grabados</p>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {anteriores.map((r) => (
              <a key={r.id} href={r.url_tiivii} target="_blank" rel="noopener noreferrer"
                className="card-dark rounded-xl overflow-hidden group hover:border-white/10 transition-all duration-200 block">
                <div className="relative aspect-video bg-surface-3 overflow-hidden">
                  {r.miniatura_url ? (
                    <img src={r.miniatura_url} alt={r.titulo} className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-70" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-3xl opacity-10"></span>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-white/10 group-hover:bg-white/20 rounded-full flex items-center justify-center transition backdrop-blur-sm">
                      <span className="text-white text-base ml-0.5">▶</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="font-bold text-sm text-white leading-tight mb-1">{r.titulo}</p>
                  {r.fecha && (
                    <p className="text-white/30 text-xs">
                      {new Date(r.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" })}
                    </p>
                  )}
                  {r.descripcion && <p className="text-white/20 text-xs mt-1 line-clamp-1">{r.descripcion}</p>}
                </div>
              </a>
            ))}
          </div>
          <p className="text-center text-white/15 text-xs mt-8">
            Videos ofrecidos por <a href="https://tiivii.tv" target="_blank" rel="noopener noreferrer" className="hover:text-white/30 transition-colors">tiivii.tv</a>
          </p>
        </section>
      )}

      {anteriores.length === 0 && !directo && (
        <p className="text-center text-white/20 text-sm">Pronto habrá partidos grabados aquí.</p>
      )}
    </div>
  );
}