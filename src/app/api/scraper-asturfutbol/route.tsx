import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

function parseResultados(html: string) {
  const resultados: { local: string; visitante: string; golesLocal: number; golesVisitante: number; finalizado: boolean; enJuego: boolean }[] = [];
  const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) ?? [];

  for (const row of rows) {
    const marcador = row.match(/(\d+)\s*[-:]\s*(\d+)/);
    if (!marcador) continue;

    const celdas = [...row.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)]
      .map(m => m[1].replace(/<[^>]+>/g, "").trim())
      .filter(t => t.length > 2 && t.length < 60);

    if (celdas.length < 2) continue;

    const local     = celdas[0];
    const visitante = celdas[celdas.length - 1];
    if (local === visitante) continue;

    const finalizado = /finaliz|fin\b/i.test(row);
    const enJuego   = /en\s*juego|directo|live|\d+['´']/i.test(row);

    resultados.push({
      local,
      visitante,
      golesLocal:      parseInt(marcador[1]),
      golesVisitante:  parseInt(marcador[2]),
      finalizado,
      enJuego,
    });
  }
  return resultados;
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  const isCron = secret === CRON_SECRET && CRON_SECRET !== "";

  if (!isCron) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const supabase = createClient();

    // Buscar la jornada más alta sin terminar (o la de hoy)
    const hoy = new Date();
    const inicioHoy = new Date(hoy); inicioHoy.setHours(0, 0, 0, 0);
    const finHoy    = new Date(hoy); finHoy.setHours(23, 59, 59, 999);

    const { data: partidosHoy } = await supabase
      .from("partidos")
      .select("jornada")
      .eq("jugado", false)
      .gte("fecha", inicioHoy.toISOString())
      .lte("fecha", finHoy.toISOString())
      .order("jornada", { ascending: false })
      .limit(1);

    if (!partidosHoy?.length) {
      return NextResponse.json({ ok: true, mensaje: "No hay partidos hoy" });
    }

    const jornada = partidosHoy[0].jornada;

    // Scrape toda la jornada
    const html = await fetchJornada(jornada);
    const resultados = parseResultados(html);

    if (!resultados.length) {
      return NextResponse.json({ ok: true, mensaje: "No se encontraron resultados en Asturfútbol", jornada });
    }

    // Cargar todos los partidos de esa jornada de Supabase
    const { data: partidosDB } = await supabase
      .from("partidos")
      .select("id, jugado, local:equipos!partidos_local_id_fkey(nombre), visitante:equipos!partidos_visitante_id_fkey(nombre)")
      .eq("jornada", jornada);

    let actualizados = 0;
    let candidatosCandas = null;

    for (const res of resultados) {
      // Buscar el partido correspondiente en Supabase por nombre de equipos
      const partido = partidosDB?.find(p => {
        const localDB     = (p.local as any)?.nombre ?? "";
        const visitanteDB = (p.visitante as any)?.nombre ?? "";
        return (
          localDB.toLowerCase().includes(res.local.toLowerCase().slice(0, 5)) ||
          res.local.toLowerCase().includes(localDB.toLowerCase().slice(0, 5))
        ) && (
          visitanteDB.toLowerCase().includes(res.visitante.toLowerCase().slice(0, 5)) ||
          res.visitante.toLowerCase().includes(visitanteDB.toLowerCase().slice(0, 5))
        );
      });

      if (!partido) continue;

      // Guardar si el partido ha finalizado y no estaba marcado como jugado
      if (res.finalizado && !partido.jugado) {
        await supabase.from("partidos").update({
          jugado:          true,
          goles_local:     res.golesLocal,
          goles_visitante: res.golesVisitante,
        }).eq("id", partido.id);
        actualizados++;
      }

      // Guardar marcador vivo del Candás para devolverlo
      const localDB     = (partido.local as any)?.nombre ?? "";
      const visitanteDB = (partido.visitante as any)?.nombre ?? "";
      if (localDB === "Candás CF" || visitanteDB === "Candás CF") {
        candidatosCandas = res;
      }
    }

    return NextResponse.json({
      ok:           true,
      jornada,
      resultados:   resultados.length,
      actualizados,
      candas:       candidatosCandas,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}