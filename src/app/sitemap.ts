import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://fondosurcanijo.com";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/clasificacion`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/fotos`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/equipo`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/campo`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/directo`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/simulador`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/registro`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/legal/aviso-legal`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/privacidad`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/legal/cookies`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
