import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Partido } from "@/lib/types";
import ChatAbonados from "@/components/ChatAbonados";
import TablonViajes from "@/components/TablonViajes";
import GaleriaAbonados from "@/components/GaleriaAbonados";
import EncuestaAbonados from "@/components/EncuestaAbonados";
import HistorialEncuestas from "@/components/HistorialEncuestas";
import PerfilAbonado from "@/components/PerfilAbonado";

export const dynamic = "force-dynamic";

export default async function AbonadosPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/abonados");

  // ── RONDA 1: todo lo que no depende de nada ──────────────────
  const [
    { data: profile },
    { data: candasEq },
    { data: encuestasCerradas },
    { data: misVotos },
    { data: fotosAbonados },
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("equipos").select("id").eq("nombre", "Candás CF").single(),
    supabase.from("encuestas").select("id, titulo, created_at").eq("activa", false).order("created_at", { ascending: false }),
    supabase.from("votos").select("encuesta:encuestas(titulo), jugadores(nombre), created_at").eq("usuario_id", user.id).order("created_at", { ascending: false }),
    supabase.from("posts").select("*").order("created_at", { ascending: false }),
  ]);

  // ── RONDA 2: lo que depende de ronda 1 ───────────────────────
  const encIds = (encuestasCerradas ?? []).map((e) => e.id);
  const candasId = candasEq?.id;

  const [proximosResult, votosHistorialResult] = await Promise.all([
    candasId
      ? supabase
          .from("partidos")
          .select("*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*)")
          .eq("jugado", false)
          .or(`local_id.eq.${candasId},visitante_id.eq.${candasId}`)
          .order("jornada", { ascending: true })
          .limit(10)
      : Promise.resolve({ data: [] }),
    encIds.length > 0
      ? supabase.from("votos").select("encuesta_id, jugador_id, jugadores(nombre)").in("encuesta_id", encIds)
      : Promise.resolve({ data: [] }),
  ]);

  const proximos = (proximosResult.data ?? []) as Partido[];
  const votos = (votosHistorialResult.data ?? []) as any[];

  // ── Calcular historial ────────────────────────────────────────
  const historialEncuestas: {
    encuestaId: number; titulo: string; ganadorNombre: string;
    votos: number; totalVotos: number; fecha: string;
  }[] = [];

  for (const enc of encuestasCerradas ?? []) {
    const votosEnc = votos.filter((v) => v.encuesta_id === enc.id);
    if (votosEnc.length === 0) continue;
    const conteo = new Map<number, { nombre: string; votos: number }>();
    votosEnc.forEach((v: any) => {
      const id = v.jugador_id;
      const nombre = v.jugadores?.nombre ?? "Desconocido";
      if (!conteo.has(id)) conteo.set(id, { nombre, votos: 0 });
      conteo.get(id)!.votos++;
    });
    const sorted = Array.from(conteo.values()).sort((a, b) => b.votos - a.votos);
    historialEncuestas.push({
      encuestaId: enc.id, titulo: enc.titulo,
      ganadorNombre: sorted[0].nombre, votos: sorted[0].votos,
      totalVotos: sorted.reduce((s, r) => s + r.votos, 0), fecha: enc.created_at,
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-12">
      <div className="mb-8">
        <h1 className="font-poppins font-black text-3xl sm:text-5xl text-white mb-2">Mi zona</h1>
        <p className="text-white/40">
          Hola <strong className="text-white/70">{profile?.nombre || "abonado"}</strong>
        </p>
      </div>

      {/* Chat + Viajes */}
      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <ChatAbonados usuarioId={user.id} />
        <TablonViajes usuarioId={user.id} esAdmin={profile?.rol === "admin"} proximosPartidos={proximos} />
      </div>

      {/* Encuesta */}
      <section className="mb-10">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-5">Encuesta</p>
        <div className="card-dark rounded-2xl p-6 max-w-xl">
          <EncuestaAbonados usuarioId={user.id} />
        </div>
      </section>

      {/* Historial */}
      <HistorialEncuestas historial={historialEncuestas} />

      {/* Galería — pasamos fotos desde servidor */}
      <section className="mb-10">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-5">Galería</p>
        <GaleriaAbonados fotosIniciales={fotosAbonados ?? []} />
      </section>

      {/* Perfil */}
      <section>
        <p className="text-white/30 text-xs uppercase tracking-widest mb-5">Tu perfil</p>
        <PerfilAbonado
          perfil={{ nombre: profile?.nombre ?? null, carnet: profile?.carnet ?? null, rol: profile?.rol ?? "abonado" }}
          email={user.email ?? ""}
          usuarioId={user.id}
          votos={(misVotos ?? []) as any}
        />
      </section>
    </div>
  );
}