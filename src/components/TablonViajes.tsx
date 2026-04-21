"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Partido, Viaje } from "@/lib/types";

type Props = {
  usuarioId: string;
  proximosPartidos: Partido[];
};

export default function TablonViajes({ usuarioId, proximosPartidos }: Props) {
  const supabase = createClient();
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [abierto, setAbierto] = useState(false);

  const [partidoId, setPartidoId] = useState<number | "">("");
  const [puntoSalida, setPuntoSalida] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [plazas, setPlazas] = useState(3);
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    const { data } = await supabase
      .from("viajes")
      .select(
        "*, partidos(*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*))"
      )
      .order("hora_salida", { ascending: true });

    if (!data) return;

    // Cargar perfiles por separado
    const ids = [...new Set(data.map((v: any) => v.usuario_id))];
    const { data: perfiles } = await supabase
      .from("profiles")
      .select("id, nombre, carnet")
      .in("id", ids);
    const mapaPerfiles = new Map((perfiles ?? []).map((p: any) => [p.id, p]));
    const viajesConPerfil = data.map((v: any) => ({
      ...v,
      profiles: mapaPerfiles.get(v.usuario_id) ?? null,
    }));
    setViajes(viajesConPerfil as Viaje[]);
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const publicar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!partidoId || !puntoSalida || !horaSalida) {
      setError("Completa partido, punto de salida y hora.");
      return;
    }
    const { error } = await supabase.from("viajes").insert({
      usuario_id: usuarioId,
      partido_id: partidoId,
      punto_salida: puntoSalida,
      hora_salida: new Date(horaSalida).toISOString(),
      plazas,
      notas: notas || null,
    });
    if (error) {
      setError(error.message);
      return;
    }
    setPartidoId("");
    setPuntoSalida("");
    setHoraSalida("");
    setPlazas(3);
    setNotas("");
    setAbierto(false);
    cargar();
  };

  const borrar = async (id: number) => {
    await supabase.from("viajes").delete().eq("id", id);
    cargar();
  };

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">🚗 Viajes compartidos</h2>
        <button
          onClick={() => setAbierto(!abierto)}
          className="bg-candas-rojo text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-candas-rojoOscuro"
        >
          {abierto ? "Cancelar" : "+ Ofrecer coche"}
        </button>
      </div>

      {abierto && (
        <form
          onSubmit={publicar}
          className="bg-candas-crema p-4 rounded-lg mb-4 space-y-3"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Partido</label>
            <select
              value={partidoId}
              onChange={(e) =>
                setPartidoId(e.target.value ? parseInt(e.target.value) : "")
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Elige partido...</option>
              {proximosPartidos.map((p) => (
                <option key={p.id} value={p.id}>
                  J{p.jornada} · {p.local?.nombre} vs {p.visitante?.nombre}
                  {p.fecha
                    ? ` — ${new Date(p.fecha).toLocaleDateString("es-ES")}`
                    : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Punto de salida
              </label>
              <input
                type="text"
                value={puntoSalida}
                onChange={(e) => setPuntoSalida(e.target.value)}
                placeholder="Ej: Plaza La Baragaña"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Hora de salida
              </label>
              <input
                type="datetime-local"
                value={horaSalida}
                onChange={(e) => setHoraSalida(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Plazas libres: {plazas}
            </label>
            <input
              type="range"
              min={1}
              max={6}
              value={plazas}
              onChange={(e) => setPlazas(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Notas</label>
            <input
              type="text"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Opcional: teléfono de contacto, algo que indicar..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-candas-rojo text-white font-bold py-2 rounded-lg"
          >
            Publicar viaje
          </button>
        </form>
      )}

      {viajes.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-8">
          Aún no hay viajes publicados. ¡Sé el primero!
        </p>
      ) : (
        <ul className="space-y-3">
          {viajes.map((v) => {
            const p = v.partidos;
            const esMio = v.usuario_id === usuarioId;
            return (
              <li
                key={v.id}
                className="border border-gray-200 rounded-lg p-3 text-sm"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="font-bold">
                      {p ? `${p.local?.nombre} vs ${p.visitante?.nombre}` : "Partido"}
                    </div>
                    <div className="text-gray-600 text-xs mb-1">
                      Salida desde <strong>{v.punto_salida}</strong> el{" "}
                      {new Date(v.hora_salida).toLocaleString("es-ES", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <div className="flex gap-3 text-xs">
                      <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded">
                        {v.plazas} plaza{v.plazas > 1 ? "s" : ""}
                      </span>
                      <span className="text-gray-500">
                        Ofrece: {v.profiles?.nombre ?? "Abonado"}
                        {v.profiles?.carnet && ` · #${v.profiles.carnet}`}
                      </span>
                    </div>
                    {v.notas && (
                      <div className="mt-2 text-gray-700 italic">"{v.notas}"</div>
                    )}
                  </div>
                  {esMio && (
                    <button
                      onClick={() => borrar(v.id)}
                      className="text-red-600 hover:text-red-800 text-xs"
                    >
                      Borrar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}