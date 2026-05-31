import type { APIRoute } from "astro";
import { supabase } from "../lib/supabase";

export const prerender = false;

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split("T")[0];

  const { data: properties } = await supabase
    .from("properties")
    .select("id, updated_at, created_at")
    .in("status", ["activo", "vendido"])
    .order("display_order", { ascending: true });

  const staticPages = [
    { loc: "https://www.rocabusiness.net/", lastmod: today },
    { loc: "https://www.rocabusiness.net/propiedades/", lastmod: today },
    { loc: "https://www.rocabusiness.net/servicios/", lastmod: today },
    { loc: "https://www.rocabusiness.net/contacto/", lastmod: today },
  ];

  const propertyPages = (properties ?? []).map((p) => {
    const raw = p as Record<string, unknown>;
    const rawDate = (raw.updated_at ?? raw.created_at ?? today) as string;
    return {
      loc: `https://www.rocabusiness.net/propiedades/${p.id}`,
      lastmod: rawDate.split("T")[0],
    };
  });

  const allPages = [...staticPages, ...propertyPages];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
  .map(
    (p) => `  <url>
    <loc>${p.loc}</loc>
    <lastmod>${p.lastmod}</lastmod>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
