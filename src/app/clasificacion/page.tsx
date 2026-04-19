import { createClient } from "@/lib/supabase/server";
import { calcularClasificacion, Equipo, Partido } from "@/lib/types";
import TablaClasificacion from "@/components/TablaClasificacion";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ClasificacionPage() {
  const supabase = createClient();

  const { data: equipos } = await supabase
    .from("equipos")
    .select("*")
    .order("nombre");

  const { data: partidos } = await supabase
    .from("partidos")
    .select("*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*)")
    .order("jornada", { ascending: true });

  const eqs = (equipos ?? []) as Equipo[];
  const pts = (partidos ?? []) as Partido[];

  const clasificacion = calcularClasificacion(eqs, pts);

  // Próximos partidos del Candás (sin jugar)
  const candas = eqs.find((e) => e.nombre === "Candás CF");
  const proximos = candas
    ? pts
        .filter(
          (p) =>
            !p.jugado &&
            (p.local_id === candas.id || p.visitante_id === candas.id)
        )
        .slice(0, 10)
    : [];

  // Últimos resultados del Candás
  const ultimos = candas
    ? pts
        .filter(
          (p) =>
            p.jugado &&
            (p.local_id === candas.id || p.visitante_id === candas.id)
        )
        .slice(-5)
        .reverse()
    : [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-black mb-2">Clasificación</h1>
      <p className="text-gray-600 mb-8">Segunda Asturfútbol · Grupo 1</p>

      {clasificacion.length === 0 ? (
        <EmptyState mensaje="Todavía no hay equipos cargados. Ejecuta el SQL de /supabase/schema.sql o añádelos desde el panel de admin." />
      ) : (
        <div className="bg-white rounded-xl shadow p-4 md:p-6">
          <TablaClasificacion filas={clasificacion} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mt-10">
        {/* Últimos resultados */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">🏁 Últimos resultados del Candás</h2>
          {ultimos.length === 0 ? (
            <p className="text-gray-500 text-sm">Aún sin partidos jugados.</p>
          ) : (
            <ul className="space-y-2">
              {ultimos.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between items-center border-b border-gray-100 pb-2"
                >
                  <div className="flex-1">
                    <span className="text-xs text-gray-500">J{p.jornada}</span>
                    <div className="font-medium">
                      {p.local?.nombre}{" "}
                      <span className="text-candas-rojo font-black">
                        {p.goles_local} - {p.goles_visitante}
                      </span>{" "}
                      {p.visitante?.nombre}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Próximos partidos */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold mb-4">📅 Próximos partidos del Candás</h2>
          {proximos.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay partidos pendientes cargados.</p>
          ) : (
            <ul className="space-y-2">
              {proximos.map((p) => (
                <li
                  key={p.id}
                  className="flex justify-between items-center border-b border-gray-100 pb-2"
                >
                  <div>
                    <span className="text-xs text-gray-500">J{p.jornada}</span>
                    <div className="font-medium">
                      {p.local?.nombre} <span className="text-gray-400">vs</span>{" "}
                      {p.visitante?.nombre}
                    </div>
                  </div>
                  {p.fecha && (
                    <span className="text-xs text-gray-500">
                      {new Date(p.fecha).toLocaleDateString("es-ES")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ mensaje }: { mensaje: string }) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-6 text-center">
      {mensaje}
    </div>
  );
}
