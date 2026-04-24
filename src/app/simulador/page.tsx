import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Equipo, Partido } from "@/lib/types";
import Simulador from "@/components/Simulador";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SimuladorPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?redirectTo=/simulador");
  }

  const { data: equipos } = await supabase
    .from("equipos")
    .select("*")
    .order("nombre");

  const { data: partidos } = await supabase
    .from("partidos")
    .select(
      "*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*)"
    )
    .order("jornada", { ascending: true });

  const eqs = (equipos ?? []) as Equipo[];
  const pts = (partidos ?? []) as Partido[];

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-12">
      <h1 className="font-poppins font-black text-4xl text-white mb-2">Simulador</h1>
      <p className="text-white/40 mb-8">
        Marca los resultados que crees que van a pasar en las jornadas que
        quedan y mira cómo termina el Candás. Usa <strong>1 / X / 2</strong>{" "}
        para una victoria local, empate o victoria visitante, o mete un
        resultado concreto para que cuente bien en la diferencia de goles.
      </p>

      {eqs.length === 0 || pts.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-6">
          Todavía no hay partidos cargados. El admin debe añadirlos desde{" "}
          <code>/admin</code> para poder simular.
        </div>
      ) : (
        <Simulador equipos={eqs} partidos={pts} />
      )}
    </div>
  );
}