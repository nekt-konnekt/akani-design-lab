export type VisualDNA = {
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

export type VisionRequest = {
  imageUrl: string;
  title: string;
  structural?: unknown;
};

export type AIProvider = "auto" | "ollama" | "qwen" | "gemini";
