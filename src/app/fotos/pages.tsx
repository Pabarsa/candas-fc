import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata = {
  title: "Fotos — Fondo Sur Canijo",
  description: "Galería de fotos del Candás CF. Fotografías de partidos y momentos del equipo.",
};

export const dynamic = "force-dynamic";

type Post = {
  id: number;
  titulo: string;
  descripcion: string | null;
  foto_url: string;
  instagram_fotografa: string | null;
  created_at: string;
};

export default async function FotosPage() {
  const supabase = createClient();

  // Las fotos son públicas — no hace falta estar logado
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  const fotos = (posts as Post[]) ?? [];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black mb-1">📸 Fotos</h1>
          <p className="text-gray-500">Momentos del Candás CF captados por nuestra afición</p>
        </div>
        <Link
          href="/registro"
          className="flex-shrink-0 bg-candas-rojo text-white font-bold px-5 py-2.5 rounded-xl hover:bg-candas-rojoOscuro transition text-sm text-center"
        >
          🔴 Hazte abonado para descargarlas
        </Link>
      </div>

      {fotos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-5xl mb-4">📷</p>
          <p className="font-medium text-lg">Pronto habrá fotos aquí</p>
          <p className="text-sm mt-1">¡Vamos Canijo! 🔴⚪</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
          {fotos.map((post) => (
            <div
              key={post.id}
              className="break-inside-avoid rounded-xl overflow-hidden shadow-md group relative"
            >
              <img
                src={post.foto_url}
                alt={post.titulo}
                className="w-full object-cover group-hover:scale-105 transition duration-300"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-3">
                <p className="text-white font-bold text-sm leading-tight">{post.titulo}</p>
                {post.instagram_fotografa && (
                  <a
                    href={`https://instagram.com/${post.instagram_fotografa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 text-xs mt-1 hover:text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    📸 @{post.instagram_fotografa}
                  </a>
                )}
              </div>

              {/* Candado — solo abonados descargan */}
              <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {fotos.length > 0 && (
        <div className="mt-12 text-center bg-candas-crema border border-red-100 rounded-2xl p-8">
          <p className="text-lg font-black text-gray-900 mb-1">¿Quieres descargar las fotos?</p>
          <p className="text-gray-500 text-sm mb-4">Regístrate como abonado, es gratis y tienes acceso a todo.</p>
          <Link
            href="/registro"
            className="inline-block bg-candas-rojo text-white font-bold px-8 py-3 rounded-xl hover:bg-candas-rojoOscuro transition"
          >
            Crear cuenta gratis
          </Link>
        </div>
      )}
    </div>
  );
}
