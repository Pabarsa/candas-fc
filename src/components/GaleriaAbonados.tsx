"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

type Post = {
  id: number;
  titulo: string;
  descripcion: string | null;
  foto_url: string;
  instagram_fotografa: string | null;
  created_at: string;
};

export default function GaleriaAbonados() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [cargando, setCargando] = useState(true);
  const [ampliada, setAmpliada] = useState<Post | null>(null);

  useEffect(() => {
    const cargar = async () => {
      const { data } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });
      setPosts((data as Post[]) ?? []);
      setCargando(false);
    };
    cargar();
  }, []);

  if (cargando)
    return (
      <div className="text-center py-10 text-gray-400">
        Cargando galería...
      </div>
    );

  if (posts.length === 0)
    return (
      <div className="text-center py-10 text-gray-400">
        <p className="text-4xl mb-3">📷</p>
        <p className="font-medium">Aún no hay fotos en la galería.</p>
        <p className="text-sm">El admin las irá subiendo pronto. ¡Vamos Canijo!</p>
      </div>
    );

  return (
    <>
      {/* Grid de fotos */}
      <div className="columns-2 sm:columns-3 gap-3 space-y-3">
        {posts.map((post) => (
          <div
            key={post.id}
            className="break-inside-avoid rounded-xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer group relative"
            onClick={() => setAmpliada(post)}
          >
            <div className="relative">
              <img
                src={post.foto_url}
                alt={post.titulo}
                className="w-full object-cover group-hover:scale-105 transition duration-300"
              />
              {/* Overlay al hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                <div>
                  <p className="text-white font-bold text-sm leading-tight">
                    {post.titulo}
                  </p>
                  {post.instagram_fotografa && (
                    <p className="text-white/80 text-xs mt-1">
                      📸 @{post.instagram_fotografa}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal foto ampliada */}
      {ampliada && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setAmpliada(null)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative max-h-[60vh] overflow-hidden">
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
