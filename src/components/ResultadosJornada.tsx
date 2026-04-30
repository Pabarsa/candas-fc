"use client";

import { useState } from "react";
import Link from "next/link";

type Equipo = { id: number; nombre: string };
type Partido = {
  id: number;
  jornada: number;
  jugado: boolean;
  goles_local: number | null;
  goles_visitante: number | null;
  local_id: number;
  visitante_id: number;
  local?: Equipo;
  visitante?: Equipo;
};

export default function ResultadosJornada({
  partidos,
  candasId,
}: {
  partidos: Partido[];
  candasId: number | undefined;
}) {
  const jugados = partidos.filter((p) => p.jugado);
  const jornadas = [...new Set(jugados.map((p) => p.jornada))].sort((a, b) => a - b);
  const [jornadaActual, setJornadaActual] = useState(jornadas[jornadas.length - 1] ?? 1);

  if (jornadas.length === 0) return null;

  const idx = jornadas.indexOf(jornadaActual);
  const anterior = idx > 0 ? jornadas[idx - 1] : null;
  const siguiente = idx < jornadas.length - 1 ? jornadas[idx + 1] : null;
  const partidosJornada = jugados.filter((p) => p.jornada === jornadaActual);

  return (
    <div>
      <p className="text-white/30 text-xs uppercase tracking-widest mb-4">Resultados</p>
      <div className="card-dark rounded-2xl overflow-hidden">
        {/* ── Navegación jornada ── */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
          <button
            onClick={() => anterior !== null && setJornadaActual(anterior)}
            disabled={anterior === null}
            className="flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition px-2 py-1 rounded-lg hover:bg-white/5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          <span className="font-poppins font-black text-sm text-white">
            Jornada {jornadaActual}
          </span>

          <button
            onClick={() => siguiente !== null && setJornadaActual(siguiente)}
            disabled={siguiente === null}
            className="flex items-center gap-1.5 text-xs font-bold text-white/40 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition px-2 py-1 rounded-lg hover:bg-white/5"
          >
            Siguiente
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* ── Partidos de la jornada ── */}
        <ul className="divide-y divide-white/5">
          {partidosJornada.map((p) => {
            const esLocal = candasId && p.local_id === candasId;
            const esVisitante = candasId && p.visitante_id === candasId;
            const esCandas = esLocal || esVisitante;
            const ganoLocal = (p.goles_local ?? 0) > (p.goles_visitante ?? 0);
            const ganoVisitante = (p.goles_visitante ?? 0) > (p.goles_local ?? 0);
            const resultado = esCandas
              ? (esLocal && ganoLocal) || (esVisitante && ganoVisitante)
                ? "V"
                : ganoLocal === ganoVisitante ? "E" : "D"
              : null;

            const fila = (
              <div className={`px-4 py-3 flex items-center gap-2 ${esCandas ? "bg-candas-rojo/5" : ""}`}>
                <span className={`w-4 text-[10px] font-black text-center flex-shrink-0 ${
                  resultado === "V" ? "text-green-400" :
                  resultado === "E" ? "text-yellow-400" :
                  resultado === "D" ? "text-red-400" :
                  "text-transparent"
                }`}>
                  {resultado ?? "·"}
                </span>
                <span className={`flex-1 text-xs sm:text-sm text-right truncate ${esLocal ? "text-white font-bold" : "text-white/50"}`}>
                  {p.local?.nombre}
                </span>
                <span className="flex-shrink-0 font-black text-sm sm:text-base tabular-nums text-white bg-white/5 rounded-lg px-2.5 py-0.5 min-w-[54px] text-center">
                  {p.goles_local} - {p.goles_visitante}
                </span>
                <span className={`flex-1 text-xs sm:text-sm truncate ${esVisitante ? "text-white font-bold" : "text-white/50"}`}>
                  {p.visitante?.nombre}
                </span>
                {esCandas && (
                  <span className="text-white/20 text-xs flex-shrink-0">→</span>
                )}
              </div>
            );

            return (
              <li key={p.id}>
                {esCandas ? (
                  <Link href={`/partido/${p.id}`} className="block hover:bg-white/5 transition-colors">
                    {fila}
                  </Link>
                ) : (
                  fila
                )}
              </li>
            );
          })}
        </ul>

        {/* ── Selector rápido de jornada ── */}
        <div className="px-4 py-3 border-t border-white/5 flex items-center gap-1.5 flex-wrap justify-center">
          {jornadas.map((j) => (
            <button
              key={j}
              onClick={() => setJornadaActual(j)}
              className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                j === jornadaActual
                  ? "bg-candas-rojo text-white"
                  : "bg-white/5 text-white/30 hover:bg-white/10 hover:text-white/60"
              }`}
            >
              {j}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
