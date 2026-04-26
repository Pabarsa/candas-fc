import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

// Cliente sin cookies — funciona para crawlers (WhatsApp, Twitter, etc.)
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  const formato = req.nextUrl.searchParams.get("format") ?? "og"; // "og" | "square"

  // Ancho/alto según formato
  const isSquare = formato === "square";
  const W = 1080;
  const H = isSquare ? 1080 : 630;

  // ── Datos de la encuesta ──────────────────────────────────────
  const encId = parseInt(params.id);
  const [{ data: encuesta }, { data: votos }, { data: fotoPost }] = await Promise.all([
    supabase.from("encuestas").select("id, titulo, partido_id").eq("id", encId).single(),
    supabase.from("votos").select("jugador_id, jugadores(nombre)").eq("encuesta_id", encId),
    supabase
      .from("posts")
      .select("foto_url")
      .eq("tipo", "partido")
      .order("created_at", { ascending: false })
      .limit(1)
      .single(),
  ]);

  if (!encuesta) return new Response("Not found", { status: 404 });

  // Calcular líder
  const conteo = new Map<number, { nombre: string; votos: number }>();
  (votos ?? []).forEach((v: any) => {
    const id = v.jugador_id;
    const nombre = v.jugadores?.nombre ?? "?";
    if (!conteo.has(id)) conteo.set(id, { nombre, votos: 0 });
    conteo.get(id)!.votos++;
  });
  const ranking = Array.from(conteo.values()).sort((a, b) => b.votos - a.votos);
  const lider = ranking[0] ?? null;
  const total = (votos ?? []).length;
  const titulo = encuesta.titulo.replace("⭐ ", "");
  const fotoUrl = fotoPost?.foto_url ?? null;

  const imageResponse = new ImageResponse(
    isSquare
      ? /* ── SQUARE 1080×1080 para Instagram ── */
        (
          <div
            style={{
              width: W,
              height: H,
              background: "#0d0d0d",
              display: "flex",
              flexDirection: "column",
              fontFamily: "system-ui, sans-serif",
              position: "relative",
            }}
          >
            {/* Foto de fondo si hay */}
            {fotoUrl && (
              <img
                src={fotoUrl}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.18,
                }}
              />
            )}

            {/* Gradiente encima */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(193,18,31,0.35) 0%, rgba(0,0,0,0.92) 60%)",
                display: "flex",
              }}
            />

            {/* Franja roja superior */}
            <div style={{ height: 12, background: "#c1121f", width: "100%", flexShrink: 0, zIndex: 1 }} />

            {/* Contenido */}
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "60px 80px",
                zIndex: 1,
              }}
            >
              {/* Club label */}
              <div
                style={{
                  background: "#c1121f",
                  color: "white",
                  fontSize: 28,
                  fontWeight: 900,
                  letterSpacing: 4,
                  padding: "10px 36px",
                  borderRadius: 50,
                  marginBottom: 48,
                  textTransform: "uppercase",
                }}
              >
                FONDO SUR CANIJO
              </div>

              {/* Titulo encuesta */}
              <div
                style={{
                  color: "rgba(255,255,255,0.55)",
                  fontSize: 34,
                  fontWeight: 700,
                  textAlign: "center",
                  marginBottom: 20,
                  letterSpacing: 1,
                }}
              >
                {titulo}
              </div>

              {/* Líder */}
              {lider ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginTop: 16,
                  }}
                >
                  <div
                    style={{
                      color: "#FFD700",
                      fontSize: 36,
                      fontWeight: 900,
                      letterSpacing: 2,
                      marginBottom: 12,
                    }}
                  >
                    ★ LÍDER
                  </div>
                  <div
                    style={{
                      color: "white",
                      fontSize: 88,
                      fontWeight: 900,
                      lineHeight: 1,
                      textAlign: "center",
                    }}
                  >
                    {lider.nombre}
                  </div>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: 36,
                      fontWeight: 600,
                      marginTop: 20,
                    }}
                  >
                    {lider.votos} votos de {total} totales
                  </div>
                </div>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 40, fontWeight: 700 }}>
                  ¡Aún sin votos!
                </div>
              )}

              {/* CTA */}
              <div
                style={{
                  marginTop: 64,
                  color: "rgba(255,255,255,0.35)",
                  fontSize: 30,
                  letterSpacing: 2,
                }}
              >
                fondosurcanijo.com
              </div>
            </div>

            {/* Franja roja inferior */}
            <div style={{ height: 12, background: "#c1121f", width: "100%", flexShrink: 0, zIndex: 1 }} />
          </div>
        )
      : /* ── OG 1080×630 para WhatsApp / Twitter ── */
        (
          <div
            style={{
              width: W,
              height: H,
              background: "#0d0d0d",
              display: "flex",
              fontFamily: "system-ui, sans-serif",
              position: "relative",
            }}
          >
            {/* Foto mitad derecha */}
            {fotoUrl && (
              <img
                src={fotoUrl}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 0,
                  width: "48%",
                  height: "100%",
                  objectFit: "cover",
                  opacity: 0.6,
                }}
              />
            )}
            {/* Gradiente izquierda */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: fotoUrl
                  ? "linear-gradient(90deg, #0d0d0d 52%, transparent 85%)"
                  : "linear-gradient(135deg, #1a0508 0%, #0d0d0d 100%)",
                display: "flex",
              }}
            />

            {/* Barra roja izquierda */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: 10,
                background: "#c1121f",
                display: "flex",
              }}
            />

            {/* Contenido */}
            <div
              style={{
                position: "absolute",
                left: 60,
                top: 0,
                bottom: 0,
                width: fotoUrl ? "52%" : "85%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "50px 0",
                zIndex: 1,
              }}
            >
              {/* Label */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    background: "#c1121f",
                    color: "white",
                    fontSize: 20,
                    fontWeight: 900,
                    padding: "6px 20px",
                    borderRadius: 50,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  ENCUESTA
                </div>
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 20 }}>
                  fondosurcanijo.com
                </div>
              </div>

              {/* Título */}
              <div
                style={{
                  color: "white",
                  fontSize: 42,
                  fontWeight: 900,
                  lineHeight: 1.15,
                  marginBottom: 36,
                }}
              >
                {titulo}
              </div>

              {/* Líder */}
              {lider ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ color: "#FFD700", fontSize: 20, fontWeight: 700, letterSpacing: 2 }}>
                    ★ LÍDER PROVISIONAL
                  </div>
                  <div style={{ color: "white", fontSize: 58, fontWeight: 900, lineHeight: 1 }}>
                    {lider.nombre}
                  </div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 24, marginTop: 8 }}>
                    {lider.votos} votos · {total} participantes
                  </div>
                </div>
              ) : (
                <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 32 }}>
                  ¡Todavía no hay votos!
                </div>
              )}

              {/* CTA */}
              <div
                style={{
                  marginTop: 40,
                  background: "#c1121f",
                  color: "white",
                  fontSize: 22,
                  fontWeight: 900,
                  padding: "12px 28px",
                  borderRadius: 12,
                  display: "inline-flex",
                  width: "fit-content",
                }}
              >
                🗳️ Vota en la web
              </div>
            </div>
          </div>
        ),
    { width: W, height: H }
  );

  // Headers para que WhatsApp y otros crawlers cacheen la imagen
  imageResponse.headers.set("Cache-Control", "public, max-age=60, s-maxage=60");
  return imageResponse;
}