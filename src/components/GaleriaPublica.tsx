"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Post = {
  id: number;
  titulo: string;
  descripcion: string | null;
  foto_url: string;
  instagram_fotografa: string | null;
  tipo?: "previa" | "partido" | "aficion" | "general";
  created_at: string;
};

function FotoCard({
  post,
  onClick,
}: {
  post: Post;
  onClick: () => void;
}) {
  const [cargada, setCargada] = useState(false);

  return (
    <button
      onClick={onClick}
      className="group relative w-full overflow-hidden rounded-xl focus:outline-none focus:ring-2 focus:ring-candas-rojo mb-2 sm:mb-3 block"
      style={{ breakInside: "avoid" }}
    >
      {!cargada && (
        <div className="w-full bg-white/5 animate-pulse rounded-xl" style={{ aspectRatio: "4/3" }} />
      )}
      <img
        src={post.foto_url}
        alt={post.titulo}
        onLoad={() => setCargada(true)}
        className={`w-full h-auto block transition-all duration-500 group-hover:scale-[1.02]
          ${cargada ? "opacity-100" : "opacity-0 absolute inset-0"}`}
      />
      {post.tipo === "previa" && (
        <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow-lg">
          📣 Previa
        </div>
      )}
      {post.tipo === "aficion" && (
        <div className="absolute top-2 left-2 z-10 bg-candas-rojo text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow-lg">
          🙌 Afición
        </div>
      )}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex flex-col justify-end p-3 rounded-xl">
        <div className="translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-white font-bold text-xs sm:text-sm leading-tight line-clamp-2 drop-shadow">
            {post.titulo}
          </p>
          {post.instagram_fotografa && (
            <p className="text-white/80 text-xs mt-0.5 drop-shadow">
              📸 @{post.instagram_fotografa}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

export default function GaleriaPublica({
  fotos,
  titulo,
}: {
  fotos: Post[];
  titulo?: boolean;
}) {
  const [indice, setIndice] = useState<number | null>(null);
  const touchStartX = useRef(0);

  const cerrar = useCallback(() => setIndice(null), []);
  const anterior = useCallback(
    () => setIndice((i) => (i !== null ? (i - 1 + fotos.length) % fotos.length : null)),
    [fotos.length]
  );
  const siguiente = useCallback(
    () => setIndice((i) => (i !== null ? (i + 1) % fotos.length : null)),
    [fotos.length]
  );

  useEffect(() => {
    if (indice === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowLeft") anterior();
      if (e.key === "ArrowRight") siguiente();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [indice, cerrar, anterior, siguiente]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? siguiente() : anterior();
    }
  };

  if (fotos.length === 0) return null;

  const actual = indice !== null ? fotos[indice] : null;

  return (
    <>
      {titulo && (
        <p className="text-sm text-white/30 mb-6">
          {fotos.length} {fotos.length === 1 ? "publicación" : "publicaciones"}
        </p>
      )}

      {/* Masonry: columnas CSS — cada imagen respeta su proporción natural */}
      <div className="columns-2 sm:columns-3 gap-2 sm:gap-3">
        {fotos.map((post, i) => (
          <FotoCard
            key={post.id}
            post={post}
            onClick={() => setIndice(i)}
          />
        ))}
      </div>

      {/* Lightbox */}
      {actual !== null && indice !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col select-none"
          onClick={cerrar}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-white/50 text-sm tabular-nums font-medium">
                {indice + 1} / {fotos.length}
              </span>
              {actual.tipo === "previa" && (
                <span className="bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                  📣 Previa
                </span>
              )}
              {actual.tipo === "aficion" && (
                <span className="bg-candas-rojo text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide">
                  🙌 Afición
                </span>
              )}
            </div>
            <button
              onClick={cerrar}
              className="text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center relative min-h-0 px-10 sm:px-16">
            {fotos.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); anterior(); }}
                className="absolute left-2 sm:left-4 text-white/60 hover:text-white bg-white/5 hover:bg-white/15 rounded-full p-2 sm:p-3 transition z-10"
                aria-label="Anterior"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <img
              key={actual.id}
              src={actual.foto_url}
              alt={actual.titulo}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ maxHeight: "calc(100vh - 160px)" }}
            />
            {fotos.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); siguiente(); }}
                className="absolute right-2 sm:right-4 text-white/60 hover:text-white bg-white/5 hover:bg-white/15 rounded-full p-2 sm:p-3 transition z-10"
                aria-label="Siguiente"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          <div
            className="flex-shrink-0 px-4 py-4 flex items-center justify-between gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0">
              <p className="text-white font-bold text-sm sm:text-base truncate">
                {actual.titulo}
              </p>
              {actual.descripcion && (
                <p className="text-white/60 text-xs mt-0.5 line-clamp-2">
                  {actual.descripcion}
                </p>
              )}
            </div>
            {actual.instagram_fotografa && (
              <a
                href={`https://instagram.com/${actual.instagram_fotografa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:opacity-90 transition"
                onClick={(e) => e.stopPropagation()}
              >
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                @{actual.instagram_fotografa}
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}