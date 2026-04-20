import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { calcularClasificacion, Equipo, Partido } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: equipos } = await supabase.from("equipos").select("*").order("nombre");
  const { data: partidos } = await supabase
    .from("partidos")
    .select("*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*)")
    .order("jornada", { ascending: true });
  const { data: posts } = await supabase
    .from("posts")
    .select("id, titulo, foto_url, created_at")
    .order("created_at", { ascending: false })
    .limit(4);

  const eqs = (equipos ?? []) as Equipo[];
  const pts = (partidos ?? []) as Partido[];
  const fotos = posts ?? [];
  const clasificacion = calcularClasificacion(eqs, pts);
  const candas = eqs.find((e) => e.nombre === "Candás CF");
  const posCandas = clasificacion.findIndex((f) => f.equipo.nombre === "Candás CF") + 1;
  const statsCandas = clasificacion.find((f) => f.equipo.nombre === "Candás CF");

  const proximoPartido = candas
    ? pts.find((p) => !p.jugado && (p.local_id === candas.id || p.visitante_id === candas.id))
    : null;

  const ultimosResultados = candas
    ? pts.filter((p) => p.jugado && (p.local_id === candas.id || p.visitante_id === candas.id))
        .slice(-5).reverse()
    : [];

  const getResultado = (p: Partido) => {
    if (!candas || p.goles_local == null) return "?";
    const esLocal = p.local_id === candas.id;
    const gF = esLocal ? p.goles_local : p.goles_visitante!;
    const gC = esLocal ? p.goles_visitante! : p.goles_local;
    if (gF > gC) return "V";
    if (gF < gC) return "D";
    return "E";
  };

  const rival = (p: Partido) =>
    candas ? (p.local_id === candas.id ? p.visitante?.nombre ?? "" : p.local?.nombre ?? "") : "";

  const marcador = (p: Partido) =>
    p.goles_local != null ? `${p.goles_local} - ${p.goles_visitante}` : "- - -";

  return (
    <div>
      {/* HERO */}
      <section className="bg-gradient-to-br from-candas-rojo to-candas-rojoOscuro text-white">
        <div className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="text-center md:text-left flex-1">
              <div className="flex justify-center md:justify-start mb-5">
                <Image src="/630.png" alt="Fondo Sur Canijo" width={90} height={90} priority className="drop-shadow-xl" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black mb-2 leading-tight">Fondo Sur Canijo</h1>
              <p className="text-white/80 text-lg mb-1">Web de aficionados del Candás CF</p>
              <p className="text-white/60 text-sm mb-6">Segunda Asturfútbol · Grupo 1 · Temporada 2025/26</p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <Link href="/clasificacion" className="bg-white text-candas-rojo font-bold px-5 py-2.5 rounded-xl hover:bg-candas-crema transition text-sm">
                  📊 Clasificación
                </Link>
                <Link href="/fotos" className="bg-white/15 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/25 transition text-sm border border-white/30">
                  📸 Fotos
                </Link>
                {!user && (
                  <Link href="/registro" className="bg-candas-negro text-white font-bold px-5 py-2.5 rounded-xl hover:bg-black transition text-sm">
                    Hazte abonado
                  </Link>
                )}
              </div>
            </div>
            {statsCandas && (
              <div className="bg-white/10 border border-white/20 rounded-2xl p-6 text-center min-w-[200px]">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">Posición actual</p>
                <p className="text-6xl font-black mb-1">{posCandas}º</p>
                <p className="text-white/80 font-bold text-lg mb-4">{statsCandas.pts} pts</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {([["G", statsCandas.g], ["E", statsCandas.e], ["D", statsCandas.p]] as [string, number][]).map(([label, val]) => (
                    <div key={label} className="bg-white/10 rounded-lg py-1.5">
                      <p className="font-black text-lg">{val}</p>
                      <p className="text-white/60">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PRÓXIMO PARTIDO */}
      {proximoPartido && (
        <section className="bg-candas-negro text-white">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">
                🗓️ Próximo partido · Jornada {proximoPartido.jornada}
              </p>
              <div className="flex items-center gap-4 text-center">
                <p className="font-bold text-sm">{proximoPartido.local?.nombre}</p>
                <span className="bg-white/10 px-4 py-1.5 rounded-lg font-black text-lg">VS</span>
                <p className="font-bold text-sm">{proximoPartido.visitante?.nombre}</p>
              </div>
              {proximoPartido.fecha ? (
                <p className="text-white/60 text-xs">
                  {new Date(proximoPartido.fecha).toLocaleDateString("es-ES", {
                    weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit",
                  })}
                </p>
              ) : (
                <p className="text-white/40 text-xs">Fecha por confirmar</p>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* ÚLTIMOS RESULTADOS */}
        {ultimosResultados.length > 0 && (
          <section>
            <h2 className="text-xl font-black mb-4">Últimos resultados del Candás</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {ultimosResultados.map((p) => {
                const res = getResultado(p);
                const color = res === "V" ? "bg-green-500" : res === "D" ? "bg-red-500" : "bg-yellow-400";
                const textColor = res === "E" ? "text-gray-900" : "text-white";
                return (
                  <div key={p.id} className="flex-shrink-0 bg-white rounded-xl shadow p-4 min-w-[140px] text-center border border-gray-100">
                    <span className={`inline-block ${color} ${textColor} font-black text-xs px-3 py-0.5 rounded-full mb-2`}>
                      {res === "V" ? "Victoria" : res === "D" ? "Derrota" : "Empate"}
                    </span>
                    <p className="font-black text-xl mb-1">{marcador(p)}</p>
                    <p className="text-xs text-gray-500 truncate">vs {rival(p)}</p>
                    <p className="text-xs text-gray-400 mt-1">J{p.jornada}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CLASIFICACIÓN + FOTOS */}
        <div className="grid lg:grid-cols-2 gap-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black">Clasificación</h2>
              <Link href="/clasificacion" className="text-candas-rojo text-sm font-bold hover:underline">Ver completa →</Link>
            </div>
            <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-3 py-2 text-left w-7">#</th>
                    <th className="px-3 py-2 text-left">Equipo</th>
                    <th className="px-3 py-2 text-center">PJ</th>
                    <th className="px-3 py-2 text-center font-black text-candas-rojo">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {clasificacion.slice(0, 8).map((fila, i) => {
                    const esCandas = fila.equipo.nombre === "Candás CF";
                    const border = i === 0 ? "border-l-4 border-green-500" : i < 5 ? "border-l-4 border-blue-400" : "";
                    return (
                      <tr key={fila.equipo.id} className={`border-t border-gray-50 ${esCandas ? "bg-red-50" : "hover:bg-gray-50"} ${border}`}>
                        <td className="px-3 py-2 text-gray-400 text-xs">{i + 1}</td>
                        <td className="px-3 py-2">
                          <span className={esCandas ? "text-candas-rojo font-black" : ""}>{fila.equipo.nombre}</span>
                          {esCandas && <span className="ml-1 text-xs">⚽</span>}
                        </td>
                        <td className="px-3 py-2 text-center text-gray-500">{fila.pj}</td>
                        <td className="px-3 py-2 text-center font-black">{fila.pts}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="px-3 py-2 bg-gray-50 flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>Ascenso</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>Play-off</span>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black">📸 Últimas fotos</h2>
              <Link href="/fotos" className="text-candas-rojo text-sm font-bold hover:underline">Ver todas →</Link>
            </div>
            {fotos.length === 0 ? (
              <div className="bg-white rounded-xl shadow border border-gray-100 h-48 flex flex-col items-center justify-center text-gray-400">
                <p className="text-3xl mb-2">📷</p>
                <p className="text-sm">Pronto habrá fotos aquí</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {fotos.map((post: any) => (
                  <Link key={post.id} href="/fotos" className="group relative rounded-xl overflow-hidden shadow aspect-square bg-gray-100 block">
                    <img src={post.foto_url} alt={post.titulo} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                      <p className="text-white text-xs font-bold leading-tight">{post.titulo}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* SECCIONES */}
        <section>
          <h2 className="text-xl font-black mb-4">Todo lo que puedes hacer aquí</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { href: "/clasificacion", icon: "📊", title: "Clasificación", desc: "Segunda Asturfútbol Grupo 1 actualizada", libre: true },
              { href: "/fotos", icon: "📸", title: "Fotos", desc: "Galería de imágenes de los partidos", libre: true },
              { href: user ? "/simulador" : "/login", icon: "🔮", title: "Simulador", desc: "Simula cómo puede terminar la liga", libre: false },
              { href: user ? "/abonados" : "/login", icon: "🚗", title: "Abonados", desc: "Chat y viajes compartidos al campo", libre: false },
            ].map((item) => (
              <Link key={item.title} href={item.href}
                className="bg-white rounded-xl p-5 shadow hover:shadow-lg hover:-translate-y-0.5 transition border border-gray-100 block">
                <p className="text-2xl mb-2">{item.icon}</p>
                <p className="font-black mb-1">{item.title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
                {!item.libre && !user && (
                  <span className="inline-block mt-2 text-xs text-candas-rojo bg-red-50 px-2 py-0.5 rounded-full font-semibold">🔒 Solo abonados</span>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* CTA REGISTRO */}
        {!user && (
          <section className="bg-gradient-to-br from-candas-rojo to-candas-rojoOscuro rounded-2xl p-8 text-white text-center">
            <p className="text-2xl font-black mb-2">¿Aún no eres abonado?</p>
            <p className="text-white/80 mb-5 text-sm">Regístrate gratis y accede al simulador, el chat, los viajes y la galería completa.</p>
            <Link href="/registro" className="bg-white text-candas-rojo font-black px-8 py-3 rounded-xl hover:bg-candas-crema transition inline-block">
              Crear cuenta gratis
            </Link>
          </section>
        )}
      </div>

      {/* PIE */}
      <section className="bg-candas-crema mt-10">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-black mb-3">Desde 1948 · ¡Vamos Canijo! 🔴⚪</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            El Candás CF se fundó en 1948 y juega sus partidos en el campo de <strong>La Mata</strong>.
            Esta web es una iniciativa de la afición, sin ánimo de lucro, para seguir de cerca la temporada del equipo rojiblanco.
          </p>
        </div>
      </section>
    </div>
  );
}