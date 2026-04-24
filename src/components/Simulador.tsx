"use client";

import { useMemo, useState } from "react";
import { calcularClasificacion, Equipo, Partido } from "@/lib/types";
import TablaClasificacion from "@/components/TablaClasificacion";

type Props = {
  equipos: Equipo[];
  partidos: Partido[];
};

type Simulacion = {
  gl: number;
  gv: number;
};

export default function Simulador({ equipos, partidos }: Props) {
  const candas = equipos.find((e) => e.nombre === "Candás CF") ?? equipos[0];
  const [simulaciones, setSimulaciones] = useState<Record<number, Simulacion>>({});
  const [soloCandas, setSoloCandas] = useState(false);

  const pendientes = useMemo(
    () => partidos.filter((p) => !p.jugado).sort((a, b) => a.jornada - b.jornada),
    [partidos]
  );

  const pendientesFiltrados = useMemo(
    () =>
      soloCandas
        ? pendientes.filter(
            (p) => p.local_id === candas?.id || p.visitante_id === candas?.id
          )
        : pendientes,
    [pendientes, soloCandas, candas]
  );

  const clasificacionProyectada = useMemo(() => {
    const proyectados = partidos.map((p) => {
      if (p.jugado) return p;
      const sim = simulaciones[p.id];
      if (!sim) return p;
      return {
        ...p,
        goles_local: sim.gl,
        goles_visitante: sim.gv,
        jugado: true,
      };
    });
    return calcularClasificacion(equipos, proyectados);
  }, [equipos, partidos, simulaciones]);

  const setResultado = (partido: Partido, tipo: "1" | "X" | "2") => {
    const sim: Simulacion = tipo === "1" ? { gl: 1, gv: 0 } : tipo === "2" ? { gl: 0, gv: 1 } : { gl: 1, gv: 1 };
    setSimulaciones((prev) => ({ ...prev, [partido.id]: sim }));
  };

  const setGol = (partido: Partido, campo: "local" | "visitante", valor: number) => {
    const actual = simulaciones[partido.id] ?? { gl: 0, gv: 0 };
    setSimulaciones((prev) => ({
      ...prev,
      [partido.id]: {
        gl: campo === "local" ? Math.max(0, valor) : actual.gl,
        gv: campo === "visitante" ? Math.max(0, valor) : actual.gv,
      },
    }));
  };

  const limpiar = () => setSimulaciones({});

  const tipoSim = (partido: Partido) => {
    const s = simulaciones[partido.id];
    if (!s) return "";
    if (s.gl === 1 && s.gv === 0) return "1";
    if (s.gl === 0 && s.gv === 1) return "2";
    if (s.gl === 1 && s.gv === 1) return "X";
    return "custom";
  };

  const posCandas = candas
    ? clasificacionProyectada.findIndex((f) => f.equipo.id === candas.id) + 1
    : 0;

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-br from-candas-rojo to-candas-rojoOscuro text-white rounded-xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm uppercase opacity-80 font-medium">
              Posición proyectada del Candás
            </p>
            <p className="text-5xl font-black">{posCandas || "-"}º</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setSoloCandas(!soloCandas)}
              className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-sm font-medium transition"
            >
              {soloCandas ? "Ver todos" : "Solo Candás"}
            </button>
            <button
              onClick={limpiar}
              className="px-4 py-2 rounded-lg bg-white text-candas-rojo font-bold text-sm hover:bg-candas-crema transition"
            >
              ↻ Limpiar
            </button>
          </div>
        </div>
      </div>

      <div className="card-dark rounded-2xl p-4 md:p-6">
        <h2 className="text-xl font-bold mb-4">Clasificación proyectada</h2>
        <TablaClasificacion filas={clasificacionProyectada} />
      </div>

      <div className="card-dark rounded-2xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold">⚽ Partidos por simular</h2>
            <p className="text-sm text-white/30">
              El golaveraje se actualiza en la clasificación virtual.
            </p>
          </div>
          <div className="text-sm text-white/40">Partidos pendientes: {pendientesFiltrados.length}</div>
        </div>

        {pendientesFiltrados.length === 0 ? (
          <p className="text-white/20 text-center py-8">No hay partidos pendientes.</p>
        ) : (
          <div className="space-y-4">
            {pendientesFiltrados.map((p) => {
              const sim = simulaciones[p.id];
              const simulado = !!sim;
              return (
                <div
                  key={p.id}
                  className={`rounded-xl border p-4 transition ${
                    simulado ? "border-green-500/30 bg-green-500/5" : "border-white/5 bg-white/2"
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[80px_1fr_220px] gap-4 items-center">
                    <div className="text-xs font-semibold uppercase text-white/30">J{p.jornada}</div>
                    <div>
                      <p className="font-semibold text-sm">
                        {p.local?.nombre ?? `Local (${p.local_id})`}
                      </p>
                      <p className="text-xs text-white/30">vs</p>
                      <p className="font-semibold text-sm">
                        {p.visitante?.nombre ?? `Visitante (${p.visitante_id})`}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setResultado(p, "1")}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition ${
                            tipoSim(p) === "1"
                              ? "bg-candas-rojo text-white"
                              : "bg-white/5 text-white/50 hover:bg-white/10"
                          }`}
                        >
                          1
                        </button>
                        <button
                          type="button"
                          onClick={() => setResultado(p, "X")}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition ${
                            tipoSim(p) === "X"
                              ? "bg-candas-rojo text-white"
                              : "bg-white/5 text-white/50 hover:bg-white/10"
                          }`}
                        >
                          X
                        </button>
                        <button
                          type="button"
                          onClick={() => setResultado(p, "2")}
                          className={`w-9 h-9 rounded-lg text-sm font-bold transition ${
                            tipoSim(p) === "2"
                              ? "bg-candas-rojo text-white"
                              : "bg-white/5 text-white/50 hover:bg-white/10"
                          }`}
                        >
                          2
                        </button>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          min={0}
                          value={sim?.gl ?? ""}
                          onChange={(e) =>
                            setGol(p, "local", parseInt(e.target.value) || 0)
                          }
                          className="w-12 rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1 text-center text-sm"
                          placeholder="0"
                        />
                        <span className="text-sm font-bold">-</span>
                        <input
                          type="number"
                          min={0}
                          value={sim?.gv ?? ""}
                          onChange={(e) =>
                            setGol(p, "visitante", parseInt(e.target.value) || 0)
                          }
                          className="w-12 rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1 text-center text-sm"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}