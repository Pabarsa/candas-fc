import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Parámetros Segunda Asturfútbol Grupo 1 Temporada 2025/26
const COD_COMPETICION = "22191380";
const COD_GRUPO       = "22243649";
const COD_TEMPORADA   = "21";
const CRON_SECRET     = process.env.CRON_SECRET ?? "";

async function fetchJornada(jornada: number) {
  const url = `https://www.asturfutbol.es/pnfg/NPcd/NFG_CmpJornada?cod_primaria=1000120&CodCompeticion=${COD_COMPETICION}&CodGrupo=${COD_GRUPO}&CodTemporada=${COD_TEMPORADA}&CodJornada=${jornada}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "es-ES,es;q=0.9",
      "Referer": "https://www.asturfutbol.es/",
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

function parsePartidoCandas(html: string) {
  // Buscar fila que contenga "Candás" o "Cand" en el HTML
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) ?? [];

  for (const row of rows) {
    if (!/cand[aá]s/i.test(row)) continue;

    // Extraer equipos
    const equipos = [...row.matchAll(/<td[^>]*>([^<]{3,40})<\/td>/gi)].map(m => m[1].trim()).filter(Boolean);

    // Buscar marcador: dígitos separados por - o :
    const marcador = row.match(/(\d+)\s*[-:]\s*(\d+)/);
    if (!marcador) continue;

    const local     = equipos[0] ?? "";
    const visitante = equipos[equipos.length - 1] ?? "";
    const golesLocal = parseInt(marcador[1]);
    const golesVisitante = parseInt(marcador[2]);

    // Estado del partido
    const enJuego = /en\s*juego|directo|live|\d+['']/i.test(row);
    const finalizado = /finaliz|fin\b/i.test(row);

    return { local, visitante, golesLocal, golesVisitante, enJuego, finalizado };
  }
  return null;
}

export async function GET(req: NextRequest) {
  // Verificar secret para cron
  const secret = req.nextUrl.searchParams.get("secret");
  const isCron = secret === CRON_SECRET && CRON_SECRET !== "";
  const isAdmin = !isCron; // Si no es cron, requiere auth

  if (!isCron) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const supabase = createClient();

    // Buscar el próximo partido o el partido de hoy del Candás
    const { data: equipos } = await supabase.from("equipos").select("id, nombre");
    const candas = equipos?.find(e => e.nombre === "Candás CF");
    if (!candas) return NextResponse.json({ error: "Candás CF no encontrado" }, { status: 404 });

    // Buscar partido de hoy o en curso
    const hoy = new Date();
    const inicio = new Date(hoy); inicio.setHours(0, 0, 0, 0);
    const fin    = new Date(hoy); fin.setHours(23, 59, 59, 999);

    const { data: partidos } = await supabase
      .from("partidos")
      .select("*, local:equipos!partidos_local_id_fkey(nombre), visitante:equipos!partidos_visitante_id_fkey(nombre)")
      .eq("jugado", false)
      .or(`local_id.eq.${candas.id},visitante_id.eq.${candas.id}`)
      .gte("fecha", inicio.toISOString())
      .lte("fecha", fin.toISOString())
      .limit(1);

    const partido = partidos?.[0];
    if (!partido) return NextResponse.json({ ok: true, mensaje: "No hay partido hoy" });

    // Scrape jornada
    const html = await fetchJornada(partido.jornada);
    const datos = parsePartidoCandas(html);

    if (!datos) return NextResponse.json({ ok: true, mensaje: "No se encontró el partido en Asturfútbol", jornada: partido.jornada });

    // Si el partido ha finalizado, actualizar Supabase
    if (datos.finalizado) {
      await supabase.from("partidos").update({
        jugado: true,
        goles_local:     datos.golesLocal,
        goles_visitante: datos.golesVisitante,
      }).eq("id", partido.id);
    }

    return NextResponse.json({
      ok: true,
      partidoId: partido.id,
      jornada: partido.jornada,
      ...datos,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}