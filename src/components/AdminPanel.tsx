"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Equipo, Partido } from "@/lib/types";
import { useRouter } from "next/navigation";

type Props = {
  equipos: Equipo[];
  partidos: Partido[];
};

export default function AdminPanel({ equipos, partidos }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [tab, setTab] = useState<"resultados" | "crear" | "equipos">("resultados");

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-gray-200 flex-wrap">
        <TabBtn activo={tab === "resultados"} onClick={() => setTab("resultados")}>
          ⚽ Resultados
        </TabBtn>
        <TabBtn activo={tab === "crear"} onClick={() => setTab("crear")}>
          ➕ Crear partido
        </TabBtn>
        <TabBtn activo={tab === "equipos"} onClick={() => setTab("equipos")}>
          🛡️ Equipos
        </TabBtn>
      </div>

      {tab === "resultados" && (
        <ResultadosTab partidos={partidos} onSave={() => router.refresh()} />
      )}
      {tab === "crear" && (
        <CrearPartidoTab equipos={equipos} onSave={() => router.refresh()} />
      )}
      {tab === "equipos" && (
        <EquiposTab equipos={equipos} onSave={() => router.refresh()} />
      )}
    </div>
  );
}

function TabBtn({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium border-b-2 transition -mb-px ${
        activo
          ? "border-candas-rojo text-candas-rojo"
          : "border-transparent text-gray-600 hover:text-gray-900"
      }`}
    >
      {children}
    </button>
  );
}

// =====================================================
// TAB: Introducir resultados
// =====================================================
function ResultadosTab({
  partidos,
  onSave,
}: {
  partidos: Partido[];
  onSave: () => void;
}) {
  const supabase = createClient();
  const [guardando, setGuardando] = useState<number | null>(null);

  const guardar = async (
    id: number,
    goles_local: number,
    goles_visitante: number
  ) => {
    setGuardando(id);
    await supabase
      .from("partidos")
      .update({ goles_local, goles_visitante, jugado: true })
      .eq("id", id);
    setGuardando(null);
    onSave();
  };

  const desmarcar = async (id: number) => {
    setGuardando(id);
    await supabase
      .from("partidos")
      .update({ goles_local: null, goles_visitante: null, jugado: false })
      .eq("id", id);
    setGuardando(null);
    onSave();
  };

  if (partidos.length === 0) {
    return <p className="text-gray-500">No hay partidos cargados.</p>;
  }

  // Agrupar por jornada
  const jornadas = new Map<number, Partido[]>();
  partidos.forEach((p) => {
    if (!jornadas.has(p.jornada)) jornadas.set(p.jornada, []);
    jornadas.get(p.jornada)!.push(p);
  });

  return (
    <div className="space-y-6">
      {Array.from(jornadas.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([jornada, parts]) => (
          <div key={jornada} className="bg-white rounded-xl shadow p-4">
            <h3 className="font-bold text-lg mb-3">Jornada {jornada}</h3>
            <div className="space-y-2">
              {parts.map((p) => (
                <FilaResultado
                  key={p.id}
                  partido={p}
                  onSave={guardar}
                  onUnset={desmarcar}
                  guardando={guardando === p.id}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

function FilaResultado({
  partido,
  onSave,
  onUnset,
  guardando,
}: {
  partido: Partido;
  onSave: (id: number, gl: number, gv: number) => void;
  onUnset: (id: number) => void;
  guardando: boolean;
}) {
  const [gl, setGl] = useState<number>(partido.goles_local ?? 0);
  const [gv, setGv] = useState<number>(partido.goles_visitante ?? 0);

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-2">
      <span className="flex-1 text-sm">
        <span className={partido.local?.nombre === "Candás CF" ? "font-bold" : ""}>
          {partido.local?.nombre}
        </span>
        <span className="mx-2 text-gray-400">vs</span>
        <span
          className={partido.visitante?.nombre === "Candás CF" ? "font-bold" : ""}
        >
          {partido.visitante?.nombre}
        </span>
      </span>
      <input
        type="number"
        min={0}
        value={gl}
        onChange={(e) => setGl(parseInt(e.target.value) || 0)}
        className="w-14 text-center border rounded py-1"
      />
      <span>-</span>
      <input
        type="number"
        min={0}
        value={gv}
        onChange={(e) => setGv(parseInt(e.target.value) || 0)}
        className="w-14 text-center border rounded py-1"
      />
      <button
        onClick={() => onSave(partido.id, gl, gv)}
        disabled={guardando}
        className="bg-candas-rojo text-white px-3 py-1 rounded text-sm font-bold hover:bg-candas-rojoOscuro disabled:opacity-50"
      >
        {guardando ? "..." : partido.jugado ? "Actualizar" : "Guardar"}
      </button>
      {partido.jugado && (
        <button
          onClick={() => onUnset(partido.id)}
          className="text-gray-500 hover:text-red-600 text-xs"
        >
          Deshacer
        </button>
      )}
    </div>
  );
}

// =====================================================
// TAB: Crear partido
// =====================================================
function CrearPartidoTab({
  equipos,
  onSave,
}: {
  equipos: Equipo[];
  onSave: () => void;
}) {
  const supabase = createClient();
  const [jornada, setJornada] = useState(1);
  const [localId, setLocalId] = useState<number | "">("");
  const [visitanteId, setVisitanteId] = useState<number | "">("");
  const [fecha, setFecha] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMensaje(null);
    if (!localId || !visitanteId) {
      setError("Selecciona ambos equipos.");
      return;
    }
    if (localId === visitanteId) {
      setError("Local y visitante no pueden ser el mismo equipo.");
      return;
    }
    setGuardando(true);
    const { error } = await supabase.from("partidos").insert({
      jornada,
      local_id: localId,
      visitante_id: visitanteId,
      fecha: fecha ? new Date(fecha).toISOString() : null,
    });
    setGuardando(false);
    if (error) {
      setError(error.message);
      return;
    }
    setMensaje("Partido creado.");
    setLocalId("");
    setVisitanteId("");
    setFecha("");
    onSave();
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl shadow p-6 max-w-xl space-y-4"
    >
      <div>
        <label className="block text-sm font-medium mb-1">Jornada</label>
        <input
          type="number"
          min={1}
          value={jornada}
          onChange={(e) => setJornada(parseInt(e.target.value) || 1)}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Local</label>
          <select
            value={localId}
            onChange={(e) =>
              setLocalId(e.target.value ? parseInt(e.target.value) : "")
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">--</option>
            {equipos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Visitante</label>
          <select
            value={visitanteId}
            onChange={(e) =>
              setVisitanteId(e.target.value ? parseInt(e.target.value) : "")
            }
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">--</option>
            {equipos.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Fecha (opcional)</label>
        <input
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
        />
      </div>
      {error && (
        <div className="bg-red-50 text-red-700 rounded p-2 text-sm">{error}</div>
      )}
      {mensaje && (
        <div className="bg-green-50 text-green-700 rounded p-2 text-sm">
          {mensaje}
        </div>
      )}
      <button
        type="submit"
        disabled={guardando}
        className="bg-candas-rojo text-white font-bold px-6 py-2 rounded-lg"
      >
        {guardando ? "Guardando..." : "Crear partido"}
      </button>
    </form>
  );
}

// =====================================================
// TAB: Gestión de equipos
// =====================================================
function EquiposTab({
  equipos,
  onSave,
}: {
  equipos: Equipo[];
  onSave: () => void;
}) {
  const supabase = createClient();
  const [nombre, setNombre] = useState("");

  const añadir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    await supabase.from("equipos").insert({ nombre: nombre.trim() });
    setNombre("");
    onSave();
  };

  const borrar = async (id: number) => {
    if (!confirm("¿Seguro? También se borrarán sus partidos.")) return;
    await supabase.from("equipos").delete().eq("id", id);
    onSave();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <form
        onSubmit={añadir}
        className="bg-white rounded-xl shadow p-6 h-fit space-y-3"
      >
        <h3 className="font-bold">Añadir equipo</h3>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del equipo"
          className="w-full border rounded-lg px-3 py-2"
        />
        <button className="bg-candas-rojo text-white font-bold px-4 py-2 rounded-lg">
          Añadir
        </button>
      </form>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-bold mb-3">Equipos ({equipos.length})</h3>
        <ul className="space-y-1 text-sm">
          {equipos.map((e) => (
            <li
              key={e.id}
              className="flex justify-between items-center border-b border-gray-100 py-1"
            >
              <span>{e.nombre}</span>
              <button
                onClick={() => borrar(e.id)}
                className="text-red-600 hover:text-red-800 text-xs"
              >
                Borrar
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
