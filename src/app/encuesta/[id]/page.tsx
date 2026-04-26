import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import EncuestaPublica from "@/components/EncuestaPublica";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient();
  const { data: enc } = await supabase
    .from("encuestas")
    .select("id, titulo")
    .eq("id", parseInt(params.id))
    .single();

  if (!enc) return { title: "Encuesta — Fondo Sur Canijo" };

  const titulo = enc.titulo.replace("⭐ ", "");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fondosurcanijo.com";
  const ogUrl = `${siteUrl}/api/og/encuesta/${enc.id}`;

  return {
    title: `${titulo} — Fondo Sur Canijo`,
    description: `Vota al mejor jugador del partido. Encuesta de la afición del Candás CF.`,
    openGraph: {
      title: titulo,
      description: `🗳️ ¡Vota al mejor jugador! Encuesta del Fondo Sur Canijo`,
      url: `${siteUrl}/encuesta/${enc.id}`,
      siteName: "Fondo Sur Canijo",
      images: [
        {
          url: ogUrl,
          width: 1080,
          height: 630,
          alt: titulo,
        },
      ],
      type: "website",
      locale: "es_ES",
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: `🗳️ Vota al mejor jugador del partido`,
      images: [ogUrl],
    },
  };
}

export default async function EncuestaPublicaPage({ params }: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: enc } = await supabase
    .from("encuestas")
    .select("id, titulo, activa")
    .eq("id", parseInt(params.id))
    .single();

  if (!enc) redirect("/");

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-6 pt-20 sm:pt-28 pb-12">
      <p className="text-white/30 text-xs uppercase tracking-widest mb-3">Encuesta</p>
      <h1 className="font-poppins font-black text-2xl sm:text-4xl text-white mb-8">
        {enc.titulo.replace("⭐ ", "")}
      </h1>

      {user ? (
        /* Logueado → puede votar */
        <div className="card-dark rounded-2xl p-6">
          <EncuestaPublica encuestaId={enc.id} usuarioId={user.id} />
        </div>
      ) : (
        /* No logueado → ver resultados + CTA login */
        <div className="card-dark rounded-2xl p-6 text-center space-y-4">
          <p className="text-4xl">🗳️</p>
          <p className="text-white font-bold">¿Quién fue el mejor jugador?</p>
          <p className="text-white/40 text-sm">
            Inicia sesión como abonado del Fondo Sur Canijo para votar.
          </p>
          <a
            href={`/login?redirectTo=/encuesta/${enc.id}`}
            className="inline-block bg-candas-rojo text-white font-black px-6 py-3 rounded-xl hover:bg-candas-rojoOscuro transition"
          >
            Entrar y votar
          </a>
        </div>
      )}
    </div>
  );
}
