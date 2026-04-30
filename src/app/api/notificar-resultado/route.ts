import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { data: perfil } = await supabase.from("profiles").select("rol").eq("id", user.id).single();
    if (perfil?.rol !== "admin") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const { partidoId } = await req.json();

    const { data: p } = await supabase
      .from("partidos")
      .select("*, local:equipos!partidos_local_id_fkey(nombre), visitante:equipos!partidos_visitante_id_fkey(nombre)")
      .eq("id", partidoId)
      .single();

    if (!p) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fondosurcanijo.com";
    const candasEsLocal = p.local.nombre === "Candás CF";
    const gF = candasEsLocal ? p.goles_local : p.goles_visitante;
    const gC = candasEsLocal ? p.goles_visitante : p.goles_local;
    const rival = candasEsLocal ? p.visitante.nombre : p.local.nombre;
    const resultado = gF > gC ? "Victoria" : gF < gC ? "Derrota" : "Empate";
    const emoji = gF > gC ? "🟢" : gF < gC ? "🔴" : "🟡";

    const texto = `${emoji} *${resultado}* del Candás CF\n\n*Candás CF ${gF} - ${gC} ${rival}*\nJornada ${p.jornada}\n\n📷 Fotos y encuesta del mejor jugador:\n${siteUrl}/partido/${p.id}`;

    const url = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    return NextResponse.json({ url, texto });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}