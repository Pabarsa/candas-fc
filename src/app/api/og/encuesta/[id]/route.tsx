import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "nodejs";

async function fetchSupabase(path: string) {
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/${path}`;
  const res = await fetch(url, {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
    },
  });
  return res.json();
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const formato = req.nextUrl.searchParams.get("format") ?? "og";
  const isSquare = formato === "square";
  const W = 1080;
  const H = isSquare ? 1080 : 630;

  // Datos básicos
  const [encData, votosData] = await Promise.all([
    fetchSupabase(`encuestas?id=eq.${params.id}&select=id,titulo`),
    fetchSupabase(`votos?encuesta_id=eq.${params.id}&select=jugador_id,jugadores(nombre)`),
  ]);

  const enc = encData?.[0];
  if (!enc) return new Response("Not found", { status: 404 });

  // Calcular líder
  const conteo = new Map<number, { nombre: string; votos: number }>();
  (votosData ?? []).forEach((v: any) => {
    const id = v.jugador_id;
    const nombre = v.jugadores?.nombre ?? "?";
    if (!conteo.has(id)) conteo.set(id, { nombre, votos: 0 });
    conteo.get(id)!.votos++;
  });
  const ranking = Array.from(conteo.values()).sort((a, b) => b.votos - a.votos);
  const lider = ranking[0] ?? null;
  const total = (votosData ?? []).length;
  const titulo = enc.titulo.replace("⭐ ", "");

  const img = new ImageResponse(
    isSquare ? (
      /* ── 1080×1080 Instagram ── */
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(160deg, #1a0508 0%, #0d0d0d 50%, #0a0a14 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Franja roja top */}
        <div style={{ height: 14, background: "#c1121f", display: "flex" }} />

        {/* Cuerpo */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 80px",
          }}
        >
          {/* Badge club */}
          <div
            style={{
              background: "#c1121f",
              color: "white",
              fontSize: 26,
              fontWeight: 900,
              letterSpacing: 4,
              padding: "10px 32px",
              borderRadius: 50,
              marginBottom: 52,
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            FONDO SUR CANIJO 🔴⚪
          </div>

          {/* Título encuesta */}
          <div
            style={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 34,
              fontWeight: 700,
              textAlign: "center",
              marginBottom: 48,
              display: "flex",
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
                gap: 12,
              }}
            >
              <div
                style={{
                  color: "#FFD700",
                  fontSize: 32,
                  fontWeight: 900,
                  letterSpacing: 3,
                  display: "flex",
                }}
              >
                ★ LÍDER PROVISIONAL
              </div>
              <div
                style={{
                  color: "white",
                  fontSize: 84,
                  fontWeight: 900,
                  lineHeight: 1,
                  textAlign: "center",
                  display: "flex",
                }}
              >
                {lider.nombre}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 32,
                  fontWeight: 600,
                  marginTop: 8,
                  display: "flex",
                }}
              >
                {lider.votos} votos · {total} participantes
              </div>
            </div>
          ) : (
            <div
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 44,
                fontWeight: 700,
                display: "flex",
              }}
            >
              ¡Vota ahora!
            </div>
          )}

          {/* URL */}
          <div
            style={{
              marginTop: 64,
              color: "rgba(255,255,255,0.3)",
              fontSize: 28,
              letterSpacing: 2,
              display: "flex",
            }}
          >
            fondosurcanijo.com
          </div>
        </div>

        {/* Franja roja bottom */}
        <div style={{ height: 14, background: "#c1121f", display: "flex" }} />
      </div>
    ) : (
      /* ── 1080×630 WhatsApp OG ── */
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          background: "linear-gradient(135deg, #1a0508 0%, #0d0d0d 60%, #0a0a14 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Barra roja izquierda */}
        <div style={{ width: 10, background: "#c1121f", display: "flex" }} />

        {/* Contenido */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "50px 60px",
          }}
        >
          {/* Label */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                background: "#c1121f",
                color: "white",
                fontSize: 18,
                fontWeight: 900,
                padding: "6px 20px",
                borderRadius: 50,
                letterSpacing: 2,
                textTransform: "uppercase",
                display: "flex",
              }}
            >
              ENCUESTA
            </div>
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 18, display: "flex" }}>
              fondosurcanijo.com
            </div>
          </div>

          {/* Título */}
          <div
            style={{
              color: "white",
              fontSize: 44,
              fontWeight: 900,
              lineHeight: 1.2,
              marginBottom: 36,
              display: "flex",
            }}
          >
            {titulo}
          </div>

          {/* Líder */}
          {lider ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div
                style={{
                  color: "#FFD700",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: 2,
                  display: "flex",
                }}
              >
                ★ LÍDER PROVISIONAL
              </div>
              <div
                style={{
                  color: "white",
                  fontSize: 60,
                  fontWeight: 900,
                  lineHeight: 1,
                  display: "flex",
                }}
              >
                {lider.nombre}
              </div>
              <div
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 22,
                  marginTop: 4,
                  display: "flex",
                }}
              >
                {lider.votos} votos · {total} participantes
              </div>
            </div>
          ) : (
            <div
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 32,
                display: "flex",
              }}
            >
              ¡Sé el primero en votar!
            </div>
          )}

          {/* CTA */}
          <div
            style={{
              marginTop: 36,
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

  img.headers.set("Cache-Control", "public, max-age=60, s-maxage=60");
  return img;
}