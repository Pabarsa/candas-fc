import { createClient } from "@/lib/supabase/server";
import { Equipo, Partido } from "@/lib/types";
import AdminPanel from "@/components/AdminPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const supabase = createClient();

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl md:text-4xl font-black mb-2">Panel de admin</h1>
      <p className="text-gray-600 mb-8">
        Desde aquí metes los resultados de los partidos, creas jornadas nuevas y
        gestionas los equipos de la liga.
      </p>

      <AdminPanel
        equipos={(equipos ?? []) as Equipo[]}
        partidos={(partidos ?? []) as Partido[]}
      />
    </div>
  );
}
