"use client";

import { useState } from "react";

const fields = [
  ["composition", "Composition"],
  ["hierarchy", "Visual hierarchy"],
  ["spacing", "Spacing rhythm"],
  ["typography", "Typography"],
  ["color", "Color system"],
  ["layout", "Layout / grid"],
  ["components", "Component grammar"],
  ["imagery", "Imagery treatment"],
  ["distinctive", "Distinctive language"],
] as const;

export default function VisualIntelligence() {
  const [imageUrl, setImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  async function analyze() {
    setBusy(true);
    setError("");
    try {
      if (!imageUrl.trim()) throw new Error("Paste a captured reference image URL first.");
      const response = await fetch("/api/analyze-visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageUrl.trim(), title: title.trim() || "Reference" }),
      });
      const data = await response.json();
      if (!response.ok && !data.fallback) throw new Error(data.error || "Visual analysis failed.");
      setResult(data.visual || data.fallback);
      if (data.error) setError(data.error);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Visual analysis failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f5f4ef", color: "#27302d", padding: "48px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p style={{ fontSize: 11, letterSpacing: ".16em", opacity: .6 }}>AKANI / VISUAL INTELLIGENCE</p>
        <h1 style={{ fontSize: "clamp(42px, 7vw, 82px)", lineHeight: .95, margin: "18px 0", fontWeight: 500 }}>See why it<br /><i>works.</i></h1>
        <p style={{ maxWidth: 650, lineHeight: 1.7, opacity: .72 }}>Turn a captured reference into visual design DNA: composition, hierarchy, rhythm, type, color, layout, components and distinctive language.</p>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 44 }}>
          <div style={{ background: "#fbfaf6", border: "1px solid #dddcd4", padding: 22 }}>
            <label style={{ fontSize: 10, letterSpacing: ".14em" }}>CAPTURED REFERENCE</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Reference name" style={{ width: "100%", marginTop: 18, padding: 13, border: "1px solid #c9c8bf", background: "transparent" }} />
            <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://...vercel-storage.com/...jpg" style={{ width: "100%", marginTop: 10, padding: 13, border: "1px solid #c9c8bf", background: "transparent" }} />
            <button onClick={analyze} disabled={busy} style={{ marginTop: 12, padding: "13px 18px", border: 0, background: "#27302d", color: "#fbfaf6", cursor: "pointer" }}>{busy ? "ANALYZING VISUALS…" : "ANALYZE VISUAL DESIGN"}</button>
            {error && <p style={{ fontSize: 12, lineHeight: 1.6, marginTop: 16, color: "#8b4035" }}>{error}</p>}
          </div>
          <div style={{ background: "#eef0eb", minHeight: 280, overflow: "hidden" }}>
            {imageUrl ? <img src={imageUrl} alt="Captured reference" style={{ width: "100%", height: "100%", minHeight: 280, objectFit: "cover", objectPosition: "top" }} /> : <div style={{ padding: 24, opacity: .5 }}>The captured reference will appear here.</div>}
          </div>
        </section>

        {result && <section style={{ marginTop: 36 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", borderBottom: "1px solid #c9c8bf", paddingBottom: 12 }}>
            <div><p style={{ fontSize: 10, letterSpacing: ".14em", margin: 0 }}>DESIGN DNA / VISUAL LAYER</p><h2 style={{ fontSize: 34, fontWeight: 500, margin: "8px 0 0" }}>What the eye is learning.</h2></div>
            <span style={{ fontSize: 10, letterSpacing: ".1em", opacity: .55 }}>SCREENSHOT + STRUCTURE</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: "#c9c8bf", marginTop: 24 }}>
            {fields.map(([key, label]) => <article key={key} style={{ background: "#fbfaf6", padding: 22, minHeight: 170 }}><p style={{ fontSize: 10, letterSpacing: ".12em", opacity: .55, margin: 0 }}>{label}</p><p style={{ lineHeight: 1.65, fontSize: 14 }}>{result[key]}</p></article>)}
          </div>
          <div style={{ marginTop: 24, background: "#27302d", color: "#fbfaf6", padding: 28 }}>
            <p style={{ fontSize: 10, letterSpacing: ".14em", opacity: .6 }}>TRANSFERABLE PRINCIPLES</p>
            {(result.transfer || []).map((x: string, i: number) => <div key={x} style={{ display: "flex", gap: 18, padding: "14px 0", borderTop: "1px solid rgba(255,255,255,.15)" }}><small>0{i + 1}</small><b style={{ fontWeight: 500 }}>{x}</b></div>)}
          </div>
        </section>}
      </div>
    </main>
  );
}
