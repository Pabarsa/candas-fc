import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://fondosurcanijo.com";
  const now = new Date();

  // Páginas de partido dinámicas
  const supabase = createClient();
  const { data: partidos } = await supabase
    .from("partidos")
    .select("id, updated_at")
    .order("jornada", { ascending: true });

  const partidoUrls: MetadataRoute.Sitemap = (partidos ?? []).map((p) => ({
    url: `${base}/partido/${p.id}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    { url: base,                            lastModified: now, changeFrequency: "daily",   priority: 1   },
    { url: `${base}/clasificacion`,         lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/fotos`,                 lastModified: now, changeFrequency: "weekly",  priority: 0.8 },
    { url: `${base}/equipo`,                lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/veteranos`,             lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/campo`,                 lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/directo`,               lastModified: now, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${base}/simulador`,             lastModified: now, changeFrequency: "weekly",  priority: 0.5 },
    { url: `${base}/registro`,              lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    { url: `${base}/legal/aviso-legal`,     lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${base}/legal/privacidad`,      lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${base}/legal/cookies`,         lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    ...partidoUrls,
  ];
}