import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import CuentaAtras from "@/components/CuentaAtras";

export const metadata = {
  title: "En Directo — Fondo Sur Canijo",
  description: "Sigue los partidos del Candás CF en directo y ve las grabaciones anteriores.",
};

export const dynamic = "force-dynamic";

type Retransmision = {
  id: number;
  titulo: string;
  descripcion: string | null;
  url_tiivii: string;
  miniatura_url: string | null;
  fecha: string | null;
  es_directo: boolean;
  activo: boolean;
};

export default async function DirectoPage() {
  const supabase = createClient();

  const { data } = await supabase
    .from("retransmisiones")
    .select("*")
    .eq("activo", true)
    .order("fecha", { ascending: false });

  const retransmisiones = (data as Retransmision[]) ?? [];
  const directo = retransmisiones.find((r) => r.es_directo);
  const anteriores = retransmisiones.filter((r) => !r.es_directo);

  // Próximo partido del Candás para la cuenta atrás
  const { data: equipos } = await supabase.from("equipos").select("id, nombre");
  const candas = equipos?.find((e) => e.nombre === "Candás CF");
  let proximoPartido = null;
  if (candas) {
    const { data: partidos } = await supabase
      .from("partidos")
      .select("*, local:equipos!partidos_local_id_fkey(nombre), visitante:equipos!partidos_visitante_id_fkey(nombre)")
      .eq("jugado", false)
      .or(`local_id.eq.${candas.id},visitante_id.eq.${candas.id}`)
      .not("fecha", "is", null)
      .order("fecha", { ascending: true })
      .limit(1);
    proximoPartido = partidos?.[0] ?? null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black mb-1">📺 En Directo</h1>
        <p className="text-gray-500">Partidos del Candás CF en tiivii.tv</p>
      </div>

      {/* DIRECTO */}
      <section className="mb-12">
        {directo ? (
          <div className="relative rounded-2xl overflow-hidden bg-candas-negro text-white shadow-xl">
            {/* Miniatura si hay */}
            {directo.miniatura_url && (
              <img
                src={directo.miniatura_url}
                alt={directo.titulo}
                className="w-full h-64 object-cover opacity-40"
              />
            )}
            <div className={`${directo.miniatura_url ? "absolute inset-0" : ""} flex flex-col items-center justify-center p-10 text-center`}>
              {/* Indicador en directo */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-red-400 font-black text-sm uppercase tracking-widest">En directo ahora</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-2">{directo.titulo}</h2>
              {directo.descripcion && (
                <p className="text-white/60 mb-6 text-sm">{directo.descripcion}</p>
              )}
              <a
                href={directo.url_tiivii}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-600 hover:bg-red-700 text-white font-black px-10 py-4 rounded-2xl text-lg transition shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                ▶ Ver partido en directo
              </a>
              <p className="text-white/30 text-xs mt-4">Se abrirá en tiivii.tv</p>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center">
            <p className="text-4xl mb-3">📡</p>
            <p className="text-xl font-black text-gray-700 mb-1">No hay partido en directo ahora mismo</p>
            {proximoPartido ? (
              <div className="mt-4 space-y-2">
                <p className="text-gray-500 text-sm">
                  Próximo: <strong>{(proximoPartido.local as any)?.nombre} vs {(proximoPartido.visitante as any)?.nombre}</strong>
                </p>
                {proximoPartido.fecha && (
                  <div className="flex justify-center">
                    <div className="bg-candas-negro text-white px-4 py-2 rounded-xl inline-flex items-center gap-2">
                      <CuentaAtras fecha={proximoPartido.fecha} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm mt-2">Vuelve el día del partido</p>
            )}
          </div>
        )}
      </section>

      {/* ANTERIORES */}
      {anteriores.length > 0 && (
        <section>
          <h2 className="text-2xl font-black mb-5">🎬 Partidos grabados</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {anteriores.map((r) => (
              <a
                key={r.id}
                href={r.url_tiivii}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition block"
              >
                {/* Miniatura */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden">
                  {r.miniatura_url ? (
                    <img
                      src={r.miniatura_url}
                      alt={r.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl opacity-30">🎬</span>
                    </div>
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 group-hover:bg-white/30 rounded-full flex items-center justify-center transition backdrop-blur-sm">
                      <span className="text-white text-xl ml-1">▶</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <p className="font-black text-sm text-gray-900 leading-tight mb-1">{r.titulo}</p>
                  {r.fecha && (
                    <p className="text-xs text-gray-400">
                      {new Date(r.fecha).toLocaleDateString("es-ES", {
                        day: "numeric", month: "long", year: "numeric",
                        timeZone: "Europe/Madrid",
                      })}
                    </p>
                  )}
                  {r.descripcion && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{r.descripcion}</p>
                  )}
                </div>
              </a>
            ))}
          </div>
          <p className="text-center text-xs text-gray-400 mt-6">
            Vídeos ofrecidos por{" "}
            <a href="https://tiivii.tv" target="_blank" rel="noopener noreferrer" className="hover:underline">
              tiivii.tv
            </a>
          </p>
        </section>
      )}

      {anteriores.length === 0 && !directo && (
        <div className="text-center py-8 text-gray-400 text-sm">
          Pronto habrá partidos grabados aquí.
        </div>
      )}
    </div>
  );
}