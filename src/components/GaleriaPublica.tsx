"use client";

import { useState } from "react";

type Post = {
  id: number;
  titulo: string;
  descripcion: string | null;
  foto_url: string;
  instagram_fotografa: string | null;
  created_at: string;
};

export default function GaleriaPublica({
  fotos,
  esAbonado,
}: {
  fotos: Post[];
  esAbonado: boolean;
}) {
  const [ampliada, setAmpliada] = useState<Post | null>(null);

  if (fotos.length === 0) return null;

  return (
    <>
      <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
        {fotos.map((post) => (
          <div
            key={post.id}
            className="break-inside-avoid rounded-xl overflow-hidden shadow-md group relative cursor-pointer"
            onClick={() => setAmpliada(post)}
          >
            <img
              src={post.foto_url}
              alt={post.titulo}
              className="w-full object-cover group-hover:scale-105 transition duration-300"
            />
            {/* Overlay hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3">
              <p className="text-white font-bold text-sm leading-tight">
                {post.titulo}
              </p>
              {post.instagram_fotografa && (
                <p className="text-white/80 text-xs mt-1">
                  📸 @{post.instagram_fotografa}
                </p>
              )}
            </div>
            {/* Candado si no es abonado */}
            {!esAbonado && (
              <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {/* Icono ampliar */}
            <div className="absolute top-2 left-2 bg-black/50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Modal foto ampliada */}
      {ampliada && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
          onClick={() => setAmpliada(null)}
        >
          {/* Botón cerrar arriba a la derecha */}
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition"
            onClick={() => setAmpliada(null)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-hidden bg-black">
              <img
                src={ampliada.foto_url}
                alt={ampliada.titulo}
                className="w-full object-contain max-h-[60vh]"
              />
            </div>

            <div className="p-5 flex flex-col gap-3">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-black text-lg text-gray-900">
                    {ampliada.titulo}
                  </h3>
                  {ampliada.descripcion && (
                    <p className="text-gray-600 text-sm mt-1">
                      {ampliada.descripcion}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(ampliada.created_at).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                {/* Crédito fotógrafa */}
                {ampliada.instagram_fotografa && (
                  <a
                    href={`https://instagram.com/${ampliada.instagram_fotografa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex items-center gap-2 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white px-3 py-2 rounded-xl text-sm font-bold hover:shadow-lg transition"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    @{ampliada.instagram_fotografa}
                  </a>
                )}
              </div>

              <div className="flex gap-2 pt-2 border-t border-gray-100">
                {esAbonado ? (
                  <a
                    href={ampliada.foto_url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center bg-candas-rojo text-white font-bold py-2 rounded-lg hover:bg-candas-rojoOscuro transition text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ⬇️ Descargar foto
                  </a>
                ) : (
                  <a
                    href="/registro"
                    className="flex-1 text-center bg-candas-rojo text-white font-bold py-2 rounded-lg hover:bg-candas-rojoOscuro transition text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    🔒 Hazte abonado para descargar
                  </a>
                )}
                <button
                  onClick={() => setAmpliada(null)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
