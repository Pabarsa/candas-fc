"use client";

import { useState } from "react";
import GaleriaPublica from "./GaleriaPublica";

type Post = {
  id: number;
  titulo: string;
  descripcion: string | null;
  foto_url: string;
  instagram_fotografa: string | null;
  tipo: "previa" | "partido" | "aficion" | "general";
  created_at: string;
};

type Filtro = "todo" | "previa" | "partido" | "aficion";

const FILTROS: { id: Filtro; label: string; emoji: string }[] = [
  { id: "todo",    label: "Todo",    emoji: "🔴" },
  { id: "previa",  label: "Previas", emoji: "📣" },
  { id: "partido", label: "Partido", emoji: "📸" },
  { id: "aficion", label: "Afición", emoji: "🙌" },
];

export default function FotosCliente({ fotos }: { fotos: Post[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todo");

  const filtradas = filtro === "todo"
    ? fotos
    : fotos.filter((f) => f.tipo === filtro);

  // Contar por tipo
  const conteo: Record<Filtro, number> = {
    todo:    fotos.length,
    previa:  fotos.filter((f) => f.tipo === "previa").length,
    partido: fotos.filter((f) => f.tipo === "partido").length,
    aficion: fotos.filter((f) => f.tipo === "aficion").length,
  };

  return (
    <>
      {/* Tabs filtro */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {FILTROS.map((f) => (
          conteo[f.id] > 0 || f.id === "todo" ? (
            <button
              key={f.id}
              onClick={() => setFiltro(f.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                filtro === f.id
                  ? "bg-candas-rojo text-white shadow-glow-red-sm"
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/70"
              }`}
            >
              <span>{f.emoji}</span>
              <span>{f.label}</span>
              <span className={`text-xs font-normal ml-0.5 ${filtro === f.id ? "text-white/70" : "text-white/20"}`}>
                {conteo[f.id]}
              </span>
            </button>
          ) : null
        ))}
      </div>

      {filtradas.length === 0 ? (
        <div className="card-dark rounded-2xl h-64 flex flex-col items-center justify-center">
          <p className="text-white/20 text-sm">No hay fotos en esta categoría</p>
        </div>
      ) : (
        <GaleriaPublica fotos={filtradas} titulo={true} />
      )}
    </>
  );
}
