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

  useEffect(() => {
    supabase
      .from("encuestas")
      .select("*")
      .eq("activa", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const lista = (data ?? []) as Encuesta[];
        setEncuestas(lista);
        if (lista.length > 0) cargarEncuesta(lista[0]);
        else setCargando(false);
      });

    supabase
      .from("jugadores")
      .select("id, nombre")
      .eq("activo", true)
      .order("nombre")
      .then(({ data }) => setJugadores((data ?? []) as Jugador[]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarEncuesta = async (enc: Encuesta) => {
    setCargando(true);
    setSeleccionada(enc);

    // Mi voto en esta encuesta
    const { data: miVotoData } = await supabase
      .from("votos")
      .select("jugador_id")
      .eq("encuesta_id", enc.id)
      .eq("usuario_id", usuarioId)
      .single();
    setMiVoto(miVotoData?.jugador_id ?? null);

    // Resultados
    await cargarResultados(enc.id);
    setCargando(false);
  };

  const cargarResultados = async (encuestaId: number) => {
    const { data } = await supabase
      .from("votos")
      .select("jugador_id, jugadores(nombre)")
      .eq("encuesta_id", encuestaId);

    const conteo = new Map<number, { nombre: string; votos: number }>();
    (data ?? []).forEach((v: any) => {
      const id = v.jugador_id;
      const nombre = v.jugadores?.nombre ?? "Desconocido";
      if (!conteo.has(id)) conteo.set(id, { nombre, votos: 0 });
      conteo.get(id)!.votos++;
    });

    const sorted = Array.from(conteo.entries())
      .map(([jugador_id, { nombre, votos }]) => ({ jugador_id, nombre, votos }))
      .sort((a, b) => b.votos - a.votos);

    setResultados(sorted);
  };

  const votar = async (jugadorId: number) => {
    if (!seleccionada || votando) return;
    setVotando(true);

    if (miVoto !== null) {
      // Cambiar voto: borrar el anterior
      await supabase
        .from("votos")
        .delete()
        .eq("encuesta_id", seleccionada.id)
        .eq("usuario_id", usuarioId);
    }

    if (miVoto === jugadorId) {
      // Si clica el mismo, desvotar
      setMiVoto(null);
    } else {
      await supabase.from("votos").insert({
        encuesta_id: seleccionada.id,
        jugador_id: jugadorId,
        usuario_id: usuarioId,
      });
      setMiVoto(jugadorId);
    }

    await cargarResultados(seleccionada.id);
    setVotando(false);
  };

  const totalVotos = resultados.reduce((s, r) => s + r.votos, 0);
  const ganador = resultados[0] ?? null;

  if (cargando) return <div className="text-center py-8 text-gray-400 text-sm">Cargando encuesta...</div>;

  if (encuestas.length === 0) return (
    <div className="text-center py-8 text-gray-400">
      <p className="text-3xl mb-2">🗳️</p>
      <p className="text-sm">No hay encuestas activas ahora mismo.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Selector si hay varias encuestas */}
      {encuestas.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {encuestas.map((enc) => (
            <button
              key={enc.id}
              onClick={() => cargarEncuesta(enc)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                seleccionada?.id === enc.id
                  ? "bg-candas-rojo text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {enc.titulo}
            </button>
          ))}
        </div>
      )}

      {seleccionada && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base">{seleccionada.titulo}</h3>
            <span className="text-xs text-gray-400">{totalVotos} {totalVotos === 1 ? "voto" : "votos"}</span>
          </div>

          {/* Ganador provisional */}
          {ganador && totalVotos > 0 && (
            <div className="bg-gradient-to-r from-candas-rojo to-candas-rojoOscuro text-white rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-2xl">🏆</span>
              <div>
                <p className="text-xs text-white/70">Líder provisional</p>
                <p className="font-black text-sm">{ganador.nombre}</p>
              </div>
              <span className="ml-auto font-black text-lg">{ganador.votos}</span>
            </div>
          )}

          {/* Lista jugadores */}
          <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
            {jugadores.map((j) => {
              const res = resultados.find((r) => r.jugador_id === j.id);
              const votos = res?.votos ?? 0;
              const pct = totalVotos > 0 ? Math.round((votos / totalVotos) * 100) : 0;
              const esElMio = miVoto === j.id;
              const esLider = resultados[0]?.jugador_id === j.id && totalVotos > 0;

              return (
                <button
                  key={j.id}
                  onClick={() => votar(j.id)}
                  disabled={votando}
                  className={`w-full text-left rounded-xl px-3 py-2 transition relative overflow-hidden border-2 ${
                    esElMio
                      ? "border-candas-rojo bg-red-50"
                      : "border-transparent bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {/* Barra de progreso */}
                  {pct > 0 && (
                    <div
                      className={`absolute inset-y-0 left-0 ${esElMio ? "bg-red-100" : "bg-gray-200"} rounded-xl transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  )}
                  <div className="relative flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {esElMio && <span className="text-candas-rojo text-xs">✓</span>}
                      {esLider && !esElMio && <span className="text-xs">🏆</span>}
                      <span className={`text-sm ${esElMio ? "font-black text-candas-rojo" : "font-medium text-gray-800"}`}>
                        {j.nombre}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {votos > 0 && <span className="text-xs text-gray-500">{pct}%</span>}
                      <span className={`text-sm font-bold ${esElMio ? "text-candas-rojo" : "text-gray-500"}`}>
                        {votos}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {miVoto !== null && (
            <p className="text-xs text-center text-gray-400">
              Tu voto: <strong className="text-candas-rojo">{jugadores.find(j => j.id === miVoto)?.nombre}</strong> · Puedes cambiarlo
            </p>
          )}
        </>
      )}
    </div>
  );
}
