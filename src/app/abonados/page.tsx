import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Partido } from "@/lib/types";
import ChatAbonados from "@/components/ChatAbonados";
import TablonViajes from "@/components/TablonViajes";

export const dynamic = "force-dynamic";

export default async function AbonadosPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
      .select(
        "*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*)"
      )
      .eq("jugado", false)
      .or(`local_id.eq.${candas.id},visitante_id.eq.${candas.id}`)
      .order("jornada", { ascending: true })
      .limit(10);
    proximos = (data ?? []) as Partido[];
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black mb-2">Zona de abonados</h1>
        <p className="text-gray-600">
          Hola <strong>{profile?.nombre || "abonado"}</strong> · ¡Vamos Canijo! 🔴⚪
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <ChatAbonados usuarioId={user.id} />
        <TablonViajes usuarioId={user.id} proximosPartidos={proximos} />
      </div>
    </div>
  );
}
