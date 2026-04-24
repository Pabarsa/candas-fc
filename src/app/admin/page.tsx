import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Equipo, Partido } from "@/lib/types";
import AdminPanel from "@/components/AdminPanel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/admin");

  const { data: perfil } = await supabase
    .from("profiles")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (perfil?.rol !== "admin") redirect("/");

  const [
    { data: equipos },
    { data: partidos },
    { count: totalAbonados },
    { count: totalFotos },
    { data: encuestaActiva },
  ] = await Promise.all([
    supabase.from("equipos").select("*").order("nombre"),
    supabase.from("partidos").select("*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*)").order("jornada", { ascending: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("encuestas").select("id, titulo").eq("activa", true).limit(1),
  ]);

  const pts = (partidos ?? []) as Partido[];
  const partidosJugados = pts.filter(p => p.jugado).length;

  // Votos encuesta activa
  let votosEncuesta = 0;
  if (encuestaActiva && encuestaActiva.length > 0) {
    const { count } = await supabase
      .from("votos")
      .select("*", { count: "exact", head: true })
      .eq("encuesta_id", encuestaActiva[0].id);
    votosEncuesta = count ?? 0;
  }

  const stats = [
    { label: "Abonados", valor: totalAbonados ?? 0, icon: "" },
    { label: "Partidos jugados", valor: partidosJugados, icon: "⚽" },
    { label: "Fotos subidas", valor: totalFotos ?? 0, icon: "📸" },
    {
      label: encuestaActiva && encuestaActiva.length > 0
        ? `Votos · ${encuestaActiva[0].titulo}`
        : "Sin encuesta activa",
      valor: votosEncuesta,
      icon: "",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-12">
      <h1 className="font-poppins font-black text-2xl sm:text-4xl text-white mb-2">Panel de admin</h1>
      <p className="text-white/40 mb-6">
        Desde aquí metes los resultados, gestionas la plantilla, la galería y las encuestas.
      </p>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card-dark rounded-xl p-4">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-3xl font-poppins font-black text-candas-rojo">{s.valor}</p>
            <p className="text-xs text-white/30 mt-1 leading-tight truncate">{s.label}</p>
          </div>
        ))}
      </div>

      <AdminPanel
        equipos={(equipos ?? []) as Equipo[]}
        partidos={pts}
      />
    </div>
  );
}