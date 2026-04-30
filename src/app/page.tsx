import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { calcularClasificacion, Equipo, Partido } from "@/lib/types";
import CuentaAtras from "@/components/CuentaAtras";
import RevealSection from "@/components/RevealSection";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const [
    { data: equipos },
    { data: partidos },
    { data: posts },
  ] = await Promise.all([
    supabase.from("equipos").select("*").order("nombre"),
    supabase
      .from("partidos")
      .select("*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*)")
      .order("jornada", { ascending: true }),
    supabase
      .from("posts").select("id, titulo, foto_url, created_at")
      .order("created_at", { ascending: false }).limit(6),
  ]);

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
    p.goles_local != null ? `${p.goles_local} - ${p.goles_visitante}` : "vs";

  return (
    <div className="bg-site">

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/campo/foto5.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-site" />
        <div className="absolute inset-0 bg-gradient-to-r from-candas-rojo/10 via-transparent to-transparent" />

        {/* Texto hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 pb-6 pt-24 w-full">
          <div className="max-w-2xl">
            <p className="inline-block text-white/70 font-medium text-[11px] tracking-[0.15em] uppercase mb-4 select-none bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full">
              Segunda Asturfútbol · Grupo 1 · 2025/26
            </p>
            <h1 className="font-poppins font-black text-display-xl text-white mb-3 leading-none">
              Fondo Sur<br />Canijo
            </h1>
            <p className="text-white/50 text-base sm:text-lg mb-8 max-w-sm leading-relaxed">
              El corazón de la afición del Candás CF.
            </p>
            <div className="flex flex-col xs:flex-row gap-3">
              <Link href="/clasificacion"
                className="btn-primary bg-candas-rojo text-white font-semibold px-6 py-3 rounded-xl text-sm text-center">
                Ver clasificación
              </Link>
              <Link href="/fotos"
                className="text-white/70 hover:text-white font-semibold px-6 py-3 rounded-xl text-sm border border-white/10 hover:border-white/20 transition-all duration-200 text-center">
                Galería de fotos
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        {statsCandas && (
          <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 pb-10 w-full">
            <div className="flex gap-5 sm:gap-10 mt-8">
              <div>
                <p className="text-3xl sm:text-4xl font-poppins font-black text-white">{posCandas}º</p>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">Posición</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-3xl sm:text-4xl font-poppins font-black text-white">{statsCandas.pts}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">Puntos</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-3xl sm:text-4xl font-poppins font-black text-white">{statsCandas.g}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">Victorias</p>
              </div>
              <div className="w-px bg-white/10 hidden sm:block" />
              <div className="hidden sm:block">
                <p className="text-3xl sm:text-4xl font-poppins font-black text-white">{statsCandas.pj}</p>
                <p className="text-white/30 text-[10px] uppercase tracking-widest mt-0.5">Jugados</p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ─── PRÓXIMO PARTIDO ──────────────────────────────────── */}
      {proximoPartido && (
        <RevealSection>
          <section className="py-10 sm:py-14 px-5 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <p className="text-white/30 text-xs uppercase tracking-widest mb-5">
                Próximo partido · Jornada {proximoPartido.jornada}
              </p>
              <div className="card-dark rounded-2xl p-6 sm:p-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* Equipos */}
                  <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-center">
                    <p className="font-poppins font-bold text-base sm:text-xl text-white text-right flex-1 sm:flex-none">
                      {proximoPartido.local?.nombre}
                    </p>
                    <div className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl bg-white/5 border border-white/10 flex-shrink-0">
                      <span className="font-poppins font-black text-white/40 text-base">vs</span>
                    </div>
                    <p className="font-poppins font-bold text-base sm:text-xl text-white flex-1 sm:flex-none">
                      {proximoPartido.visitante?.nombre}
                    </p>
                  </div>
                  {/* Fecha */}
                  <div className="text-center sm:text-right flex-shrink-0 w-full sm:w-auto">
                    {proximoPartido.fecha ? (
                      <>
                        <p className="text-white/40 text-xs sm:text-sm mb-2">
                          {new Date(proximoPartido.fecha).toLocaleString("es-ES", {
                            weekday: "long", day: "numeric", month: "long",
                            hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid",
                          })}
                        </p>
                        <CuentaAtras fecha={proximoPartido.fecha} />
                      </>
                    ) : (
                      <p className="text-white/30 text-sm">Fecha por confirmar</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealSection>
      )}

      {/* ─── ÚLTIMOS RESULTADOS ───────────────────────────────── */}
      {ultimosResultados.length > 0 && (
        <RevealSection>
          <section className="py-4 px-5 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <p className="text-white/30 text-xs uppercase tracking-widest mb-4">Últimos resultados</p>
              <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {ultimosResultados.map((p) => {
                  const res = getResultado(p);
                  const color =
                    res === "V" ? "bg-green-500/10 border-green-500/20 text-green-400" :
                    res === "D" ? "bg-red-500/10 border-red-500/20 text-red-400" :
                    "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
                  return (
                    <div key={p.id} className="flex-shrink-0 card-dark rounded-xl p-3 sm:p-4 min-w-[110px] sm:min-w-[130px] text-center">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mb-1.5 ${color}`}>
                        {res === "V" ? "Victoria" : res === "D" ? "Derrota" : "Empate"}
                      </span>
                      <p className="font-poppins font-black text-white text-lg sm:text-xl">{marcador(p)}</p>
                      <p className="text-white/30 text-[10px] mt-0.5 truncate">vs {rival(p)}</p>
                      <p className="text-white/20 text-[10px]">J{p.jornada}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </RevealSection>
      )}

      {/* ─── CLASIFICACIÓN + FOTOS ────────────────────────────── */}
      <RevealSection>
        <section className="py-10 sm:py-14 px-5 sm:px-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Clasificación */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-white/30 text-xs uppercase tracking-widest">Clasificación</p>
                <Link href="/clasificacion" className="text-candas-rojo text-xs font-medium hover:text-white transition-colors duration-200">
                  Ver completa →
                </Link>
              </div>
              <div className="card-dark rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-3 sm:px-4 py-3 text-left text-xs text-white/20 font-medium w-8">#</th>
                      <th className="px-3 sm:px-4 py-3 text-left text-xs text-white/20 font-medium">Equipo</th>
                      <th className="px-3 sm:px-4 py-3 text-center text-xs text-white/20 font-medium">PJ</th>
                      <th className="px-3 sm:px-4 py-3 text-center text-xs text-white/20 font-medium text-candas-rojo">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clasificacion.slice(0, 8).map((fila, i) => {
                      const esCandas = fila.equipo.nombre === "Candás CF";
                      return (
                        <tr key={fila.equipo.id}
                          className={`border-b border-white/5 last:border-0 ${esCandas ? "bg-candas-rojo/[0.08]" : "hover:bg-white/[0.02]"}`}>
                          <td className="px-3 sm:px-4 py-2.5 text-white/20 text-xs">{i + 1}</td>
                          <td className="px-3 sm:px-4 py-2.5">
                            <span className={`text-xs sm:text-sm font-medium ${esCandas ? "text-white font-bold" : "text-white/60"}`}>
                              {fila.equipo.nombre}
                            </span>
                            {esCandas && <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-candas-rojo inline-block align-middle" />}
                          </td>
                          <td className="px-3 sm:px-4 py-2.5 text-center text-white/30 text-xs">{fila.pj}</td>
                          <td className="px-3 sm:px-4 py-2.5 text-center">
                            <span className={`text-xs sm:text-sm font-bold ${esCandas ? "text-white" : "text-white/60"}`}>{fila.pts}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fotos */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-white/30 text-xs uppercase tracking-widest">Últimas fotos</p>
                <Link href="/fotos" className="text-candas-rojo text-xs font-medium hover:text-white transition-colors duration-200">
                  Ver todas →
                </Link>
              </div>
              {fotos.length === 0 ? (
                <div className="card-dark rounded-2xl h-40 flex items-center justify-center">
                  <p className="text-white/20 text-sm">Pronto habrá fotos aquí</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {fotos.slice(0, 6).map((post: any, i) => (
                    <Link key={post.id} href="/fotos"
                      className={`group relative overflow-hidden rounded-xl bg-surface ${i === 0 ? "col-span-2 row-span-2" : ""} aspect-square`}>
                      <img src={post.foto_url} alt={post.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── STATS EQUIPO ─────────────────────────────────────── */}
      <RevealSection>
        <section className="py-10 sm:py-14 px-5 sm:px-6 border-y border-white/5">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-10 text-center">
              {[
                { valor: "1948",    label: "Año de fundación" },
                { valor: "Carreño", label: "Concejo" },
                { valor: "2ª",      label: "Asturfútbol" },
                { valor: "La Mata", label: "Estadio" },
              ].map((d) => (
                <div key={d.label}>
                  <p className="font-poppins font-black text-2xl sm:text-3xl text-white">{d.valor}</p>
                  <p className="text-white/30 text-xs uppercase tracking-widest mt-1">{d.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── SECCIONES ────────────────────────────────────────── */}
      <RevealSection>
        <section className="py-10 sm:py-14 px-5 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <p className="text-white/30 text-xs uppercase tracking-widest mb-5">Explorar</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { href: "/clasificacion", title: "Clasificación", desc: "Segunda Asturfútbol actualizada" },
                { href: "/fotos",         title: "Fotos",         desc: "Galería de imágenes del equipo" },
                { href: "/equipo",        title: "Plantilla",     desc: "Jugadores de la temporada" },
                { href: "/veteranos",     title: "Veteranos",     desc: "Los históricos del club" },
                { href: user ? "/simulador" : "/login", title: "Simulador", desc: "Simula el final de la liga", locked: !user },
                { href: user ? "/abonados"  : "/login", title: "Mi zona",   desc: "Chat, viajes y encuestas",  locked: !user },
              ].map((item) => (
                <Link key={item.title} href={item.href}
                  className="card-dark rounded-2xl p-4 sm:p-5 group hover:border-white/10 transition-all duration-200">
                  <p className="font-poppins font-bold text-white text-sm mb-1">{item.title}</p>
                  <p className="text-white/30 text-xs leading-relaxed">{item.desc}</p>
                  {item.locked && (
                    <span className="inline-block mt-2 text-[10px] text-white/20 border border-white/10 px-2 py-0.5 rounded-full">
                      Registro gratuito
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* ─── CTA REGISTRO ─────────────────────────────────────── */}
      {!user && (
        <RevealSection delay={100}>
          <section className="py-10 sm:py-16 px-5 sm:px-6">
            <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-candas-rojo p-8 sm:p-14">
                <div className="absolute inset-0 bg-gradient-to-br from-candas-rojo via-candas-rojo to-candas-rojoOscuro" />
                <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-white/5 rounded-full translate-x-24 -translate-y-24" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -translate-x-12 translate-y-12" />
                <div className="relative z-10 text-center max-w-lg mx-auto">
                  <h2 className="font-poppins font-black text-2xl sm:text-display-md text-white mb-3">
                    Únete a la afición
                  </h2>
                  <p className="text-white/70 mb-7 text-sm sm:text-base leading-relaxed">
                    Crea una cuenta gratis y accede al simulador, el chat, los viajes y las encuestas del mejor jugador.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/registro"
                      className="bg-white text-candas-rojo font-bold px-7 py-3.5 rounded-xl hover:bg-white/90 transition-all duration-200 text-sm">
                      Crear cuenta gratis
                    </Link>
                    <Link href="/login"
                      className="text-white/70 hover:text-white font-medium px-7 py-3.5 rounded-xl border border-white/20 hover:border-white/40 transition-all duration-200 text-sm">
                      Ya tengo cuenta
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </RevealSection>
      )}
    </div>
  );
}