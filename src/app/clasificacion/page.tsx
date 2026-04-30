import { createClient } from "@/lib/supabase/server";
import { calcularClasificacion, Equipo, Partido } from "@/lib/types";
import TablaClasificacion from "@/components/TablaClasificacion";
import Link from "next/link";

export const metadata = { title: "Clasificación — Fondo Sur Canijo" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClasificacionPage() {
  const supabase = createClient();
  const [{ data: equipos }, { data: partidos }] = await Promise.all([
    supabase.from("equipos").select("*").order("nombre"),
    supabase
      .from("partidos")
      .select("*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*)")
      .order("jornada", { ascending: true }),
  ]);

  const eqs = (equipos ?? []) as Equipo[];
  const pts = (partidos ?? []) as Partido[];
  const clasificacion = calcularClasificacion(eqs, pts);
  const candas = eqs.find((e) => e.nombre === "Candás CF");

  const proximos = candas
    ? pts.filter((p) => !p.jugado && (p.local_id === candas.id || p.visitante_id === candas.id)).slice(0, 10)
    : [];

  // Todos los jugados agrupados por jornada, más reciente primero
  const jugados = pts.filter((p) => p.jugado);
  const porJornada = jugados.reduce<Record<number, Partido[]>>((acc, p) => {
    if (!acc[p.jornada]) acc[p.jornada] = [];
    acc[p.jornada].push(p);
    return acc;
  }, {});
  const jornadasOrdenadas = Object.keys(porJornada)
    .map(Number)
    .sort((a, b) => b - a); // más reciente primero

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-12">
      <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Liga</p>
      <h1 className="font-poppins font-black text-3xl sm:text-5xl text-white mb-2">Clasificación</h1>
      <p className="text-white/40 mb-10">Segunda Asturfútbol · Grupo 1</p>

      {/* ── Tabla clasificación ── */}
      {clasificacion.length === 0 ? (
        <div className="card-dark rounded-2xl p-8 text-center text-white/30">
          Todavía no hay equipos cargados.
        </div>
      ) : (
        <div className="card-dark rounded-2xl overflow-hidden mb-10">
          <TablaClasificacion filas={clasificacion} />
        </div>
      )}

      {/* ── Próximos partidos ── */}
      {proximos.length > 0 && (
        <div className="card-dark rounded-2xl p-6 mb-10">
          <p className="text-white/30 text-xs uppercase tracking-widest mb-5">Próximos partidos del Candás CF</p>
          <ul className="space-y-3">
            {proximos.map((p) => (
              <li key={p.id} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div>
                  <span className="text-white/20 text-xs block mb-0.5">J{p.jornada}</span>
                  <div className="text-sm text-white/70">
                    {p.local?.nombre} <span className="text-white/30">vs</span> {p.visitante?.nombre}
                  </div>
                </div>
                {p.fecha && (
                  <span className="text-white/30 text-xs flex-shrink-0 ml-3">
                    {new Date(p.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", timeZone: "Europe/Madrid" })}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Todos los resultados por jornada ── */}
      {jornadasOrdenadas.length > 0 && (
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-6">Resultados</p>
          <div className="space-y-4">
            {jornadasOrdenadas.map((jornada) => (
              <div key={jornada} className="card-dark rounded-2xl overflow-hidden">
                {/* Cabecera jornada */}
                <div className="px-5 py-3 border-b border-white/5 flex items-center gap-3">
                  <span className="text-xs font-black uppercase tracking-widest text-white/30">Jornada {jornada}</span>
                </div>
                {/* Partidos */}
                <ul className="divide-y divide-white/5">
                  {porJornada[jornada].map((p) => {
                    const esLocal = candas && p.local_id === candas.id;
                    const esVisitante = candas && p.visitante_id === candas.id;
                    const esCandas = esLocal || esVisitante;
                    const ganoLocal = (p.goles_local ?? 0) > (p.goles_visitante ?? 0);
                    const ganoVisitante = (p.goles_visitante ?? 0) > (p.goles_local ?? 0);
                    const resultado = esCandas
                      ? (esLocal && ganoLocal) || (esVisitante && ganoVisitante)
                        ? "V"
                        : ganoLocal === ganoVisitante
                        ? "E"
                        : "D"
                      : null;

                    return (
                      <li key={p.id}>
                        <Link href={`/partido/${p.id}`}
                          className={`px-5 py-3 flex items-center gap-3 hover:bg-white/5 transition-colors ${esCandas ? "bg-candas-rojo/5 hover:bg-candas-rojo/10" : ""}`}>
                          <span className={`w-5 text-[10px] font-black text-center flex-shrink-0 ${
                            resultado === "V" ? "text-green-400" :
                            resultado === "E" ? "text-yellow-400" :
                            resultado === "D" ? "text-red-400" :
                            "text-transparent"
                          }`}>
                            {resultado ?? "·"}
                          </span>
                          <span className={`flex-1 text-sm text-right truncate ${esLocal ? "text-white font-bold" : "text-white/50"}`}>
                            {p.local?.nombre}
                          </span>
                          <span className="flex-shrink-0 font-black text-base tabular-nums tracking-tight text-white bg-white/5 rounded-lg px-3 py-0.5 min-w-[60px] text-center">
                            {p.goles_local} - {p.goles_visitante}
                          </span>
                          <span className={`flex-1 text-sm truncate ${esVisitante ? "text-white font-bold" : "text-white/50"}`}>
                            {p.visitante?.nombre}
                          </span>
                          {esCandas && (
                            <span className="text-white/20 text-xs flex-shrink-0">→</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}