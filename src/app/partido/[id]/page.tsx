import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import GaleriaPublica from "@/components/GaleriaPublica";
import EncuestaPartido from "@/components/EncuestaPartido";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data: p } = await supabase
    .from("partidos")
    .select("*, local:equipos!partidos_local_id_fkey(nombre), visitante:equipos!partidos_visitante_id_fkey(nombre)")
    .eq("id", parseInt(params.id))
    .single();
  if (!p) return { title: "Partido — Fondo Sur Canijo" };
  const titulo = p.jugado
    ? `${p.local.nombre} ${p.goles_local}-${p.goles_visitante} ${p.visitante.nombre}`
    : `${p.local.nombre} vs ${p.visitante.nombre}`;
  return { title: `J${p.jornada} · ${titulo} — Fondo Sur Canijo` };
}

export default async function PartidoPage({ params }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: partido }, { data: fotos }, { data: encuesta }] = await Promise.all([
    supabase
      .from("partidos")
      .select("*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*)")
      .eq("id", parseInt(params.id))
      .single(),
    supabase
      .from("posts")
      .select("id, titulo, descripcion, foto_url, instagram_fotografa, tipo, created_at")
      .eq("partido_id", parseInt(params.id))
      .order("created_at", { ascending: false }),
    supabase
      .from("encuestas")
      .select("id, titulo, activa")
      .eq("partido_id", parseInt(params.id))
      .single(),
  ]);

  if (!partido) notFound();

  const local = partido.local;
  const visitante = partido.visitante;
  const jugado = partido.jugado;
  const candas = local?.nombre === "Candás CF" || visitante?.nombre === "Candás CF";
  const candasEsLocal = local?.nombre === "Candás CF";
  const gF = jugado ? (candasEsLocal ? partido.goles_local : partido.goles_visitante) : null;
  const gC = jugado ? (candasEsLocal ? partido.goles_visitante : partido.goles_local) : null;
  const resultado = gF != null && gC != null
    ? gF > gC ? "V" : gF < gC ? "D" : "E"
    : null;

  const coloresResultado = {
    V: "text-green-400",
    D: "text-red-400",
    E: "text-yellow-400",
  };

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-white/30 text-xs mb-6">
        <Link href="/clasificacion" className="hover:text-white transition">Clasificación</Link>
        <span>/</span>
        <span>Jornada {partido.jornada}</span>
      </div>

      {/* Cabecera partido */}
      <div className="card-dark rounded-2xl p-6 sm:p-10 mb-8">
        <p className="text-white/30 text-xs uppercase tracking-widest text-center mb-6">
          J{partido.jornada} · Segunda Asturfútbol · Grupo 1
        </p>

        <div className="flex items-center justify-center gap-4 sm:gap-10">
          {/* Local */}
          <div className="flex-1 text-right">
            <p className={`font-poppins font-black text-lg sm:text-2xl ${local?.nombre === "Candás CF" ? "text-white" : "text-white/60"}`}>
              {local?.nombre}
            </p>
          </div>

          {/* Marcador */}
          <div className="flex-shrink-0 text-center">
            {jugado ? (
              <div>
                <p className="font-poppins font-black text-4xl sm:text-6xl text-white tabular-nums">
                  {partido.goles_local} <span className="text-white/20">-</span> {partido.goles_visitante}
                </p>
                {candas && resultado && (
                  <p className={`text-xs font-bold mt-2 uppercase tracking-widest ${coloresResultado[resultado]}`}>
                    {resultado === "V" ? "Victoria" : resultado === "D" ? "Derrota" : "Empate"}
                  </p>
                )}
              </div>
            ) : (
              <div className="px-5 py-3 rounded-xl bg-white/5 border border-white/10">
                <p className="font-poppins font-black text-white/40 text-2xl">vs</p>
              </div>
            )}
          </div>

          {/* Visitante */}
          <div className="flex-1 text-left">
            <p className={`font-poppins font-black text-lg sm:text-2xl ${visitante?.nombre === "Candás CF" ? "text-white" : "text-white/60"}`}>
              {visitante?.nombre}
            </p>
          </div>
        </div>

        {partido.fecha && (
          <p className="text-center text-white/30 text-xs mt-6">
            {new Date(partido.fecha).toLocaleDateString("es-ES", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
              timeZone: "Europe/Madrid"
            })}
          </p>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Fotos — 2/3 */}
        <div className="lg:col-span-2">
          {fotos && fotos.length > 0 ? (
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-5">
                Fotos del partido · {fotos.length}
              </p>
              <GaleriaPublica fotos={fotos as any} />
            </div>
          ) : (
            <div className="card-dark rounded-2xl p-8 text-center">
              <p className="text-4xl mb-3">📷</p>
              <p className="text-white/30 text-sm">Aún no hay fotos de este partido</p>
            </div>
          )}
        </div>

        {/* Encuesta — 1/3 */}
        <div>
          {encuesta ? (
            <div className="card-dark rounded-2xl p-5">
              <p className="text-white/30 text-xs uppercase tracking-widest mb-4">Mejor jugador</p>
              <EncuestaPartido
                encuestaId={encuesta.id}
                titulo={encuesta.titulo}
                activa={encuesta.activa}
                usuarioId={user?.id ?? null}
              />
            </div>
          ) : jugado ? (
            <div className="card-dark rounded-2xl p-6 text-center">
              <p className="text-3xl mb-3">🗳️</p>
              <p className="text-white/40 text-sm">La encuesta del mejor jugador aún no está disponible</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}