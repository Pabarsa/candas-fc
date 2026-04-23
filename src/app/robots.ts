import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/abonados", "/simulador", "/api/"],
      },
    ],
    sitemap: "https://fondosurcanijo.com/sitemap.xml",
  };
}
