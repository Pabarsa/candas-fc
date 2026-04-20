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
  const [tab, setTab] = useState<"resultados" | "crear" | "equipos" | "galeria">("resultados");

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
        <TabBtn activo={tab === "galeria"} onClick={() => setTab("galeria")}>
          📸 Galería
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
      {tab === "galeria" && <GaleriaAdminTab />}
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
// TAB: Galería de fotos (posts)
// =====================================================
type Post = {
  id: number;
  titulo: string;
  descripcion: string | null;
  foto_url: string;
  instagram_fotografa: string | null;
  created_at: string;
};

function GaleriaAdminTab() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Form
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [instagram, setInstagram] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const cargar = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts((data as Post[]) ?? []);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []);

  const onArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setArchivo(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const publicar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (!archivo) { setError("Selecciona una foto."); return; }
    if (!titulo.trim()) { setError("El título es obligatorio."); return; }

    setSubiendo(true);
    try {
      // 1. Subir foto al bucket
      const ext = archivo.name.split(".").pop();
      const nombre = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("galeria")
        .upload(nombre, archivo, { contentType: archivo.type });

      if (uploadError) throw new Error(uploadError.message);

      // 2. Obtener URL pública
      const { data: urlData } = supabase.storage
        .from("galeria")
        .getPublicUrl(nombre);

      // 3. Crear el post en la BD
      const { data: { user } } = await supabase.auth.getUser();
      const { error: insertError } = await supabase.from("posts").insert({
        titulo: titulo.trim(),
        descripcion: descripcion.trim() || null,
        foto_url: urlData.publicUrl,
        instagram_fotografa: instagram.trim().replace("@", "") || null,
        created_by: user?.id,
      });

      if (insertError) throw new Error(insertError.message);

      setOk("✅ Foto publicada correctamente.");
      setTitulo(""); setDescripcion(""); setInstagram("");
      setArchivo(null); setPreview(null);
      cargar();
    } catch (err: any) {
      setError(err.message ?? "Error al publicar.");
    } finally {
      setSubiendo(false);
    }
  };

  const borrar = async (post: Post) => {
    if (!confirm(`¿Borrar "${post.titulo}"?`)) return;
    // Extraer nombre de archivo de la URL
    const partes = post.foto_url.split("/");
    const nombreArchivo = partes[partes.length - 1];
    await supabase.storage.from("galeria").remove([nombreArchivo]);
    await supabase.from("posts").delete().eq("id", post.id);
    cargar();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* ── Formulario nuevo post ── */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-black text-lg mb-4">📸 Nueva publicación</h3>
        <form onSubmit={publicar} className="space-y-4">
          {/* Preview foto */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden cursor-pointer hover:border-candas-rojo transition"
            onClick={() => document.getElementById("input-foto")?.click()}
          >
            {preview ? (
              <img src={preview} alt="preview" className="w-full max-h-52 object-cover" />
            ) : (
              <div className="h-36 flex flex-col items-center justify-center text-gray-400 gap-2">
                <span className="text-3xl">🖼️</span>
                <span className="text-sm">Haz clic para seleccionar foto</span>
              </div>
            )}
          </div>
          <input
            id="input-foto"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onArchivo}
          />

          <div>
            <label className="block text-sm font-semibold mb-1">Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Partido vs Narcea · Jornada 31"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-candas-rojo focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Descripción (opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el momento..."
              rows={2}
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-candas-rojo focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">
              Instagram de la fotógrafa (opcional)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-bold">@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace("@", ""))}
                placeholder="nombre_en_instagram"
                className="flex-1 border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-candas-rojo focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Se mostrará un enlace directo a su perfil de Instagram
            </p>
          </div>

          {error && <div className="bg-red-50 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
          {ok && <div className="bg-green-50 text-green-700 rounded-lg p-3 text-sm">{ok}</div>}

          <button
            type="submit"
            disabled={subiendo}
            className="w-full bg-candas-rojo text-white font-black py-3 rounded-xl hover:bg-candas-rojoOscuro transition disabled:opacity-50"
          >
            {subiendo ? "⏳ Subiendo..." : "📤 Publicar foto"}
          </button>
        </form>
      </div>

      {/* ── Lista de posts publicados ── */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-black text-lg mb-4">
          Publicaciones ({posts.length})
        </h3>
        {cargando ? (
          <p className="text-gray-400 text-sm">Cargando...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-400 text-sm">Aún no hay publicaciones.</p>
        ) : (
          <ul className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {posts.map((post) => (
              <li key={post.id} className="flex gap-3 items-start border-b border-gray-100 pb-3">
                <img
                  src={post.foto_url}
                  alt={post.titulo}
                  className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{post.titulo}</p>
                  {post.instagram_fotografa && (
                    <p className="text-xs text-pink-500">@{post.instagram_fotografa}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleDateString("es-ES")}
                  </p>
                </div>
                <button
                  onClick={() => borrar(post)}
                  className="text-red-500 hover:text-red-700 text-xs font-medium flex-shrink-0"
                >
                  Borrar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
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
