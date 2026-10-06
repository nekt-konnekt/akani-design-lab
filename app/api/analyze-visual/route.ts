import { NextResponse } from "next/server";

export const maxDuration = 60;

type VisualDNA = {
  composition: string;
  hierarchy: string;
  spacing: string;
  typography: string;
  color: string;
  layout: string;
  components: string;
  imagery: string;
  distinctive: string;
  transfer: string[];
};

function fallbackVisual(stats: any, title: string): VisualDNA {
  const density = Number(stats?.textLength || 0) > 7000 ? "information-rich" : Number(stats?.textLength || 0) > 2500 ? "balanced" : "restrained";
  return {
    composition: `The captured page presents a ${density} composition; use the screenshot to judge the dominant focal area and preserve its intentional contrast rather than copying its surface.`,
    hierarchy: "Visual hierarchy should be read from the relative prominence of the first screen, headline, primary action and supporting content.",
    spacing: "Spacing appears best treated as a rhythm: identify the largest recurring gaps, section cadence and internal component padding before choosing exact values.",
    typography: "Typography should be evaluated as hierarchy first — display scale, body scale, weight contrast and line length — rather than as a font-name copy.",
    color: "Extract colors by role: canvas, surface, text, muted text, accent and action. Preserve the relationship between roles, not merely the hex values.",
    layout: "Translate the page into layout rules: container width, columns, alignment anchors, section transitions and responsive priorities.",
    components: "Look for repeated visual grammar across navigation, buttons, cards, links, forms and content blocks; reuse the grammar, not the markup.",
    imagery: "Imagery should be understood by treatment — crop, scale, aspect ratio, contrast, placement and relationship to text.",
    distinctive: `The strongest transferable lesson from ${title} is the combination of hierarchy, rhythm and visual restraint that makes the page recognizable.`,
    transfer: ["Preserve the hierarchy, change the content.", "Borrow the spacing rhythm, not the measurements.", "Translate color into semantic roles.", "Rebuild the visual grammar for the product's own personality."]
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const imageUrl = String(body?.imageUrl || "").trim();
    const title = String(body?.title || "Reference").trim();
    const structural = body?.structural || {};
    if (!imageUrl) return NextResponse.json({ error: "A captured reference image URL is required." }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        error: "Visual analysis needs a Gemini API key. Add GEMINI_API_KEY to the Vercel project environment, then run the visual analysis again.",
        fallback: fallbackVisual(structural.stats, title),
        configured: false,
      }, { status: 503 });
    }

    const imageResponse = await fetch(imageUrl, { signal: AbortSignal.timeout(20000) });
    if (!imageResponse.ok) throw new Error(`Unable to read captured image (${imageResponse.status}).`);
    const mime = imageResponse.headers.get("content-type") || "image/jpeg";
    const bytes = new Uint8Array(await imageResponse.arrayBuffer());
    const base64 = Buffer.from(bytes).toString("base64");

    const prompt = `You are AKANI Design Lab, a visual design intelligence engine. Analyze this captured website screenshot as a design artifact, not as a site to copy. Return ONLY valid JSON matching this exact shape: {"composition":"...","hierarchy":"...","spacing":"...","typography":"...","color":"...","layout":"...","components":"...","imagery":"...","distinctive":"...","transfer":["...","...","..."]}. Be concrete and visual. Explain relationships, rhythm, proportion, hierarchy, treatment and intent. Avoid generic praise. The goal is to extract transferable design principles for a different product. The reference title is ${title}. Structural signals from the HTML are: ${JSON.stringify(structural).slice(0, 12000)}`;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(apiKey), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }, { inline_data: { mime_type: mime, data: base64 } }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
      }),
      signal: AbortSignal.timeout(50000),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message || "Gemini visual analysis failed.");
    const text = data?.candidates?.[0]?.content?.parts?.find((part: any) => part.text)?.text;
    if (!text) throw new Error("Gemini returned no visual analysis.");
    const visual = JSON.parse(text) as VisualDNA;
    return NextResponse.json({ visual, analyzedAt: new Date().toISOString(), configured: true, model: "gemini-2.5-flash" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Visual analysis failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
