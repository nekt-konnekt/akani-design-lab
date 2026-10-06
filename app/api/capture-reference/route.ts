import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";
import chromium from "@sparticuz/chromium";
import { chromium as playwright } from "playwright-core";
import { put } from "@vercel/blob";

export const maxDuration = 60;

export async function POST(request: Request) {
  let browser: Awaited<ReturnType<typeof playwright.launch>> | null = null;
  try {
    const body = await request.json();
    const input = String(body?.url || "").trim();
    if (!input) return NextResponse.json({ error: "URL is required." }, { status: 400 });

    const url = input.startsWith("http://") || input.startsWith("https://") ? input : `https://${input}`;
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return NextResponse.json({ error: "Only HTTP(S) URLs are supported." }, { status: 400 });
    }

    const executablePath = await chromium.executablePath();
    browser = await playwright.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });

    const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1500);

    const screenshot = await page.screenshot({ type: "jpeg", quality: 78, fullPage: true });
    const title = await page.title().catch(() => parsed.hostname);
    const blob = await put(`references/${encodeURIComponent(parsed.hostname)}-${Date.now()}.jpg`, Buffer.from(screenshot), {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: true,
    });

    return Response.json({
      url: blob.url,
      title: title.slice(0, 120),
      capturedAt: new Date().toISOString(),
      viewport: { width: 1440, height: 900 },
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to capture reference.";
    return NextResponse.json({ error: message }, { status: 502 });
  } finally {
    await browser?.close().catch(() => {});
  }
}