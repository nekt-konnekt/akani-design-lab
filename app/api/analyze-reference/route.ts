import { NextResponse } from "next/server";

function uniq(values: string[]) {
  return [...new Set(values.map(v => v.trim()).filter(Boolean))].slice(0, 12);
}

function extract(html: string, pattern: RegExp) {
  return uniq([...html.matchAll(pattern)].map(m => m[1] || ""));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = String(body?.url || "").trim();
    if (!input) return NextResponse.json({ error: "URL is required." }, { status: 400 });

    const url = input.startsWith("http://") || input.startsWith("https://") ? input : `https://${input}`;
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Only HTTP(S) URLs are supported." }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: { "User-Agent": "AKANI-Design-Lab/0.1 (+reference-analysis)" },
      redirect: "follow",
      signal: AbortSignal.timeout(12000),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Reference returned HTTP ${response.status}.` }, { status: 502 });
    }

    const html = (await response.text()).slice(0, 900000);
    const title = (html.match(/<title[^>]*>([\s\\S]*?)<\/title>/i)?.[1] || parsed.hostname)
      .replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim().slice(0, 120);

    const headings = extract(html, /<h[1-3][^>]*>([\s\\S]*?)<\/h[1-3]>/gi)
      .map(x => x.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

    const fonts = uniq([
      ...extract(html, /font-family\s*:\s*([^;}]+)/gi),
      ...extract(html, /family=([^&"'\s]+)/gi),
    ]).flatMap(x => x.split(",")).map(x => x.replace(/['"]/g, "").trim()).filter(x => x.length > 1 && x.length < 60);

    const colors = uniq(extract(html, /#[0-9a-fA-F]{3,8}\b/g));
    const scripts = (html.match(/<script\b/gi) || []).length;
    const stylesheets = (html.match(/<link[^>]+rel=["']stylesheet["']/gi) || []).length;
    const images = (html.match(/<img\b/gi) || []).length;
    const sections = (html.match(/<section\b/gi) || []).length;
    const text = html.replace(/<script[\s\\S]*?<\/script>/gi, " ").replace(/<style[\s\\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

    const dna = [
      headings.length ? `Strong heading hierarchy (${headings.length} detected)` : "Light heading structure",
      fonts.length ? `Typography signal: ${fonts.slice(0, 3).join(", ")}` : "Typography requires visual inspection",
      colors.length ? `Palette uses ${colors.length} explicit color values` : "Color system is not exposed in simple markup",
      sections > 4 ? "Section-led composition" : "Compact page composition",
      images > 8 ? "Image-led visual storytelling" : "Limited image dependence",
    ];

    const scores = {
      distinctiveness: Math.min(10, Math.max(4, Math.round((headings.length + Math.min(fonts.length, 4) + Math.min(colors.length, 8)) / 2))),
      hierarchy: Math.min(10, Math.max(4, headings.length >= 3 ? 9 : headings.length === 2 ? 7 : 5)),
      systemQuality: Math.min(10, Math.max(4, stylesheets > 1 ? 8 : 6)),
      motion: Math.min(10, Math.max(3, scripts > 10 ? 8 : scripts > 4 ? 6 : 4)),
    };

    return NextResponse.json({
      url: response.url || url,
      title,
      headings: headings.slice(0, 10),
      fonts: fonts.slice(0, 8),
      colors: colors.slice(0, 12),
      stats: { scripts, stylesheets, images, sections, textLength: text.length },
      scores,
      dna,
      analyzedAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to analyze reference.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
