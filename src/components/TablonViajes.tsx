"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Partido, Viaje } from "@/lib/types";

type Props = {
  usuarioId: string;
  esAdmin?: boolean;
  proximosPartidos: Partido[];
};

export default function TablonViajes({ usuarioId, esAdmin, proximosPartidos }: Props) {
  const supabase = createClient();
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [aceptado, setAceptado] = useState(false);

  const [partidoId, setPartidoId] = useState<number | "">("");
  const [puntoSalida, setPuntoSalida] = useState("");
  const [horaSalida, setHoraSalida] = useState("");
  const [plazas, setPlazas] = useState(3);
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Solo partidos futuros (con fecha o sin fecha aún)
  const partidosFuturos = proximosPartidos.filter((p) => !p.jugado);

  // Fecha del partido seleccionado para mostrar solo hora
  const partidoSeleccionado = partidosFuturos.find((p) => p.id === partidoId);
  const fechaPartido = partidoSeleccionado?.fecha
    ? new Date(partidoSeleccionado.fecha).toLocaleDateString("es-ES", {
        weekday: "long", day: "numeric", month: "long",
        timeZone: "Europe/Madrid",
      })
    : null;

  const cargar = async () => {
    const { data } = await supabase
      .from("viajes")
      .select("*, partidos(*, local:equipos!partidos_local_id_fkey(*), visitante:equipos!partidos_visitante_id_fkey(*))")
      .order("hora_salida", { ascending: true });

    if (!data) return;

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

    // Construir fecha completa: fecha del partido + hora introducida
    let fechaCompleta: string;
    if (partidoSeleccionado?.fecha) {
      const base = new Date(partidoSeleccionado.fecha);
      const [hh, mm] = horaSalida.split(":").map(Number);
      base.setHours(hh, mm, 0, 0);
      fechaCompleta = base.toISOString();
    } else {
      // Sin fecha de partido, usar solo la hora de hoy como referencia
      const hoy = new Date();
      const [hh, mm] = horaSalida.split(":").map(Number);
      hoy.setHours(hh, mm, 0, 0);
      fechaCompleta = hoy.toISOString();
    }

    const { error } = await supabase.from("viajes").insert({
      usuario_id: usuarioId,
      partido_id: partidoId,
      punto_salida: puntoSalida,
      hora_salida: fechaCompleta,
      plazas,
      notas: notas || null,
    });
    if (error) { setError(error.message); return; }

    setPartidoId(""); setPuntoSalida(""); setHoraSalida("");
    setPlazas(3); setNotas(""); setAbierto(false); setAceptado(false);
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
        <div className="bg-candas-crema p-4 rounded-lg mb-4 space-y-3">
          {/* Aviso uso responsable */}
          {!aceptado ? (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
                <p className="font-black mb-2">⚠️ Antes de publicar un viaje, léete esto:</p>
                <ul className="space-y-1 text-xs leading-relaxed list-disc list-inside">
                  <li>Los viajes son acuerdos entre aficionados. El Fondo Sur Canijo no se hace responsable.</li>
                  <li>Publicar un viaje que no vayas a cumplir puede suponer la <strong>baja como abonado</strong>.</li>
                  <li>Si no puedes llevar a la gente, borra el viaje cuanto antes y avisa.</li>
                  <li>El admin puede borrar cualquier viaje que considere inapropiado.</li>
                </ul>
              </div>
              <button
                onClick={() => setAceptado(true)}
                className="w-full bg-candas-rojo text-white font-bold py-2 rounded-lg text-sm hover:bg-candas-rojoOscuro transition"
              >
                Entendido, quiero publicar un viaje
              </button>
            </div>
          ) : (
            <form onSubmit={publicar} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Partido</label>
                <select
                  value={partidoId}
                  onChange={(e) => setPartidoId(e.target.value ? parseInt(e.target.value) : "")}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Elige partido...</option>
                  {partidosFuturos.map((p) => (
                    <option key={p.id} value={p.id}>
                      J{p.jornada} · {p.local?.nombre} vs {p.visitante?.nombre}
                      {p.fecha ? ` — ${new Date(p.fecha).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short", timeZone: "Europe/Madrid" })}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {fechaPartido && (
                <p className="text-xs text-gray-500 bg-white border border-gray-200 rounded-lg px-3 py-2">
                  📅 Partido el <strong>{fechaPartido}</strong>
                </p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Punto de salida</label>
                  <input
                    type="text"
                    value={puntoSalida}
                    onChange={(e) => setPuntoSalida(e.target.value)}
                    placeholder="Ej: Plaza La Baragaña"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hora de salida</label>
                  <input
                    type="time"
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
                  type="range" min={1} max={6} value={plazas}
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
                  placeholder="Opcional: teléfono de contacto, punto de encuentro..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm">
                  {error}
                </div>
              )}
              <button type="submit" className="w-full bg-candas-rojo text-white font-bold py-2 rounded-lg hover:bg-candas-rojoOscuro transition">
                Publicar viaje
              </button>
            </form>
          )}
        </div>
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
            const puedeborrar = esMio || esAdmin;
            return (
              <li key={v.id} className="border border-gray-200 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="font-bold">
                      {p ? `${p.local?.nombre} vs ${p.visitante?.nombre}` : "Partido"}
                    </div>
                    <div className="text-gray-600 text-xs mb-1">
                      Salida desde <strong>{v.punto_salida}</strong> a las{" "}
                      <strong>
                        {new Date(v.hora_salida).toLocaleTimeString("es-ES", {
                          hour: "2-digit", minute: "2-digit",
                          timeZone: "Europe/Madrid",
                        })}
                      </strong>
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
                  {puedeborrar && (
                    <button
                      onClick={() => borrar(v.id)}
                      className={`text-xs ${esMio ? "text-red-600 hover:text-red-800" : "text-gray-400 hover:text-red-600"}`}
                    >
                      {esAdmin && !esMio ? "🗑️" : "Borrar"}
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