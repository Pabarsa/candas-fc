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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Próximos partidos del Candás para el selector de viajes
  const { data: equipos } = await supabase.from("equipos").select("*");
  const candas = equipos?.find((e) => e.nombre === "Candás CF");

  let proximos: Partido[] = [];
  if (candas) {
    const { data } = await supabase
      .from("partidos")
      .select("*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*)")
      .eq("jugado", false)
      .or(`local_id.eq.${candas.id},visitante_id.eq.${candas.id}`)
      .order("jornada", { ascending: true })
      .limit(10);
    proximos = (data ?? []) as Partido[];
  }

  // Historial de encuestas cerradas
  const { data: encuestasCerradas } = await supabase
    .from("encuestas")
    .select("id, titulo, created_at")
    .eq("activa", false)
    .order("created_at", { ascending: false });

  const historialEncuestas: {
    encuestaId: number;
    titulo: string;
    ganadorNombre: string;
    votos: number;
    totalVotos: number;
    fecha: string;
  }[] = [];

  if (encuestasCerradas && encuestasCerradas.length > 0) {
    const ids = encuestasCerradas.map((e) => e.id);
    const { data: votos } = await supabase
      .from("votos")
      .select("encuesta_id, jugador_id, jugadores(nombre)")
      .in("encuesta_id", ids);

    if (votos) {
      for (const enc of encuestasCerradas) {
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
        const ganador = sorted[0];
        const totalVotos = sorted.reduce((s, r) => s + r.votos, 0);

        historialEncuestas.push({
          encuestaId: enc.id,
          titulo: enc.titulo,
          ganadorNombre: ganador.nombre,
          votos: ganador.votos,
          totalVotos,
          fecha: enc.created_at,
        });
      }
    }
  }

  // Votos del usuario para el perfil
  const { data: misVotos } = await supabase
    .from("votos")
    .select("encuesta:encuestas(titulo), jugadores(nombre), created_at")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black mb-2">Zona de abonados</h1>
        <p className="text-gray-600">
          Hola <strong>{profile?.nombre || "abonado"}</strong> · ¡Vamos Canijo! 🔴⚪
        </p>
      </div>

      {/* Chat + Viajes */}
      <div className="grid lg:grid-cols-2 gap-6 mb-10">
        <ChatAbonados usuarioId={user.id} />
        <TablonViajes usuarioId={user.id} esAdmin={profile?.rol === "admin"} proximosPartidos={proximos} />
      </div>

      {/* Encuesta activa */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-2xl font-black">🗳️ Encuesta</h2>
          <span className="text-sm text-gray-500 font-normal">Vota al mejor jugador</span>
        </div>
        <div className="bg-white rounded-xl shadow p-6 max-w-xl">
          <EncuestaAbonados usuarioId={user.id} />
        </div>
      </section>

      {/* Historial encuestas */}
      <HistorialEncuestas historial={historialEncuestas} />

      {/* Galería */}
      <section className="mb-10">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-2xl font-black">📸 Galería</h2>
          <span className="text-sm text-gray-500 font-normal">Fotos exclusivas para abonados</span>
        </div>
        <GaleriaAbonados />
      </section>

      {/* Perfil */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-2xl font-black">👤 Tu perfil</h2>
        </div>
        <PerfilAbonado
          perfil={{
            nombre: profile?.nombre ?? null,
            carnet: profile?.carnet ?? null,
            rol: profile?.rol ?? "abonado",
          }}
          email={user.email ?? ""}
          usuarioId={user.id}
          votos={(misVotos ?? []) as any}
        />
      </section>
    </div>
  );
}