# AKANI AI — low-cost setup

AKANI supports local Ollama first, then hosted Qwen, with Gemini retained as an optional fallback.

## Free/local

Install Ollama, then:

```bash
ollama pull qwen3.5:4b
ollama run qwen3.5:4b
```

Ollama serves its API at `http://localhost:11434`.

For local development:

```env
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen3.5:4b
```

The Qwen 3.5 4B model is multimodal and is about 3.3–4.0 GB in Ollama.

## Hosted

For Vercel production, Ollama on a personal computer is not reachable from Vercel. Use a reachable Ollama server/VPS, or configure Qwen cloud:

```env
AI_PROVIDER=qwen
QWEN_API_KEY=...
QWEN_BASE_URL=...
QWEN_MODEL=...
```

Never commit API keys.

## Automatic routing

With:

```env
AI_PROVIDER=auto
```

AKANI uses Ollama when `OLLAMA_BASE_URL` is configured, then Qwen, then Gemini.

The application does not need to know which provider performed the analysis; all providers return the same Visual DNA schema.
