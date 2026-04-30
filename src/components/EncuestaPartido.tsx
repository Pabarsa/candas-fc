"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

type Jugador = { id: number; nombre: string };
type ResultadoVoto = { jugador_id: number; nombre: string; votos: number };

export default function EncuestaPartido({
  encuestaId, titulo, activa, usuarioId,
}: {
  encuestaId: number;
  titulo: string;
  activa: boolean;
  usuarioId: string | null;
}) {
  const supabase = useRef(createClient()).current;
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [miVoto, setMiVoto] = useState<number | null>(null);
  const [resultados, setResultados] = useState<ResultadoVoto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [votando, setVotando] = useState(false);

  useEffect(() => {
    const init = async () => {
      const [{ data: jugData }, { data: votosData }, { data: miVotoData }] = await Promise.all([
        supabase.from("jugadores").select("id, nombre").eq("activo", true).order("nombre"),
        supabase.from("votos").select("jugador_id, jugadores(nombre)").eq("encuesta_id", encuestaId),
        usuarioId
          ? supabase.from("votos").select("jugador_id").eq("encuesta_id", encuestaId).eq("usuario_id", usuarioId).single()
          : Promise.resolve({ data: null }),
      ]);
      setJugadores((jugData ?? []) as Jugador[]);
      setMiVoto((miVotoData as any)?.jugador_id ?? null);
      setResultados(calcular(votosData ?? []));
      setCargando(false);
    };
    init();
  }, []); // eslint-disable-line

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
    if (!usuarioId || votando || !activa) return;
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

  const total = resultados.reduce((s, r) => s + r.votos, 0);
  const ganador = resultados[0] ?? null;

  if (cargando) return (
    <div className="space-y-2 animate-pulse">
      {[1,2,3].map(i => <div key={i} className="h-8 bg-white/5 rounded-xl" />)}
    </div>
  );

  // ── Encuesta cerrada: resultado final ──
  if (!activa) return (
    <div className="space-y-4">
      <p className="text-white/60 text-xs">{titulo.replace("⭐ ", "")}</p>
      {ganador ? (
        <div className="text-center py-3">
          <p className="text-yellow-400 text-xs font-black uppercase tracking-widest mb-2">⭐ Mejor jugador</p>
          <p className="font-poppins font-black text-white text-2xl mb-1">{ganador.nombre}</p>
          <p className="text-white/30 text-xs">{ganador.votos} votos de {total} participantes</p>
        </div>
      ) : (
        <p className="text-white/30 text-sm text-center py-4">Sin votos registrados</p>
      )}
      {resultados.length > 1 && (
        <div className="space-y-1.5 border-t border-white/5 pt-3">
          {resultados.map((r, i) => {
            const pct = total > 0 ? Math.round((r.votos / total) * 100) : 0;
            return (
              <div key={r.jugador_id} className="flex items-center gap-2 relative overflow-hidden rounded-lg px-3 py-1.5">
                <div className="absolute inset-0 bg-white/3 rounded-lg" style={{ width: `${pct}%` }} />
                <span className="relative text-white/20 text-xs w-4 flex-shrink-0">{i + 1}</span>
                <span className={`relative flex-1 text-xs truncate ${i === 0 ? "text-white font-bold" : "text-white/50"}`}>{r.nombre}</span>
                <span className="relative text-white/30 text-xs flex-shrink-0">{r.votos} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      )}
      <p className="text-[10px] text-white/20 text-center">Encuesta cerrada</p>
    </div>
  );

  // ── Encuesta abierta: votación ──
  return (
    <div className="space-y-3">
      <p className="text-white/60 text-xs">{titulo.replace("⭐ ", "")}</p>
      <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
        {jugadores.map((j) => {
          const res = resultados.find((r) => r.jugador_id === j.id);
          const votos = res?.votos ?? 0;
          const pct = total > 0 ? Math.round((votos / total) * 100) : 0;
          const esElMio = miVoto === j.id;
          const esLider = resultados[0]?.jugador_id === j.id && total > 0;
          return (
            <button key={j.id}
              onClick={() => votar(j.id)}
              disabled={votando || !usuarioId}
              className={`w-full text-left rounded-xl px-3 py-2 transition relative overflow-hidden border ${
                esElMio ? "border-candas-rojo bg-candas-rojo/10" : "border-white/5 bg-white/3 hover:bg-white/5"
              } disabled:cursor-default`}>
              {pct > 0 && (
                <div className={`absolute inset-y-0 left-0 ${esElMio ? "bg-candas-rojo/10" : "bg-white/3"} rounded-xl transition-all duration-500`}
                  style={{ width: `${pct}%` }} />
              )}
              <div className="relative flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {esElMio && <span className="text-candas-rojo text-xs">✓</span>}
                  {esLider && !esElMio && <span className="text-yellow-400 text-xs">★</span>}
                  <span className={`text-xs ${esElMio ? "font-black text-candas-rojo" : "text-white/60"}`}>{j.nombre}</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {votos > 0 && <span className="text-[10px] text-white/20">{pct}%</span>}
                  <span className={`text-xs font-bold ${esElMio ? "text-candas-rojo" : "text-white/30"}`}>{votos}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {!usuarioId && (
        <Link href="/login" className="block text-center text-xs text-candas-rojo hover:underline mt-2">
          Inicia sesión para votar
        </Link>
      )}
      {usuarioId && miVoto !== null && (
        <p className="text-[10px] text-center text-white/20">
          Tu voto: <strong className="text-candas-rojo">{jugadores.find(j => j.id === miVoto)?.nombre}</strong>
        </p>
      )}
    </div>
  );
}