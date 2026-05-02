"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Equipo, Partido } from "@/lib/types";
import { useRouter } from "next/navigation";
import VeteranosAdminTab from "./VeteranosAdminTab";
import { comprimirImagen } from "@/lib/imageUtils";

type Props = {
  equipos: Equipo[];
  partidos: Partido[];
};

export default function AdminPanel({ equipos, partidos }: Props) {
  const supabase = createClient();
  const router = useRouter();
  const [tab, setTab] = useState<"resultados" | "crear" | "equipos" | "galeria" | "encuestas" | "plantilla" | "cuerpo" | "directo" | "veteranos">("resultados");

  return (
    <div>
      <div className="flex gap-2 mb-6 border-b border-white/5 flex-wrap overflow-x-auto">
        <TabBtn activo={tab === "resultados"} onClick={() => setTab("resultados")}>
           Resultados
        </TabBtn>
        <TabBtn activo={tab === "crear"} onClick={() => setTab("crear")}>
          Crear partido
        </TabBtn>
        <TabBtn activo={tab === "equipos"} onClick={() => setTab("equipos")}>
          Equipos
        </TabBtn>
        <TabBtn activo={tab === "galeria"} onClick={() => setTab("galeria")}>
           Galería
        </TabBtn>
        <TabBtn activo={tab === "encuestas"} onClick={() => setTab("encuestas")}>
           Encuestas
        </TabBtn>
        <TabBtn activo={tab === "plantilla"} onClick={() => setTab("plantilla")}>
          Plantilla
        </TabBtn>
        <TabBtn activo={tab === "cuerpo"} onClick={() => setTab("cuerpo")}>
          Cuerpo técnico
        </TabBtn>
        <TabBtn activo={tab === "directo"} onClick={() => setTab("directo")}>
          Directo
        </TabBtn>
        <TabBtn activo={tab === "veteranos"} onClick={() => setTab("veteranos")}>
          Veteranos
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
      {tab === "encuestas" && <EncuestasAdminTab partidos={partidos} />}
      {tab === "plantilla" && <PlantillaAdminTab />}
      {tab === "cuerpo" && <CuerpoTecnicoAdminTab />}
      {tab === "directo" && <DirectoAdminTab />}
      {tab === "veteranos" && <VeteranosAdminTab />}
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
          : "border-transparent text-white/30 hover:text-white/70"
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

    // Abrir WhatsApp automáticamente con el resultado
    const res = await fetch("/api/notificar-resultado", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ partidoId: id }),
    });
    const data = await res.json();
    if (data.url) window.open(data.url, "_blank", "noopener,noreferrer");
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
    return <p className="text-white/40">No hay partidos cargados.</p>;
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
          <div key={jornada} className="card-dark rounded-xl p-4">
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
  const [compartido, setCompartido] = useState(false);

  const compartirWhatsApp = () => {
    const local = partido.local?.nombre ?? "";
    const visitante = partido.visitante?.nombre ?? "";
    const texto = ` Resultado Jornada ${partido.jornada}\n\n${local} ${gl} - ${gv} ${visitante}\n\n fondosurcanijo.com`;
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener,noreferrer");
    setCompartido(true);
  };

  return (
    <div className="border-b border-white/5 pb-3 last:border-0 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex-1 text-sm">
          <span className={partido.local?.nombre === "Candás CF" ? "font-bold" : ""}>
            {partido.local?.nombre}
          </span>
          <span className="mx-2 text-white/20">vs</span>
          <span className={partido.visitante?.nombre === "Candás CF" ? "font-bold" : ""}>
            {partido.visitante?.nombre}
          </span>
        </span>
        <input
          type="number"
          min={0}
          value={gl}
          onChange={(e) => setGl(parseInt(e.target.value) || 0)}
          className="w-14 text-center bg-surface-2 border border-white/10 rounded-lg py-1 text-sm font-bold text-white focus:outline-none focus:border-candas-rojo"
        />
        <span>-</span>
        <input
          type="number"
          min={0}
          value={gv}
          onChange={(e) => setGv(parseInt(e.target.value) || 0)}
          className="w-14 text-center bg-surface-2 border border-white/10 rounded-lg py-1 text-sm font-bold text-white focus:outline-none focus:border-candas-rojo"
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
            className="text-white/30 hover:text-red-400 text-xs"
          >
            Deshacer
          </button>
        )}
      </div>
      {/* Botón WhatsApp solo cuando está guardado */}
      {partido.jugado && (
        <button
          onClick={compartirWhatsApp}
          className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition ${
            compartido ? "bg-white/5 text-white/20" : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          {compartido ? "¡Compartido!" : "Compartir resultado"}
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
      className="card-dark rounded-2xl p-6 max-w-xl space-y-4"
    >
      <div>
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1">Jornada</label>
        <input
          type="number"
          min={1}
          value={jornada}
          onChange={(e) => setJornada(parseInt(e.target.value) || 1)}
          className="w-full bg-surface-2 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-candas-rojo"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1">Local</label>
          <select
            value={localId}
            onChange={(e) =>
              setLocalId(e.target.value ? parseInt(e.target.value) : "")
            }
            className="w-full bg-surface-2 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-candas-rojo"
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
          <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1">Visitante</label>
          <select
            value={visitanteId}
            onChange={(e) =>
              setVisitanteId(e.target.value ? parseInt(e.target.value) : "")
            }
            className="w-full bg-surface-2 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-candas-rojo"
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
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1">Fecha (opcional)</label>
        <input
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full bg-surface-2 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-candas-rojo"
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
type TipoPost = "previa" | "partido" | "aficion" | "general";

const TIPO_LABELS: Record<TipoPost, { label: string; emoji: string; color: string }> = {
  previa:  { label: "Previa del partido", emoji: "📣", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  partido: { label: "Fotos del partido",  emoji: "📸", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  aficion: { label: "Afición",            emoji: "🙌", color: "bg-candas-rojo/20 text-red-300 border-candas-rojo/30" },
  general: { label: "General / Club",     emoji: "🔴", color: "bg-white/10 text-white/50 border-white/10" },
};

type Post = {
  id: number;
  titulo: string;
  descripcion: string | null;
  foto_url: string;
  instagram_fotografa: string | null;
  tipo: TipoPost;
  created_at: string;
};

function GaleriaAdminTab() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // Form nuevo post
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tipo, setTipo] = useState<TipoPost>("general");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [partidoId, setPartidoId] = useState<number | "">(""); 
  const [partidos, setPartidos] = useState<any[]>([]);

  // Subida masiva ZIP
  const [zipTitulo, setZipTitulo] = useState("");
  const [zipDescripcion, setZipDescripcion] = useState("");
  const [zipInstagram, setZipInstagram] = useState("");
  const [zipTipo, setZipTipo] = useState<TipoPost>("partido");
  const [zipPartidoId, setZipPartidoId] = useState<number | "">(""); 
  const [zipProgreso, setZipProgreso] = useState<string | null>(null);
  const [zipSubiendo, setZipSubiendo] = useState(false);

  const subirZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!zipTitulo.trim()) { setError("Pon un t\u00edtulo antes de subir el ZIP."); return; }
    setError(null); setOk(null); setZipSubiendo(true);
    try {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(file);
      const imagenes = Object.values(zip.files).filter((f: any) =>
        !f.dir && /\.(jpe?g|png|webp)$/i.test(f.name)
      );
      if (imagenes.length === 0) { setError("El ZIP no contiene im\u00e1genes."); setZipSubiendo(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      let ok_count = 0;
      for (let i = 0; i < imagenes.length; i++) {
        const zipFile = imagenes[i] as any;
        setZipProgreso(`Subiendo ${i + 1} de ${imagenes.length}...`);
        const blob = await zipFile.async("blob");
        const imgFile = new File([blob], zipFile.name, { type: "image/jpeg" });
        const comprimido = await comprimirImagen(imgFile);
        const nombre = `${Date.now()}_${i}.jpg`;
        const { error: upErr } = await supabase.storage.from("galeria").upload(nombre, comprimido, { contentType: "image/jpeg" });
        if (upErr) { console.error(upErr); continue; }
        const { data: urlData } = supabase.storage.from("galeria").getPublicUrl(nombre);
        await supabase.from("posts").insert({
          titulo: zipTitulo.trim(),
          descripcion: zipDescripcion.trim() || null,
          foto_url: urlData.publicUrl,
          instagram_fotografa: zipTipo === "previa" ? null : (zipInstagram.trim().replace("@", "") || null),
          tipo: zipTipo,
          created_by: user?.id,
          partido_id: zipPartidoId || null,
        });
        ok_count++;
      }
      setOk(`\u2705 ${ok_count} fotos subidas correctamente.`);
      setZipProgreso(null);
      setZipTitulo(""); setZipDescripcion(""); setZipInstagram("");
      cargar();
    } catch (err: any) {
      setError(err.message ?? "Error al procesar el ZIP.");
    } finally {
      setZipSubiendo(false);
      setZipProgreso(null);
      e.target.value = "";
    }
  };

  // Edición inline
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editTitulo, setEditTitulo] = useState("");
  const [editDescripcion, setEditDescripcion] = useState("");
  const [editInstagram, setEditInstagram] = useState("");
  const [editTipo, setEditTipo] = useState<TipoPost>("general");
  const [guardando, setGuardando] = useState(false);

  // Subida masiva
  const [modoMasivo, setModoMasivo] = useState(false);
  const [archivosMasivos, setArchivosMasivos] = useState<File[]>([]);
  const [progresoMasivo, setProgresoMasivo] = useState<{done: number; total: number} | null>(null);

  const cargar = async () => {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    setPosts((data as Post[]) ?? []);
    setCargando(false);
  };

  useEffect(() => {
    cargar();
    supabase
      .from("partidos")
      .select("id, jornada, local:equipos!partidos_local_id_fkey(nombre), visitante:equipos!partidos_visitante_id_fkey(nombre)")
      .order("jornada", { ascending: false })
      .then(({ data }) => setPartidos((data as any[]) ?? []));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      // 1. Comprimir imagen antes de subir
      const archivoComprimido = await comprimirImagen(archivo);
      const nombre = `${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("galeria")
        .upload(nombre, archivoComprimido, { contentType: "image/jpeg" });

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
        instagram_fotografa: tipo === "previa" ? null : (instagram.trim().replace("@", "") || null),
        tipo,
        created_by: user?.id,
        partido_id: partidoId || null,
      });

      if (insertError) throw new Error(insertError.message);

      setOk("✅ Foto publicada correctamente.");
      setTitulo(""); setDescripcion(""); setInstagram("");
      setArchivo(null); setPreview(null); setPartidoId(""); setTipo("general");
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

  const empezarEdicion = (post: Post) => {
    setEditandoId(post.id);
    setEditTitulo(post.titulo);
    setEditDescripcion(post.descripcion ?? "");
    setEditInstagram(post.instagram_fotografa ?? "");
    setEditTipo(post.tipo ?? "general");
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setEditTitulo("");
    setEditDescripcion("");
    setEditInstagram("");
  };

  const publicarMasivo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (archivosMasivos.length === 0) { setError("Selecciona al menos una foto."); return; }
    if (!titulo.trim()) { setError("El título es obligatorio."); return; }
    setError(null); setOk(null); setSubiendo(true);
    setProgresoMasivo({ done: 0, total: archivosMasivos.length });
    let subidos = 0;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      for (const archivo of archivosMasivos) {
        const comprimido = await comprimirImagen(archivo);
        const nombre = `${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
        const { error: uploadError } = await supabase.storage.from("galeria").upload(nombre, comprimido, { contentType: "image/jpeg" });
        if (uploadError) throw new Error(uploadError.message);
        const { data: urlData } = supabase.storage.from("galeria").getPublicUrl(nombre);
        await supabase.from("posts").insert({
          titulo: titulo.trim(),
          descripcion: descripcion.trim() || null,
          foto_url: urlData.publicUrl,
          instagram_fotografa: tipo === "previa" ? null : (instagram.trim().replace("@", "") || null),
          tipo,
          created_by: user?.id,
          partido_id: partidoId || null,
        });
        subidos++;
        setProgresoMasivo({ done: subidos, total: archivosMasivos.length });
      }
      setOk(`✅ ${subidos} fotos publicadas correctamente.`);
      setTitulo(""); setDescripcion(""); setInstagram(""); setArchivosMasivos([]);
      setPartidoId(""); setTipo("general"); setModoMasivo(false); setProgresoMasivo(null);
      cargar();
    } catch (err: any) {
      setError(err.message ?? "Error al publicar.");
    } finally {
      setSubiendo(false);
    }
  };

  const guardarEdicion = async (postId: number) => {
    if (!editTitulo.trim()) return;
    setGuardando(true);
    await supabase.from("posts").update({
      titulo: editTitulo.trim(),
      descripcion: editDescripcion.trim() || null,
      instagram_fotografa: editTipo === "previa" ? null : (editInstagram.trim().replace("@", "") || null),
      tipo: editTipo,
    }).eq("id", postId);
    setGuardando(false);
    setEditandoId(null);
    cargar();
  };

  const [mostrarZip, setMostrarZip] = useState(false);

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* ── Modal ZIP ── */}
      {mostrarZip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="card-dark rounded-2xl p-6 w-full max-w-md space-y-4">
            <h3 className="font-black text-lg">🗜️ Subir ZIP de fotos</h3>
            <p className="text-xs text-white/40">Rellena los datos — se aplicarán a todas las fotos del ZIP.</p>
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Tipo *</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.entries(TIPO_LABELS) as [TipoPost, typeof TIPO_LABELS[TipoPost]][]).map(([key, val]) => (
                  <button key={key} type="button" onClick={() => setZipTipo(key)}
                    className={`flex flex-col items-center gap-1 py-2 px-2 rounded-xl border text-xs font-bold transition ${zipTipo === key ? val.color + " ring-2 ring-white/20" : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"}`}>
                    <span className="text-lg">{val.emoji}</span>
                    <span className="leading-tight text-center">{val.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <input type="text" value={zipTitulo} onChange={e => setZipTitulo(e.target.value)}
              placeholder="Título * (ej: J32 · Gozón CF 0-0 Candás CF)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none" />
            <input type="text" value={zipDescripcion} onChange={e => setZipDescripcion(e.target.value)}
              placeholder="Descripción (opcional)"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none" />
            {zipTipo !== "previa" && (
              <div className="flex items-center gap-2">
                <span className="text-white/20 font-bold">@</span>
                <input type="text" value={zipInstagram} onChange={e => setZipInstagram(e.target.value.replace("@",""))}
                  placeholder="instagram_fotografo"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none" />
              </div>
            )}
            <select value={zipPartidoId} onChange={e => setZipPartidoId(e.target.value ? parseInt(e.target.value) : "")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none">
              <option value="">Sin partido</option>
              {partidos.map(p => (
                <option key={p.id} value={p.id}>J{p.jornada} · {(p.local as any)?.nombre} vs {(p.visitante as any)?.nombre}</option>
              ))}
            </select>
            {zipProgreso && (
              <div className="text-sm text-candas-rojo font-bold text-center animate-pulse">{zipProgreso}</div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={() => setMostrarZip(false)}
                className="flex-1 py-2 rounded-xl border border-white/10 text-white/40 text-sm font-bold hover:bg-white/5 transition">
                Cancelar
              </button>
              <button type="button" disabled={zipSubiendo || !zipTitulo.trim()}
                onClick={() => document.getElementById("input-zip-real")?.click()}
                className="flex-1 py-2 rounded-xl bg-candas-rojo text-white text-sm font-bold disabled:opacity-40 hover:bg-red-700 transition">
                {zipSubiendo ? "Subiendo..." : "Seleccionar ZIP"}
              </button>
              <input id="input-zip-real" type="file" accept=".zip" className="hidden"
                onChange={async (e) => { await subirZip(e); setMostrarZip(false); }} />
            </div>
          </div>
        </div>
      )}
      {/* ── Formulario nuevo post ── */}
      <div className="card-dark rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg"> Nueva publicación</h3>
          <button
            type="button"
            onClick={() => { setModoMasivo(!modoMasivo); setArchivosMasivos([]); setArchivo(null); setPreview(null); }}
            className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition ${modoMasivo ? "bg-candas-rojo border-candas-rojo text-white" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"}`}
          >
            {modoMasivo ? "📦 Subida masiva activa" : "📦 Subida masiva"}
          </button>
          <button
            type="button"
            onClick={() => setMostrarZip(true)}
            className="text-xs px-3 py-1.5 rounded-lg border font-bold transition bg-white/5 border-white/10 text-white/40 hover:bg-white/10 ml-2"
          >
            🗜️ Subir ZIP
          </button>
        </div>
        <form onSubmit={modoMasivo ? publicarMasivo : publicar} className="space-y-4">
          {/* ── Tipo de publicación ── */}
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">Tipo de publicación *</label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(TIPO_LABELS) as [TipoPost, typeof TIPO_LABELS[TipoPost]][]).map(([key, val]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setTipo(key);
                    if (key === "previa") setInstagram("");
                  }}
                  className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border text-xs font-bold transition ${
                    tipo === key
                      ? val.color + " ring-2 ring-offset-1 ring-offset-transparent ring-white/20"
                      : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10"
                  }`}
                >
                  <span className="text-lg">{val.emoji}</span>
                  <span className="leading-tight text-center">{val.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preview foto */}
          {modoMasivo ? (
            <div>
              <div
                className="border-2 border-dashed border-candas-rojo/40 rounded-xl overflow-hidden cursor-pointer hover:border-candas-rojo transition p-6 text-center"
                onClick={() => document.getElementById("input-masivo")?.click()}
              >
                <div className="flex flex-col items-center gap-2 text-white/40">
                  <span className="text-4xl">📦</span>
                  <span className="text-sm font-bold">Seleccionar múltiples fotos</span>
                  {archivosMasivos.length > 0
                    ? <span className="text-candas-rojo font-black text-lg">{archivosMasivos.length} fotos seleccionadas</span>
                    : <span className="text-xs">Mantén Ctrl o Cmd para seleccionar varias</span>
                  }
                </div>
              </div>
              <input
                id="input-masivo"
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => setArchivosMasivos(Array.from(e.target.files ?? []))}
              />
              {progresoMasivo && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>Subiendo...</span>
                    <span>{progresoMasivo.done}/{progresoMasivo.total}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-candas-rojo h-2 rounded-full transition-all"
                      style={{ width: `${(progresoMasivo.done / progresoMasivo.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div
                className="border-2 border-dashed border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-candas-rojo transition"
                onClick={() => document.getElementById("input-foto")?.click()}
              >
                {preview ? (
                  <img src={preview} alt="preview" className="w-full max-h-52 object-cover" />
                ) : (
                  <div className="h-36 flex flex-col items-center justify-center text-white/20 gap-2">
                    <span className="text-3xl"></span>
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
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1">Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Partido vs Narcea · Jornada 31"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1">Descripción (opcional)</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describe el momento..."
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1">
              Partido (opcional)
            </label>
            <select
              value={partidoId}
              onChange={(e) => setPartidoId(e.target.value ? parseInt(e.target.value) : "")}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none"
            >
              <option value="">General (sin partido)</option>
              {partidos.map((p) => (
                <option key={p.id} value={p.id}>
                  J{p.jornada} · {(p.local as any)?.nombre} vs {(p.visitante as any)?.nombre}
                </option>
              ))}
            </select>
            <p className="text-xs text-white/20 mt-1">
              Asocia la foto a un partido para que aparezca en su página
            </p>
          </div>

          {tipo !== "previa" && (
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1">
              Instagram de la fotógrafa (opcional)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-white/20 font-bold">@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace("@", ""))}
                placeholder="nombre_en_instagram"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none"
              />
            </div>
            <p className="text-xs text-white/20 mt-1">
              Se mostrará un enlace directo a su perfil de Instagram
            </p>
          </div>
          )}

          {error && <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl p-3 text-sm">{error}</div>}
          {ok && <div className="bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl p-3 text-sm">{ok}</div>}

          <button
            type="submit"
            disabled={subiendo}
            className="w-full bg-candas-rojo text-white font-black py-3 rounded-xl hover:bg-candas-rojoOscuro transition disabled:opacity-50"
          >
            {subiendo ? " Subiendo..." : " Publicar foto"}
          </button>
        </form>
      </div>

      {/* ── Lista de posts publicados ── */}
      <div className="card-dark rounded-xl p-6">
        <h3 className="font-black text-lg mb-4">
          Publicaciones ({posts.length})
        </h3>
        {cargando ? (
          <p className="text-white/20 text-sm">Cargando...</p>
        ) : posts.length === 0 ? (
          <p className="text-white/20 text-sm">Aún no hay publicaciones.</p>
        ) : (
          <ul className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {posts.map((post) => (
              <li key={post.id} className="border-b border-white/5 pb-3 last:border-0">
                {editandoId === post.id ? (
                  /* ── Modo edición ── */
                  <div className="flex gap-3 items-start">
                    <img
                      src={post.foto_url}
                      alt={post.titulo}
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={editTitulo}
                        onChange={(e) => setEditTitulo(e.target.value)}
                        placeholder="Título"
                        className="w-full bg-white/5 border-2 border-candas-rojo rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none"
                        autoFocus
                      />
                      <textarea
                        value={editDescripcion}
                        onChange={(e) => setEditDescripcion(e.target.value)}
                        placeholder="Descripción (opcional)"
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-candas-rojo focus:outline-none resize-none"
                      />
                      <select
                        value={editTipo}
                        onChange={(e) => setEditTipo(e.target.value as TipoPost)}
                        className="w-full bg-surface-2 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-candas-rojo focus:outline-none"
                      >
                        {(Object.entries(TIPO_LABELS) as [TipoPost, typeof TIPO_LABELS[TipoPost]][]).map(([k, v]) => (
                          <option key={k} value={k}>{v.emoji} {v.label}</option>
                        ))}
                      </select>
                      {editTipo !== "previa" && (
                      <div className="flex items-center gap-1">
                        <span className="text-white/20 text-sm font-bold">@</span>
                        <input
                          type="text"
                          value={editInstagram}
                          onChange={(e) => setEditInstagram(e.target.value.replace("@", ""))}
                          placeholder="instagram (opcional)"
                          className="flex-1 bg-surface-2 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-candas-rojo focus:outline-none"
                        />
                      </div>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => guardarEdicion(post.id)}
                          disabled={guardando}
                          className="bg-candas-rojo text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-candas-rojoOscuro transition disabled:opacity-50"
                        >
                          {guardando ? "Guardando..." : "✓ Guardar"}
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          className="text-white/30 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* ── Modo normal ── */
                  <div className="flex gap-3 items-start">
                    <img
                      src={post.foto_url}
                      alt={post.titulo}
                      className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {post.tipo && post.tipo !== "general" && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${TIPO_LABELS[post.tipo]?.color}`}>
                            {TIPO_LABELS[post.tipo]?.emoji} {post.tipo === "previa" ? "PREVIA" : "PARTIDO"}
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-sm truncate">{post.titulo}</p>
                      {post.instagram_fotografa && (
                        <p className="text-xs text-pink-500">@{post.instagram_fotografa}</p>
                      )}
                      <p className="text-xs text-white/30">
                        {new Date(post.created_at).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button
                        onClick={() => empezarEdicion(post)}
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => borrar(post)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Borrar
                      </button>
                    </div>
                  </div>
                )}
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
        className="card-dark rounded-xl p-6 h-fit space-y-3"
      >
        <h3 className="font-bold">Añadir equipo</h3>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre del equipo"
          className="w-full bg-surface-2 border border-white/10 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-candas-rojo"
        />
        <button className="bg-candas-rojo text-white font-bold px-4 py-2 rounded-lg">
          Añadir
        </button>
      </form>

      <div className="card-dark rounded-xl p-6">
        <h3 className="font-bold mb-3">Equipos ({equipos.length})</h3>
        <ul className="space-y-1 text-sm">
          {equipos.map((e) => (
            <li
              key={e.id}
              className="flex justify-between items-center border-b border-white/5 py-2"
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

// =====================================================
// TAB: Encuestas
// =====================================================
type Encuesta = { id: number; titulo: string; activa: boolean; created_at: string };
type Jugador = { id: number; nombre: string };
type VotoRes = { jugador_id: number; jugadores: { nombre: string } | null; count: number };

function EncuestasAdminTab({ partidos }: { partidos: Partido[] }) {
  const supabase = createClient();
  const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
  const [jugadores, setJugadores] = useState<Jugador[]>([]);
  const [titulo, setTitulo] = useState(" ¿Quién fue el mejor jugador?");
  const [creando, setCreando] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [resultados, setResultados] = useState<{ [id: number]: { nombre: string; votos: number }[] }>({});

  const cargar = async () => {
    const { data: enc } = await supabase
      .from("encuestas")
      .select("*")
      .order("created_at", { ascending: false });
    setEncuestas((enc ?? []) as Encuesta[]);

    const { data: jug } = await supabase
      .from("jugadores")
      .select("id, nombre")
      .eq("activo", true)
      .order("nombre");
    setJugadores((jug ?? []) as Jugador[]);
  };

  useEffect(() => {
    cargar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarResultados = async (encuestaId: number) => {
    const { data } = await supabase
      .from("votos")
      .select("jugador_id, jugadores(nombre)")
      .eq("encuesta_id", encuestaId);

    const conteo = new Map<number, { nombre: string; votos: number }>();
    (data ?? []).forEach((v: any) => {
      const id = v.jugador_id;
      const nombre = v.jugadores?.nombre ?? "?";
      if (!conteo.has(id)) conteo.set(id, { nombre, votos: 0 });
      conteo.get(id)!.votos++;
    });

    const sorted = Array.from(conteo.values()).sort((a, b) => b.votos - a.votos);
    setResultados((prev) => ({ ...prev, [encuestaId]: sorted }));
  };

  const [notificando, setNotificando] = useState<number | null>(null);
  const [notifOk, setNotifOk] = useState<string | null>(null);

  const notificar = async (enc: Encuesta) => {
    if (!confirm(`¿Enviar email a todos los abonados para votar en "${enc.titulo}"?`)) return;
    setNotificando(enc.id);
    setNotifOk(null);
    try {
      const res = await fetch("/api/notificar-encuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: enc.titulo, encuestaId: enc.id }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setNotifOk(`✅ Email enviado a ${data.enviados} abonados.`);
    } catch (err: any) {
      setNotifOk(`❌ Error: ${err.message}`);
    } finally {
      setNotificando(null);
    }
  };

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    setCreando(true);
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("encuestas").insert({
      titulo: titulo.trim(),
      activa: true,
      created_by: user?.id,
    });
    setOk("✅ Encuesta creada y activa.");
    setTitulo(" ¿Quién fue el mejor jugador?");
    setCreando(false);
    cargar();
  };

  const toggleActiva = async (enc: Encuesta) => {
    await supabase.from("encuestas").update({ activa: !enc.activa }).eq("id", enc.id);
    cargar();
  };

  const borrarEncuesta = async (id: number) => {
    if (!confirm("¿Borrar esta encuesta y todos sus votos?")) return;
    await supabase.from("encuestas").delete().eq("id", id);
    cargar();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Crear encuesta */}
      <div className="card-dark rounded-xl p-6">
        <h3 className="font-black text-lg mb-4"> Nueva encuesta</h3>
        <form onSubmit={crear} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1">Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none"
              placeholder=" ¿Quién fue el mejor jugador?"
            />
            <p className="text-xs text-white/20 mt-1">
              Los abonados votan entre los 23 jugadores de la plantilla.
            </p>
          </div>
          {ok && <div className="bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl p-3 text-sm">{ok}</div>}
          <button
            type="submit"
            disabled={creando}
            className="w-full bg-candas-rojo text-white font-black py-3 rounded-xl hover:bg-candas-rojoOscuro transition disabled:opacity-50"
          >
            {creando ? "Creando..." : " Crear encuesta"}
          </button>
        </form>

        {/* Plantilla */}
        <div className="mt-6">
          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Plantilla ({jugadores.length} jugadores)</p>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {jugadores.map((j) => (
              <p key={j.id} className="text-xs text-white/40 px-2 py-0.5 hover:bg-white/5 rounded">{j.nombre}</p>
            ))}
          </div>
        </div>
      </div>

      {/* Lista encuestas */}
      <div className="card-dark rounded-xl p-6">
        <h3 className="font-black text-lg mb-4">Encuestas ({encuestas.length})</h3>
        {notifOk && (
          <div className={`text-xs rounded-xl p-2 mb-3 ${notifOk.startsWith("") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {notifOk}
          </div>
        )}
        {encuestas.length === 0 ? (
          <p className="text-sm text-gray-400">Aún no hay encuestas.</p>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {encuestas.map((enc) => (
              <div key={enc.id} className="card-dark rounded-xl p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{enc.titulo}</p>
                    <p className="text-xs text-white/30">
                      {new Date(enc.created_at).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 items-center">
                    <button
                      onClick={() => notificar(enc)}
                      disabled={notificando === enc.id}
                      title="Enviar email a todos los abonados"
                      className="text-xs px-2 py-1 rounded-full font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
                    >
                      {notificando === enc.id ? "" : ""}
                    </button>
                    <button
                      onClick={() => toggleActiva(enc)}
                      className={`text-xs px-2 py-1 rounded-full font-bold ${enc.activa ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/30"}`}
                    >
                      {enc.activa ? "Activa" : "Cerrada"}
                    </button>
                    <button onClick={() => borrarEncuesta(enc.id)} className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  </div>
                </div>

                {/* Ver resultados */}
                {resultados[enc.id] ? (
                  <div className="space-y-1 mt-2">
                    {resultados[enc.id].slice(0, 5).map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="text-white/20 w-4">{i + 1}º</span>
                        <span className="flex-1 truncate">{r.nombre}</span>
                        <span className="font-bold text-candas-rojo">{r.votos}</span>
                      </div>
                    ))}
                    {resultados[enc.id].length === 0 && (
                      <p className="text-xs text-white/30">Sin votos todavía.</p>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => cargarResultados(enc.id)}
                    className="text-xs text-candas-rojo hover:underline"
                  >
                    Ver resultados
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// =====================================================
// TAB: Gestión de plantilla
// =====================================================
type JugadorAdmin = {
  id: number;
  nombre: string;
  dorsal: number | null;
  posicion: string | null;
  activo: boolean;
  foto_url: string | null;
};

const POSICIONES = ["Portero", "Defensa", "Centrocampista", "Delantero"];

function PlantillaAdminTab() {
  const supabase = createClient();
  const [jugadores, setJugadores] = useState<JugadorAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDorsal, setEditDorsal] = useState<string>("");
  const [editPosicion, setEditPosicion] = useState("");
  const [guardando, setGuardando] = useState(false);
  // Nuevo jugador
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoDorsal, setNuevoDorsal] = useState("");
  const [nuevaPosicion, setNuevaPosicion] = useState("");
  const [añadiendo, setAñadiendo] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [subiendoFotoId, setSubiendoFotoId] = useState<number | null>(null);

  const subirFoto = async (jugadorId: number, archivo: File) => {
    setSubiendoFotoId(jugadorId);
    const comprimido = await comprimirImagen(archivo);
    const nombre = `jugador_${jugadorId}_${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage
      .from("galeria")
      .upload(`jugadores/${nombre}`, comprimido, { contentType: "image/jpeg", upsert: true });
    if (!uploadError) {
      const { data: urlData } = supabase.storage.from("galeria").getPublicUrl(`jugadores/${nombre}`);
      await supabase.from("jugadores").update({ foto_url: urlData.publicUrl }).eq("id", jugadorId);
      cargar();
    }
    setSubiendoFotoId(null);
  };

  const cargar = async () => {
    const { data } = await supabase
      .from("jugadores")
      .select("id, nombre, dorsal, posicion, activo, foto_url")
      .order("dorsal", { ascending: true, nullsFirst: false });
    setJugadores((data as JugadorAdmin[]) ?? []);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const empezarEdicion = (j: JugadorAdmin) => {
    setEditandoId(j.id);
    setEditNombre(j.nombre);
    setEditDorsal(j.dorsal?.toString() ?? "");
    setEditPosicion(j.posicion ?? "");
  };

  const cancelarEdicion = () => setEditandoId(null);

  const guardarEdicion = async (id: number) => {
    if (!editNombre.trim()) return;
    setGuardando(true);
    await supabase.from("jugadores").update({
      nombre: editNombre.trim(),
      dorsal: editDorsal ? parseInt(editDorsal) : null,
      posicion: editPosicion || null,
    }).eq("id", id);
    setGuardando(false);
    setEditandoId(null);
    cargar();
  };

  const toggleActivo = async (j: JugadorAdmin) => {
    await supabase.from("jugadores").update({ activo: !j.activo }).eq("id", j.id);
    cargar();
  };

  const añadirJugador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;
    setAñadiendo(true);
    await supabase.from("jugadores").insert({
      nombre: nuevoNombre.trim(),
      dorsal: nuevoDorsal ? parseInt(nuevoDorsal) : null,
      posicion: nuevaPosicion || null,
      activo: true,
    });
    setNuevoNombre(""); setNuevoDorsal(""); setNuevaPosicion("");
    setMostrarForm(false);
    setOk("✅ Jugador añadido.");
    setTimeout(() => setOk(null), 3000);
    setAñadiendo(false);
    cargar();
  };

  const activos = jugadores.filter(j => j.activo);
  const inactivos = jugadores.filter(j => !j.activo);

  if (cargando) return <p className="text-white/20 text-sm">Cargando plantilla...</p>;

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <strong>{activos.length}</strong> jugadores activos · <strong>{inactivos.length}</strong> inactivos
        </p>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-candas-rojo text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-candas-rojoOscuro transition"
        >
          {mostrarForm ? "Cancelar" : " Añadir jugador"}
        </button>
      </div>

      {/* Form nuevo jugador */}
      {mostrarForm && (
        <form onSubmit={añadirJugador} className="card-dark rounded-xl p-5">
          <h3 className="font-black mb-4">Nuevo jugador</h3>
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nombre *</label>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Nombre completo"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Dorsal</label>
              <input
                type="number"
                value={nuevoDorsal}
                onChange={(e) => setNuevoDorsal(e.target.value)}
                placeholder="Nº"
                min={1} max={99}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Posición</label>
              <select
                value={nuevaPosicion}
                onChange={(e) => setNuevaPosicion(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none"
              >
                <option value="">Sin especificar</option>
                {POSICIONES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={añadiendo}
            className="bg-candas-rojo text-white font-black px-6 py-2 rounded-xl text-sm hover:bg-candas-rojoOscuro transition disabled:opacity-50"
          >
            {añadiendo ? "Añadiendo..." : "Añadir"}
          </button>
        </form>
      )}

      {ok && <p className="text-green-400 text-sm font-semibold">{ok}</p>}

      {/* Lista activos */}
      <div className="card-dark rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-white/3 border-b border-white/5">
          <h3 className="font-black text-sm">Plantilla activa ({activos.length})</h3>
        </div>
        <ul className="divide-y divide-white/5">
          {activos.map((j) => (
            <li key={j.id} className="px-4 py-3">
              {editandoId === j.id ? (
                <div className="space-y-2">
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className="border-2 border-candas-rojo rounded-lg px-2 py-1.5 text-sm focus:outline-none"
                      autoFocus
                    />
                    <input
                      type="number"
                      value={editDorsal}
                      onChange={(e) => setEditDorsal(e.target.value)}
                      placeholder="Dorsal"
                      min={1} max={99}
                      className="bg-surface-2 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-candas-rojo focus:outline-none"
                    />
                    <select
                      value={editPosicion}
                      onChange={(e) => setEditPosicion(e.target.value)}
                      className="bg-surface-2 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-candas-rojo focus:outline-none"
                    >
                      <option value="">Sin especificar</option>
                      {POSICIONES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => guardarEdicion(j.id)}
                      disabled={guardando}
                      className="bg-candas-rojo text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-candas-rojoOscuro transition disabled:opacity-50"
                    >
                      {guardando ? "..." : "✓ Guardar"}
                    </button>
                    <button
                      onClick={cancelarEdicion}
                      className="text-white/30 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {/* Foto o dorsal */}
                  {j.foto_url ? (
                    <img src={j.foto_url} alt={j.nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                  ) : (
                    <div className="w-10 h-10 bg-candas-rojo text-white rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">
                      {j.dorsal ?? "—"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{j.nombre}</p>
                    <p className="text-xs text-white/30">
                      {j.dorsal ? `#${j.dorsal}` : ""}{j.dorsal && j.posicion ? " · " : ""}{j.posicion ?? ""}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 items-center">
                    {/* Subir foto */}
                    <label className={`cursor-pointer text-xs font-medium transition ${subiendoFotoId === j.id ? "text-white/30" : "text-candas-rojo hover:text-white"}`}>
                      {subiendoFotoId === j.id ? "Subiendo..." : j.foto_url ? " Cambiar" : " Foto"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={subiendoFotoId !== null}
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) subirFoto(j.id, f);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <button
                      onClick={() => empezarEdicion(j)}
                      className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => toggleActivo(j)}
                      className="text-xs font-medium text-white/20 hover:text-red-400 transition-colors"
                    >
                      Desactivar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Lista inactivos */}
      {inactivos.length > 0 && (
        <div className="card-dark rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-white/3 border-b border-white/5">
            <h3 className="font-black text-sm text-gray-400">Inactivos / baja ({inactivos.length})</h3>
          </div>
          <ul className="divide-y divide-white/5">
            {inactivos.map((j) => (
              <li key={j.id} className="px-4 py-3 flex items-center gap-3 opacity-50">
                <div className="w-8 h-8 bg-gray-300 text-white rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">
                  {j.dorsal ?? "—"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm line-through">{j.nombre}</p>
                  {j.posicion && <p className="text-xs text-white/30">{j.posicion}</p>}
                </div>
                <button
                  onClick={() => toggleActivo(j)}
                  className="text-green-600 hover:text-green-700 text-xs font-medium flex-shrink-0"
                >
                  Reactivar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// =====================================================
// TAB: Cuerpo técnico
// =====================================================
type MiembroCT = {
  id: number;
  nombre: string;
  cargo: string;
  foto_url: string | null;
  orden: number;
  activo: boolean;
};

const CARGOS = [
  "Primer entrenador",
  "Segundo entrenador",
  "Preparador físico",
  "Entrenador de porteros",
  "Delegado",
  "Segundo delegado",
  "Delegado de campo",
  "Utillero",
  "Médico",
  "Fisioterapeuta",
];

function CuerpoTecnicoAdminTab() {
  const supabase = createClient();
  const [miembros, setMiembros] = useState<MiembroCT[]>([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editCargo, setEditCargo] = useState("");
  const [editOrden, setEditOrden] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [subiendoFotoId, setSubiendoFotoId] = useState<number | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoCargo, setNuevoCargo] = useState("");
  const [nuevoOrden, setNuevoOrden] = useState("");
  const [añadiendo, setAñadiendo] = useState(false);
  const [ok, setOk] = useState<string | null>(null);

  const cargar = async () => {
    const { data } = await supabase
      .from("cuerpo_tecnico")
      .select("*")
      .order("orden", { ascending: true });
    setMiembros((data as MiembroCT[]) ?? []);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const empezarEdicion = (m: MiembroCT) => {
    setEditandoId(m.id);
    setEditNombre(m.nombre);
    setEditCargo(m.cargo);
    setEditOrden(m.orden?.toString() ?? "0");
  };

  const cancelarEdicion = () => setEditandoId(null);

  const guardarEdicion = async (id: number) => {
    if (!editNombre.trim() || !editCargo) return;
    setGuardando(true);
    await supabase.from("cuerpo_tecnico").update({
      nombre: editNombre.trim(),
      cargo: editCargo,
      orden: editOrden ? parseInt(editOrden) : 0,
    }).eq("id", id);
    setGuardando(false);
    setEditandoId(null);
    cargar();
  };

  const toggleActivo = async (m: MiembroCT) => {
    await supabase.from("cuerpo_tecnico").update({ activo: !m.activo }).eq("id", m.id);
    cargar();
  };

  const subirFoto = async (id: number, archivo: File) => {
    setSubiendoFotoId(id);
    const ext = archivo.name.split(".").pop();
    const nombre = `cuerpo_${id}_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("galeria")
      .upload(`cuerpo/${nombre}`, archivo, { contentType: archivo.type, upsert: true });
    if (!error) {
      const { data: urlData } = supabase.storage.from("galeria").getPublicUrl(`cuerpo/${nombre}`);
      await supabase.from("cuerpo_tecnico").update({ foto_url: urlData.publicUrl }).eq("id", id);
      cargar();
    }
    setSubiendoFotoId(null);
  };

  const añadir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevoCargo) return;
    setAñadiendo(true);
    await supabase.from("cuerpo_tecnico").insert({
      nombre: nuevoNombre.trim(),
      cargo: nuevoCargo,
      orden: nuevoOrden ? parseInt(nuevoOrden) : 0,
      activo: true,
    });
    setNuevoNombre(""); setNuevoCargo(""); setNuevoOrden("");
    setMostrarForm(false);
    setOk("✅ Miembro añadido.");
    setTimeout(() => setOk(null), 3000);
    setAñadiendo(false);
    cargar();
  };

  const activos = miembros.filter(m => m.activo);
  const inactivos = miembros.filter(m => !m.activo);

  if (cargando) return <p className="text-white/20 text-sm">Cargando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <strong>{activos.length}</strong> miembros activos
        </p>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-candas-rojo text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-candas-rojoOscuro transition"
        >
          {mostrarForm ? "Cancelar" : " Añadir miembro"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={añadir} className="card-dark rounded-xl p-5">
          <h3 className="font-black mb-4">Nuevo miembro</h3>
          <div className="grid sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Nombre *</label>
              <input type="text" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Nombre completo" autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Cargo *</label>
              <select value={nuevoCargo} onChange={(e) => setNuevoCargo(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none">
                <option value="">Selecciona cargo</option>
                {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Orden (1=primero)</label>
              <input type="number" value={nuevoOrden} onChange={(e) => setNuevoOrden(e.target.value)}
                placeholder="0" min={0}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none" />
            </div>
          </div>
          <button type="submit" disabled={añadiendo}
            className="bg-candas-rojo text-white font-black px-6 py-2 rounded-xl text-sm hover:bg-candas-rojoOscuro transition disabled:opacity-50">
            {añadiendo ? "Añadiendo..." : "Añadir"}
          </button>
        </form>
      )}

      {ok && <p className="text-green-400 text-sm font-semibold">{ok}</p>}

      <div className="card-dark rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-white/3 border-b border-white/5">
          <h3 className="font-black text-sm">Cuerpo técnico activo ({activos.length})</h3>
        </div>
        <ul className="divide-y divide-white/5">
          {activos.map((m) => (
            <li key={m.id} className="px-4 py-3">
              {editandoId === m.id ? (
                <div className="space-y-2">
                  <div className="grid sm:grid-cols-3 gap-2">
                    <input type="text" value={editNombre} onChange={(e) => setEditNombre(e.target.value)} autoFocus
                      className="border-2 border-candas-rojo rounded-lg px-2 py-1.5 text-sm focus:outline-none" />
                    <select value={editCargo} onChange={(e) => setEditCargo(e.target.value)}
                      className="bg-surface-2 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-candas-rojo focus:outline-none">
                      <option value="">Cargo</option>
                      {CARGOS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input type="number" value={editOrden} onChange={(e) => setEditOrden(e.target.value)}
                      placeholder="Orden" min={0}
                      className="bg-surface-2 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-candas-rojo focus:outline-none" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => guardarEdicion(m.id)} disabled={guardando}
                      className="bg-candas-rojo text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-candas-rojoOscuro transition disabled:opacity-50">
                      {guardando ? "..." : "✓ Guardar"}
                    </button>
                    <button onClick={cancelarEdicion}
                      className="text-white/30 text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-white/5 transition">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {m.foto_url ? (
                    <img src={m.foto_url} alt={m.nombre} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                  ) : (
                    <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-xl"></span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{m.nombre}</p>
                    <p className="text-xs text-white/30">{m.cargo}</p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 items-center">
                    <label className={`cursor-pointer text-xs font-medium transition ${subiendoFotoId === m.id ? "text-white/30" : "text-candas-rojo hover:text-white"}`}>
                      {subiendoFotoId === m.id ? "Subiendo..." : m.foto_url ? " Cambiar" : " Foto"}
                      <input type="file" accept="image/*" className="hidden" disabled={subiendoFotoId !== null}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) subirFoto(m.id, f); e.target.value = ""; }} />
                    </label>
                    <button onClick={() => empezarEdicion(m)} className="text-blue-500 hover:text-blue-700 text-xs font-medium">Editar</button>
                    <button onClick={() => toggleActivo(m)} className="text-xs font-medium text-white/20 hover:text-red-400 transition-colors">Desactivar</button>
                  </div>
                </div>
              )}
            </li>
          ))}
          {activos.length === 0 && (
            <li className="px-4 py-8 text-center text-white/20 text-sm">
              No hay miembros. Añade el primer entrenador.
            </li>
          )}
        </ul>
      </div>

      {inactivos.length > 0 && (
        <div className="card-dark rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-white/3 border-b border-white/5">
            <h3 className="font-black text-sm text-gray-400">Inactivos ({inactivos.length})</h3>
          </div>
          <ul className="divide-y divide-white/5">
            {inactivos.map((m) => (
              <li key={m.id} className="px-4 py-3 flex items-center gap-3 opacity-50">
                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm line-through">{m.nombre}</p>
                  <p className="text-xs text-white/30">{m.cargo}</p>
                </div>
                <button onClick={() => toggleActivo(m)} className="text-green-600 hover:text-green-700 text-xs font-medium flex-shrink-0">
                  Reactivar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// =====================================================
// TAB: Gestión de retransmisiones (directo + grabados)
// =====================================================
type Retransmision = {
  id: number;
  titulo: string;
  descripcion: string | null;
  url_tiivii: string;
  miniatura_url: string | null;
  fecha: string | null;
  es_directo: boolean;
  activo: boolean;
};

function DirectoAdminTab() {
  const supabase = createClient();
  const [items, setItems] = useState<Retransmision[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState<string | null>(null);

  // Form
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [url, setUrl] = useState("");
  const [fecha, setFecha] = useState("");
  const [esDireto, setEsDirecto] = useState(false);

  const cargar = async () => {
    const { data } = await supabase
      .from("retransmisiones")
      .select("*")
      .order("fecha", { ascending: false });
    setItems((data as Retransmision[]) ?? []);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const añadir = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !url.trim()) return;
    setGuardando(true);
    await supabase.from("retransmisiones").insert({
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      url_tiivii: url.trim(),
      fecha: fecha ? new Date(fecha).toISOString() : null,
      es_directo: esDireto,
      activo: true,
    });
    setTitulo(""); setDescripcion(""); setUrl(""); setFecha(""); setEsDirecto(false);
    setMostrarForm(false);
    setOk("✅ Retransmisión añadida.");
    setTimeout(() => setOk(null), 3000);
    setGuardando(false);
    cargar();
  };

  const toggleDirecto = async (item: Retransmision) => {
    // Si lo activamos como directo, desactivamos el anterior directo
    if (!item.es_directo) {
      await supabase.from("retransmisiones").update({ es_directo: false }).eq("es_directo", true);
    }
    await supabase.from("retransmisiones").update({ es_directo: !item.es_directo }).eq("id", item.id);
    cargar();
  };

  const toggleActivo = async (item: Retransmision) => {
    await supabase.from("retransmisiones").update({ activo: !item.activo }).eq("id", item.id);
    cargar();
  };

  const borrar = async (id: number) => {
    if (!confirm("¿Borrar esta retransmisión?")) return;
    await supabase.from("retransmisiones").delete().eq("id", id);
    cargar();
  };

  const directo = items.find(i => i.es_directo && i.activo);

  if (cargando) return <p className="text-white/20 text-sm">Cargando...</p>;

  return (
    <div className="space-y-6">
      {/* Estado actual */}
      <div className={`rounded-xl p-4 flex items-center gap-3 ${directo ? "bg-red-500/10 border border-red-500/20" : "card-dark border border-white/5"}`}>
        {directo ? (
          <>
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-red-400">En directo ahora: {directo.titulo}</p>
              <p className="text-xs text-red-500 truncate">{directo.url_tiivii}</p>
            </div>
            <button onClick={() => toggleDirecto(directo)} className="text-xs text-red-400 font-bold hover:text-white flex-shrink-0">
              Quitar directo
            </button>
          </>
        ) : (
          <>
            <span className="w-3 h-3 bg-white/20 rounded-full flex-shrink-0" />
            <p className="text-sm text-white/30">No hay partido en directo activo ahora mismo</p>
          </>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40"><strong className="text-white">{items.length}</strong> retransmisiones</p>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-candas-rojo text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-candas-rojoOscuro transition"
        >
          {mostrarForm ? "Cancelar" : " Añadir retransmisión"}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={añadir} className="card-dark rounded-xl p-5 border border-white/5 space-y-3">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-3">Nueva retransmisión</p>

          {/* Es directo toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setEsDirecto(!esDireto)}
              className={`w-10 h-6 rounded-full transition-colors ${esDireto ? "bg-red-500" : "bg-white/20"} relative`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${esDireto ? "translate-x-5" : "translate-x-1"}`} />
            </div>
            <span className="text-sm font-semibold text-white/70">{esDireto ? "Partido en directo" : "Partido grabado"}</span>
          </label>

          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-1 block">Título *</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Candás CF vs Vegadeo CF" autoFocus
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none" />
          </div>

          <div>
            <label className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-1 block">URL de tiivii.tv *</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://tiivii.tv/..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none" />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-1 block">Fecha del partido</label>
              <input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-1 block">Descripción (opcional)</label>
              <input type="text" value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Jornada 30 · Segunda Asturfútbol"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none" />
            </div>
          </div>

          <button type="submit" disabled={guardando}
            className="bg-candas-rojo text-white font-black px-6 py-2 rounded-xl text-sm hover:bg-candas-rojoOscuro transition disabled:opacity-50">
            {guardando ? "Añadiendo..." : "Añadir"}
          </button>
        </form>
      )}

      {ok && <p className="text-green-400 text-sm font-semibold">{ok}</p>}

      {/* Lista */}
      <div className="card-dark rounded-xl overflow-hidden">
        <ul className="divide-y divide-white/5">
          {items.length === 0 && (
            <li className="px-4 py-8 text-center text-white/20 text-sm">
              No hay retransmisiones. Añade el primer partido.
            </li>
          )}
          {items.map((item) => (
            <li key={item.id} className={`px-4 py-3 flex items-start gap-3 ${!item.activo ? "opacity-40" : ""}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  {item.es_directo && <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 font-bold px-2 py-0.5 rounded-full">Directo</span>}
                  <p className="font-bold text-sm truncate text-white">{item.titulo}</p>
                </div>
                {item.fecha && (
                  <p className="text-xs text-white/30">
                    {new Date(item.fecha).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Madrid" })}
                  </p>
                )}
                <p className="text-xs text-candas-rojo/60 truncate">{item.url_tiivii}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0 text-xs font-medium">
                <button onClick={() => toggleDirecto(item)}
                  className={`text-xs font-medium transition-colors ${item.es_directo ? "text-red-400 hover:text-white" : "text-white/30 hover:text-red-400"}`}>
                  {item.es_directo ? "Quitar directo" : "Poner directo"}
                </button>
                <button onClick={() => toggleActivo(item)} className="text-xs font-medium text-white/30 hover:text-white transition-colors">
                  {item.activo ? "Ocultar" : "Mostrar"}
                </button>
                <button onClick={() => borrar(item.id)} className="text-red-400 hover:text-red-600">Borrar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}