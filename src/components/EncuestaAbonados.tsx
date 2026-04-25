"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Jugador = { id: number; nombre: string };
type Encuesta = { id: number; titulo: string; activa: boolean; created_at: string };
type ResultadoVoto = { jugador_id: number; nombre: string; votos: number };

export default function EncuestaAbonados({ usuarioId }: { usuarioId: string }) {
  const supabase = useRef(createClient()).current;
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [seleccionada, setSeleccionada] = useState<Encuesta | null>(null);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [miVoto, setMiVoto] = useState<number | null>(null);
  const [resultados, setResultados] = useState<ResultadoVoto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [votando, setVotando] = useState(false);
  const [compartido, setCompartido] = useState(false);

  useEffect(() => {
    const init = async () => {
      // Cargar encuestas y jugadores en paralelo
      const [{ data: encData }, { data: jugData }] = await Promise.all([
        supabase.from("encuestas").select("*").eq("activa", true).order("created_at", { ascending: false }),
        supabase.from("jugadores").select("id, nombre").eq("activo", true).order("nombre"),
      ]);

      const lista = (encData ?? []) as Encuesta[];
      setJugadores((jugData ?? []) as Jugador[]);
      setEncuestas(lista);

      if (lista.length > 0) {
        const enc = lista[0];
        setSeleccionada(enc);
        // Cargar voto propio y resultados en paralelo
        const [{ data: miVotoData }, { data: votosData }] = await Promise.all([
          supabase.from("votos").select("jugador_id").eq("encuesta_id", enc.id).eq("usuario_id", usuarioId).single(),
          supabase.from("votos").select("jugador_id, jugadores(nombre)").eq("encuesta_id", enc.id),
        ]);
        setMiVoto(miVotoData?.jugador_id ?? null);
        setResultados(calcularResultados(votosData ?? []));
      }
      setCargando(false);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calcularResultados = (data: any[]): ResultadoVoto[] => {
    const conteo = new Map<number, { nombre: string; votos: number }>();
    data.forEach((v: any) => {
      const id = v.jugador_id;
      const nombre = v.jugadores?.nombre ?? "Desconocido";
      if (!conteo.has(id)) conteo.set(id, { nombre, votos: 0 });
      conteo.get(id)!.votos++;
    });
    return Array.from(conteo.entries())
      .map(([jugador_id, { nombre, votos }]) => ({ jugador_id, nombre, votos }))
      .sort((a, b) => b.votos - a.votos);
  };

  const cargarEncuesta = async (enc: Encuesta) => {
    setCargando(true);
    setSeleccionada(enc);
    setCompartido(false);
    const [{ data: miVotoData }, { data: votosData }] = await Promise.all([
      supabase.from("votos").select("jugador_id").eq("encuesta_id", enc.id).eq("usuario_id", usuarioId).single(),
      supabase.from("votos").select("jugador_id, jugadores(nombre)").eq("encuesta_id", enc.id),
    ]);
    setMiVoto(miVotoData?.jugador_id ?? null);
    setResultados(calcularResultados(votosData ?? []));
    setCargando(false);
  };

  const votar = async (jugadorId: number) => {
    if (!seleccionada || votando) return;
    setVotando(true);
    if (miVoto !== null) {
      await supabase.from("votos").delete().eq("encuesta_id", seleccionada.id).eq("usuario_id", usuarioId);
    }
    if (miVoto === jugadorId) {
      setMiVoto(null);
    } else {
      await supabase.from("votos").insert({ encuesta_id: seleccionada.id, jugador_id: jugadorId, usuario_id: usuarioId });
      setMiVoto(jugadorId);
    }
    const { data } = await supabase.from("votos").select("jugador_id, jugadores(nombre)").eq("encuesta_id", seleccionada.id);
    setResultados(calcularResultados(data ?? []));
    setVotando(false);
  };

  const compartirWhatsApp = () => {
    if (!ganador || !seleccionada) return;
    const texto = `Mejor jugador del partido según el Fondo Sur Canijo:\n\n${ganador.nombre} — ${ganador.votos} votos\n\n${seleccionada.titulo}\nfondosurcanijo.com`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener,noreferrer");
    setCompartido(true);
  };

  const totalVotos = resultados.reduce((s, r) => s + r.votos, 0);
  const ganador = resultados[0] ?? null;

  if (cargando) return (
    <div className="space-y-2 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-10 bg-white/5 rounded-xl" />)}
    </div>
  );

  if (encuestas.length === 0) return (
    <div className="text-center py-8 text-white/20">
      <p className="text-sm">No hay encuestas activas ahora mismo.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {encuestas.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {encuestas.map((enc) => (
            <button key={enc.id} onClick={() => cargarEncuesta(enc)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                seleccionada?.id === enc.id
                  ? "bg-candas-rojo text-white"
                  : "bg-white/5 text-white/40 hover:bg-white/10"
              }`}>
              {enc.titulo}
            </button>
          ))}
        </div>
      )}

      {seleccionada && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-sm">{seleccionada.titulo}</h3>
            <span className="text-xs text-white/30">{totalVotos} {totalVotos === 1 ? "voto" : "votos"}</span>
          </div>

          {ganador && totalVotos > 0 && (
            <div className="bg-gradient-to-r from-candas-rojo to-candas-rojoOscuro text-white rounded-xl px-4 py-3">
              <div className="flex items-center gap-3 mb-3">
                <div>
                  <p className="text-xs text-white/70">Líder provisional</p>
                  <p className="font-black text-sm">{ganador.nombre}</p>
                </div>
                <span className="ml-auto font-black text-lg">{ganador.votos}</span>
              </div>
              <button onClick={compartirWhatsApp}
                className={`w-full flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition ${
                  compartido ? "bg-white/10 text-white/60" : "bg-white/15 hover:bg-white/25 text-white"
                }`}>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                {compartido ? "Compartido!" : "Compartir en WhatsApp"}
              </button>
            </div>
          )}

          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {jugadores.map((j) => {
              const res = resultados.find((r) => r.jugador_id === j.id);
              const votos = res?.votos ?? 0;
              const pct = totalVotos > 0 ? Math.round((votos / totalVotos) * 100) : 0;
              const esElMio = miVoto === j.id;
              const esLider = resultados[0]?.jugador_id === j.id && totalVotos > 0;
              return (
                <button key={j.id} onClick={() => votar(j.id)} disabled={votando}
                  className={`w-full text-left rounded-xl px-3 py-2 transition relative overflow-hidden border ${
                    esElMio ? "border-candas-rojo bg-candas-rojo/10" : "border-white/5 bg-white/3 hover:bg-white/5"
                  }`}>
                  {pct > 0 && (
                    <div className={`absolute inset-y-0 left-0 ${esElMio ? "bg-candas-rojo/10" : "bg-white/3"} rounded-xl transition-all duration-500`}
                      style={{ width: `${pct}%` }} />
                  )}
                  <div className="relative flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {esElMio && <span className="text-candas-rojo text-xs font-bold">✓</span>}
                      {esLider && !esElMio && <span className="text-yellow-400 text-xs">★</span>}
                      <span className={`text-sm ${esElMio ? "font-black text-candas-rojo" : "font-medium text-white/70"}`}>
                        {j.nombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {votos > 0 && <span className="text-xs text-white/30">{pct}%</span>}
                      <span className={`text-sm font-bold ${esElMio ? "text-candas-rojo" : "text-white/40"}`}>{votos}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {miVoto !== null && (
            <p className="text-xs text-center text-white/30">
              Tu voto: <strong className="text-candas-rojo">{jugadores.find(j => j.id === miVoto)?.nombre}</strong> · Puedes cambiarlo
            </p>
          )}
        </>
      )}
    </div>
  );
}