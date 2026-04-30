"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { comprimirImagen } from "@/lib/imageUtils";

type Veterano = {
  id: number;
  nombre: string;
  dorsal: number | null;
  posicion: string | null;
  foto_url: string | null;
  activo: boolean;
};

export default function VeteranosAdminTab() {
  const supabase = createClient();
  const [veteranos, setVeteranos] = useState<Veterano[]>([]);
  const [cargando, setCargando] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Nuevo veterano
  const [nombre, setNombre] = useState("");
  const [dorsal, setDorsal] = useState("");
  const [posicion, setPosicion] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Edición
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editDorsal, setEditDorsal] = useState("");
  const [editPosicion, setEditPosicion] = useState("");
  const [editArchivo, setEditArchivo] = useState<File | null>(null);
  const [editPreview, setEditPreview] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const cargar = async () => {
    setCargando(true);
    const { data } = await supabase
      .from("veteranos")
      .select("*")
      .order("dorsal", { ascending: true, nullsFirst: false });
    setVeteranos((data ?? []) as Veterano[]);
    setCargando(false);
  };

  useEffect(() => { cargar(); }, []); // eslint-disable-line

  const onFoto = (e: React.ChangeEvent<HTMLInputElement>, edit = false) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (edit) {
      setEditArchivo(f);
      setEditPreview(URL.createObjectURL(f));
    } else {
      setArchivo(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const subirFoto = async (file: File, nombre: string): Promise<string> => {
    const comprimido = await comprimirImagen(file);
    const path = `veteranos/${Date.now()}_${nombre.toLowerCase().replace(/\s+/g, "_")}.jpg`;
    const { error } = await supabase.storage.from("galeria").upload(path, comprimido, { contentType: "image/jpeg", upsert: true });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("galeria").getPublicUrl(path);
    return data.publicUrl;
  };

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSubiendo(true); setError(null); setOk(null);
    try {
      let foto_url: string | null = null;
      if (archivo) foto_url = await subirFoto(archivo, nombre);
      const { error } = await supabase.from("veteranos").insert({
        nombre: nombre.trim(),
        dorsal: dorsal ? parseInt(dorsal) : null,
        posicion: posicion.trim() || null,
        foto_url,
      });
      if (error) throw new Error(error.message);
      setOk("✅ Veterano añadido.");
      setNombre(""); setDorsal(""); setPosicion("");
      setArchivo(null); setPreview(null);
      cargar();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubiendo(false);
    }
  };

  const empezarEdicion = (v: Veterano) => {
    setEditandoId(v.id);
    setEditNombre(v.nombre);
    setEditDorsal(v.dorsal?.toString() ?? "");
    setEditPosicion(v.posicion ?? "");
    setEditArchivo(null);
    setEditPreview(null);
  };

  const guardarEdicion = async (id: number, fotoActual: string | null) => {
    setGuardando(true);
    try {
      let foto_url = fotoActual;
      if (editArchivo) foto_url = await subirFoto(editArchivo, editNombre);
      await supabase.from("veteranos").update({
        nombre: editNombre.trim(),
        dorsal: editDorsal ? parseInt(editDorsal) : null,
        posicion: editPosicion.trim() || null,
        foto_url,
      }).eq("id", id);
      setEditandoId(null);
      cargar();
    } finally {
      setGuardando(false);
    }
  };

  const toggleActivo = async (v: Veterano) => {
    await supabase.from("veteranos").update({ activo: !v.activo }).eq("id", v.id);
    cargar();
  };

  const borrar = async (id: number) => {
    if (!confirm("¿Borrar este veterano?")) return;
    await supabase.from("veteranos").delete().eq("id", id);
    cargar();
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* ── Formulario nuevo ── */}
      <div className="card-dark rounded-2xl p-5">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-5">Añadir veterano</p>

        {ok && <p className="text-green-400 text-xs mb-3">{ok}</p>}
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

        <form onSubmit={crear} className="space-y-3">
          {/* Preview foto */}
          <label className="block cursor-pointer">
            <div className={`w-full aspect-square rounded-xl border-2 border-dashed overflow-hidden flex items-center justify-center transition ${
              preview ? "border-transparent" : "border-white/10 hover:border-white/30"
            }`}>
              {preview ? (
                <img src={preview} className="w-full h-full object-cover" />
              ) : (
                <div className="text-center text-white/20 p-4">
                  <p className="text-3xl mb-1">📷</p>
                  <p className="text-xs">Subir foto</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => onFoto(e)} className="hidden" />
          </label>

          <input
            type="text" value={nombre} onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre *" required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number" value={dorsal} onChange={(e) => setDorsal(e.target.value)}
              placeholder="Dorsal"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none"
            />
            <input
              type="text" value={posicion} onChange={(e) => setPosicion(e.target.value)}
              placeholder="Posición"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-candas-rojo focus:outline-none"
            />
          </div>

          <button
            type="submit" disabled={subiendo || !nombre.trim()}
            className="w-full bg-candas-rojo text-white font-black py-2.5 rounded-xl hover:bg-candas-rojoOscuro transition disabled:opacity-40 text-sm"
          >
            {subiendo ? "Guardando..." : "Añadir veterano"}
          </button>
        </form>
      </div>

      {/* ── Lista ── */}
      <div className="card-dark rounded-2xl p-5">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-5">
          Veteranos ({veteranos.length})
        </p>

        {cargando ? (
          <div className="space-y-2 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-white/5 rounded-xl" />)}
          </div>
        ) : (
          <ul className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {veteranos.map((v) => (
              <li key={v.id} className={`rounded-xl border p-3 transition ${
                v.activo ? "border-white/5 bg-white/3" : "border-white/5 bg-white/3 opacity-40"
              }`}>
                {editandoId === v.id ? (
                  <div className="space-y-2">
                    <div className="flex gap-2 items-start">
                      {/* Foto editable */}
                      <label className="cursor-pointer flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                          {editPreview || v.foto_url ? (
                            <img src={editPreview ?? v.foto_url!} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-white/10 flex items-center justify-center text-white/30 text-xs">📷</div>
                          )}
                        </div>
                        <input type="file" accept="image/*" onChange={(e) => onFoto(e, true)} className="hidden" />
                      </label>
                      <div className="flex-1 space-y-1.5">
                        <input
                          value={editNombre} onChange={(e) => setEditNombre(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:border-candas-rojo focus:outline-none"
                        />
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="number" value={editDorsal} onChange={(e) => setEditDorsal(e.target.value)}
                            placeholder="Dorsal"
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-candas-rojo focus:outline-none"
                          />
                          <input
                            value={editPosicion} onChange={(e) => setEditPosicion(e.target.value)}
                            placeholder="Posición"
                            className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:border-candas-rojo focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => guardarEdicion(v.id, v.foto_url)}
                        disabled={guardando}
                        className="bg-candas-rojo text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        {guardando ? "..." : "✓ Guardar"}
                      </button>
                      <button
                        onClick={() => setEditandoId(null)}
                        className="text-white/30 text-xs px-3 py-1.5 rounded-lg hover:bg-white/5"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 items-center">
                    {/* Foto */}
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-white/5">
                      {v.foto_url ? (
                        <img src={v.foto_url} alt={v.nombre} className="w-full h-full object-cover object-top" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-bold">
                          {v.dorsal ?? "?"}
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {v.dorsal && (
                          <span className="bg-candas-rojo text-white text-[10px] font-black w-5 h-5 rounded flex items-center justify-center flex-shrink-0">
                            {v.dorsal}
                          </span>
                        )}
                        <p className="font-bold text-sm text-white truncate">{v.nombre}</p>
                      </div>
                      {v.posicion && <p className="text-xs text-white/30">{v.posicion}</p>}
                    </div>
                    {/* Acciones */}
                    <div className="flex flex-col gap-1 flex-shrink-0 text-right">
                      <button onClick={() => empezarEdicion(v)} className="text-blue-400 text-xs hover:text-blue-300">Editar</button>
                      <button onClick={() => toggleActivo(v)} className="text-yellow-400 text-xs hover:text-yellow-300">
                        {v.activo ? "Ocultar" : "Mostrar"}
                      </button>
                      <button onClick={() => borrar(v.id)} className="text-red-400 text-xs hover:text-red-300">Borrar</button>
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