"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mensaje } from "@/lib/types";

type Props = {
  usuarioId: string;
};

export default function ChatAbonados({ usuarioId }: Props) {
  const supabase = createClient();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  const enriquecerConPerfil = async (msgs: any[]) => {
    if (msgs.length === 0) return [];
    const ids = [...new Set(msgs.map((m) => m.usuario_id))];
    const { data: perfiles } = await supabase
      .from("profiles")
      .select("id, nombre, carnet")
      .in("id", ids);
    const mapaPerfiles = new Map((perfiles ?? []).map((p: any) => [p.id, p]));
    return msgs.map((m) => ({
      ...m,
      profiles: mapaPerfiles.get(m.usuario_id) ?? null,
    }));
  };

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from("mensajes")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(100);
      const msgs = await enriquecerConPerfil(data ?? []);
      setMensajes(msgs as Mensaje[]);
    };
    cargar();

    const canal = supabase
      .channel("mensajes-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensajes" },
        async (payload) => {
          const nuevo = payload.new as any;
          const { data } = await supabase
            .from("profiles")
            .select("id, nombre, carnet")
            .eq("id", nuevo.usuario_id)
            .single();
          setMensajes((prev) => [...prev, { ...nuevo, profiles: data ?? null }]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(canal); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    await supabase
      .from("mensajes")
      .insert({ usuario_id: usuarioId, contenido: texto.trim() });
    setTexto("");
    setEnviando(false);
  };

  const borrarMensaje = async (mensajeId: number) => {
    if (!confirm("¿Eliminar este mensaje?")) return;
    await supabase.from("mensajes").delete().eq("id", mensajeId);
    setMensajes((prev) => prev.filter((m) => m.id !== mensajeId));
  };

  return (
    <div className="card-dark rounded-2xl flex flex-col h-[500px]">
      <div className="border-b border-white/5 px-4 py-3 font-semibold text-white/70 text-sm">
        💬 Chat de abonados
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-scroll">
        {mensajes.length === 0 && (
          <p className="text-center text-white/20 text-sm mt-10">
            Sé el primero en escribir. ¿Alguien va al campo el domingo?
          </p>
        )}
        {mensajes.map((m) => {
          const esMio = m.usuario_id === usuarioId;
          const nombre = m.profiles?.nombre || "Abonado";
          const carnet = m.profiles?.carnet;
          return (
            <div key={m.id} className={`flex ${esMio ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                esMio ? "bg-candas-rojo text-white" : "bg-white/5 text-white/80"
              }`}>
                {!esMio && (
                  <div className="text-xs font-bold mb-1">
                    {nombre}
                    {carnet && <span className="opacity-60 font-normal"> · #{carnet}</span>}
                  </div>
                )}
                {esMio && <div className="text-xs font-bold mb-1 text-white/80">Tú</div>}
                <div className="whitespace-pre-wrap break-words">{m.contenido}</div>
                <div className="flex items-center justify-between gap-2">
                  <div className={`text-[10px] ${esMio ? "text-white/70" : "text-gray-500"}`}>
                    {new Date(m.created_at).toLocaleTimeString("es-ES", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </div>
                  {esMio && (
                    <button
                      onClick={() => borrarMensaje(m.id)}
                      className="text-[10px] text-white/60 hover:text-white/90 hover:underline"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={finRef} />
      </div>

      <form onSubmit={enviar} className="border-t border-white/5 p-3 flex gap-2">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribe un mensaje..."
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-candas-rojo text-sm text-white placeholder-white/20"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={!texto.trim() || enviando}
          className="bg-candas-rojo text-white font-bold px-4 rounded-lg hover:bg-candas-rojoOscuro disabled:opacity-50"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}