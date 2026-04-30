import { createClient } from "@/lib/supabase/server";
import { calcularClasificacion, Equipo, Partido } from "@/lib/types";
import TablaClasificacion from "@/components/TablaClasificacion";
import ResultadosJornada from "@/components/ResultadosJornada";

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

      {/* ── Resultados con navegación por jornada ── */}
      <ResultadosJornada partidos={pts} candasId={candas?.id} />
    </div>
  );
}