"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Jugador = { id: number; nombre: string };
type ResultadoVoto = { jugador_id: number; nombre: string; votos: number };

export default function EncuestaPublica({
  encuestaId,
  usuarioId,
}: {
  encuestaId: number;
  usuarioId: string;
}) {
  const supabase = useRef(createClient()).current;
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [miVoto, setMiVoto] = useState<number | null>(null);
  const [resultados, setResultados] = useState<ResultadoVoto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [votando, setVotando] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [{ data: jugData }, { data: miVotoData }, { data: votosData }] = await Promise.all([
        supabase.from("jugadores").select("id, nombre").eq("activo", true).order("nombre"),
        supabase.from("votos").select("jugador_id").eq("encuesta_id", encuestaId).eq("usuario_id", usuarioId).single(),
        supabase.from("votos").select("jugador_id, jugadores(nombre)").eq("encuesta_id", encuestaId),
      ]);
      setJugadores((jugData ?? []) as Jugador[]);
      setMiVoto(miVotoData?.jugador_id ?? null);
      setResultados(calcular(votosData ?? []));
      setCargando(false);
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const calcular = (data: any[]): ResultadoVoto[] => {
    const c = new Map<number, { nombre: string; votos: number }>();
    data.forEach((v: any) => {
      const id = v.jugador_id;
      const nombre = v.jugadores?.nombre ?? "?";
      if (!c.has(id)) c.set(id, { nombre, votos: 0 });
      c.get(id)!.votos++;
    });
    return Array.from(c.entries())
      .map(([jugador_id, { nombre, votos }]) => ({ jugador_id, nombre, votos }))
      .sort((a, b) => b.votos - a.votos);
  };

  const votar = async (jugadorId: number) => {
    if (votando) return;
    setVotando(true);
    if (miVoto !== null) await supabase.from("votos").delete().eq("encuesta_id", encuestaId).eq("usuario_id", usuarioId);
    if (miVoto === jugadorId) {
      setMiVoto(null);
    } else {
      await supabase.from("votos").insert({ encuesta_id: encuestaId, jugador_id: jugadorId, usuario_id: usuarioId });
      setMiVoto(jugadorId);
    }
    const { data } = await supabase.from("votos").select("jugador_id, jugadores(nombre)").eq("encuesta_id", encuestaId);
    setResultados(calcular(data ?? []));
    setVotando(false);
  };

  const totalVotos = resultados.reduce((s, r) => s + r.votos, 0);

  if (cargando) return (
    <div className="space-y-2 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-10 bg-white/5 rounded-xl" />)}
    </div>
  );

  return (
    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
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
                <span className={`text-sm ${esElMio ? "font-black text-candas-rojo" : "font-medium text-white/70"}`}>{j.nombre}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {votos > 0 && <span className="text-xs text-white/30">{pct}%</span>}
                <span className={`text-sm font-bold ${esElMio ? "text-candas-rojo" : "text-white/40"}`}>{votos}</span>
              </div>
            </div>
          </button>
        );
      })}
      {miVoto !== null && (
        <p className="text-xs text-center text-white/30 pt-2">
          Tu voto: <strong className="text-candas-rojo">{jugadores.find(j => j.id === miVoto)?.nombre}</strong> · Puedes cambiarlo
        </p>
      )}
    </div>
  );
}
