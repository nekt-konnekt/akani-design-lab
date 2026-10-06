import type { VisualDNA, VisionRequest } from "./types";

function extractJson(text: string): VisualDNA {
  const cleaned = text.replace(/^\\s*\\`\\`\\`(?:json)?/i, "").replace(/\\`\\`\\`\\s*$/i, "").trim();
  return JSON.parse(cleaned) as VisualDNA;
}

export async function analyzeWithQwen(input: VisionRequest): Promise<{ visual: VisualDNA; model: string }> {
  const apiKey = process.env.QWEN_API_KEY || process.env.DASHSCOPE_API_KEY;
  if (!apiKey) throw new Error("QWEN_API_KEY is not configured.");
  const baseUrl = (process.env.QWEN_BASE_URL || "").replace(/\\/$/, "");
  if (!baseUrl) throw new Error("QWEN_BASE_URL is not configured.");

  const model = process.env.QWEN_MODEL || "qwen3-vl-plus";
  const prompt = `You are AKANI Design Lab, a visual design intelligence engine. Analyze this captured website screenshot as a design artifact, not as a site to copy. Return ONLY valid JSON with exactly these keys: composition, hierarchy, spacing, typography, color, layout, components, imagery, distinctive, transfer. transfer must be an array of 4-6 concrete transferable design principles. Be specific about proportion, rhythm, hierarchy, typography, color roles, component grammar and intent. Reference title: ${input.title}. Structural signals: ${JSON.stringify(input.structural || {}).slice(0, 12000)}`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{
        role: "user",
        content: [
          { type: "image_url", image_url: { url: input.imageUrl } },
          { type: "text", text: prompt }
        ]
      }],
      temperature: 0.2,
      response_format: { type: "json_object" }
    }),
    signal: AbortSignal.timeout(55000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error?.message || "Qwen visual analysis failed.");
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Qwen returned no visual analysis.");
  return { visual: extractJson(typeof content === "string" ? content : JSON.stringify(content)), model };
}
