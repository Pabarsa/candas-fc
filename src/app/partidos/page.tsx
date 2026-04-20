import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import GaleriaPublica from "@/components/GaleriaPublica";

export const dynamic = "force-dynamic";

type Post = {
  id: number;
  titulo: string;
  descripcion: string | null;
  foto_url: string;
  instagram_fotografa: string | null;
  created_at: string;
  partido_id: number | null;
};

export default async function PartidoPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const id = parseInt(params.id);
  if (isNaN(id)) notFound();

  const { data: partido } = await supabase
    .from("partidos")
    .select(
      "*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*)"
    )
    .eq("id", id)
    .single();

  if (!partido) notFound();

  const { data: fotos } = await supabase
    .from("posts")
    .select("*")
    .eq("partido_id", id)
    .order("created_at", { ascending: false });

  const fotosPartido = (fotos as Post[]) ?? [];

  const esLocal = partido.local?.nombre === "Candás CF";
  const gF = esLocal ? partido.goles_local : partido.goles_visitante;
  const gC = esLocal ? partido.goles_visitante : partido.goles_local;
  const rival = esLocal ? partido.visitante?.nombre : partido.local?.nombre;

  let resultado: "V" | "E" | "D" | null = null;
  if (partido.jugado && gF != null && gC != null) {
    resultado = gF > gC ? "V" : gF < gC ? "D" : "E";
  }

  const colorResultado =
    resultado === "V"
      ? "bg-green-500"
      : resultado === "D"
      ? "bg-red-500"
      : "bg-yellow-400";

  const textoResultado =
    resultado === "V" ? "Victoria" : resultado === "D" ? "Derrota" : "Empate";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-candas-rojo text-sm font-semibold hover:underline"
        >
          ← Volver al inicio
        </Link>
      </div>

      {/* Cabecera partido */}
      <div className="bg-gradient-to-br from-candas-rojo to-candas-rojoOscuro text-white rounded-2xl p-6 mb-8 shadow-lg">
        <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-4">
          Jornada {partido.jornada}
          {partido.fecha &&
            " · " +
              new Date(partido.fecha).toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Europe/Madrid",
              })}
        </p>

        <div className="flex items-center justify-center gap-6 text-center">
          <p className="text-lg font-black flex-1">{partido.local?.nombre}</p>

          {partido.jugado && partido.goles_local != null ? (
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black tabular-nums">
                {partido.goles_local} - {partido.goles_visitante}
              </span>
              {resultado && (
                <span
                  className={`mt-2 ${colorResultado} text-xs font-black px-3 py-1 rounded-full ${
                    resultado === "E" ? "text-gray-900" : "text-white"
                  }`}
                >
                  {textoResultado}
                </span>
              )}
            </div>
          ) : (
            <span className="text-3xl font-black text-white/40">VS</span>
          )}

          <p className="text-lg font-black flex-1">{partido.visitante?.nombre}</p>
        </div>
      </div>

      {/* Fotos del partido */}
      {fotosPartido.length > 0 ? (
        <section>
          <div className="flex items-center gap-3 mb-5">
            <h2 className="text-2xl font-black">📸 Fotos del partido</h2>
          </div>
          <GaleriaPublica fotos={fotosPartido} titulo={true} />
        </section>
      ) : (
        <div className="text-center py-16 text-gray-400 bg-gray-50 rounded-2xl">
          <p className="text-4xl mb-3">📷</p>
          <p className="font-medium">Aún no hay fotos de este partido</p>
          <p className="text-sm mt-1">Se irán subiendo pronto</p>
        </div>
      )}
    </div>
  );
}