import type { VisualDNA, VisionRequest } from "./types";

function extractJson(text: string): VisualDNA {
  const cleaned = text.replace(/^\\s*\\`\\`\\`(?:json)?/i, "").replace(/\\`\\`\\`\\s*$/i, "").trim();
  return JSON.parse(cleaned) as VisualDNA;
}

export async function analyzeWithOllama(input: VisionRequest): Promise<{ visual: VisualDNA; model: string }> {
  const baseUrl = (process.env.OLLAMA_BASE_URL || "http://localhost:11434").replace(/\\/$/, "");
  const model = process.env.OLLAMA_MODEL || "qwen3.5:4b";
  const imageResponse = await fetch(input.imageUrl, { signal: AbortSignal.timeout(20000) });
  if (!imageResponse.ok) throw new Error(`Unable to read captured image (${imageResponse.status}).`);
  const mime = imageResponse.headers.get("content-type") || "image/jpeg";
  const base64 = Buffer.from(await imageResponse.arrayBuffer()).toString("base64");

  const prompt = `You are AKANI Design Lab, a visual design intelligence engine. Analyze this captured website screenshot as a design artifact, not as a site to copy. Return ONLY valid JSON with exactly these keys: composition, hierarchy, spacing, typography, color, layout, components, imagery, distinctive, transfer. transfer must be an array of 4-6 concrete transferable design principles. Be specific about proportion, rhythm, hierarchy, typography, color roles, component grammar and intent. Reference title: ${input.title}. Structural signals: ${JSON.stringify(input.structural || {}).slice(0, 12000)}`;

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      format: "json",
      messages: [{ role: "user", content: prompt, images: [base64] }],
      options: { temperature: 0.2 }
    }),
    signal: AbortSignal.timeout(55000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || "Ollama visual analysis failed.");
  const content = data?.message?.content;
  if (!content) throw new Error("Ollama returned no visual analysis.");
  return { visual: extractJson(content), model };
}
