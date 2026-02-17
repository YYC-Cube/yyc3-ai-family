/// <reference types="vite/client" />

// ============================================================
// YYC3 Hacker Chatbot — Vite Environment Type Declarations
// Provides IntelliSense for import.meta.env variables
// ============================================================

// --- Figma Make Virtual Module: figma:asset ---
// The Figma Make sandbox resolves `figma:asset/*` imports at build time.
// This declaration ensures TypeScript recognises them as valid modules.
declare module 'figma:asset/*' {
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  // --- NAS Infrastructure ---
  readonly VITE_NAS_HOST: string;
  readonly VITE_NAS_SQLITE_PORT: string;
  readonly VITE_NAS_DOCKER_PORT: string;
  readonly VITE_HEARTBEAT_WS_HOST: string;
  readonly VITE_HEARTBEAT_WS_PORT: string;
  readonly VITE_HEARTBEAT_WS_PATH: string;

  // --- Cluster Device IPs ---
  readonly VITE_DEVICE_M4_MAX: string;
  readonly VITE_DEVICE_IMAC_M4: string;
  readonly VITE_DEVICE_MATEBOOK: string;
  readonly VITE_DEVICE_NAS: string;

  // --- LLM Provider API Keys ---
  readonly VITE_OPENAI_API_KEY: string;
  readonly VITE_ANTHROPIC_API_KEY: string;
  readonly VITE_DEEPSEEK_API_KEY: string;
  readonly VITE_ZHIPU_API_KEY: string;
  readonly VITE_GOOGLE_API_KEY: string;
  readonly VITE_GROQ_API_KEY: string;

  // --- Local LLM Services ---
  readonly VITE_OLLAMA_HOST: string;
  readonly VITE_OLLAMA_PORT: string;
  readonly VITE_LMSTUDIO_HOST: string;
  readonly VITE_LMSTUDIO_PORT: string;

  // --- Application Config ---
  readonly VITE_PERSISTENCE_STRATEGY: 'localStorage' | 'nasSqlite';
  readonly VITE_METRICS_ARCHIVE_INTERVAL: string;
  readonly VITE_HEARTBEAT_SIMULATION_INTERVAL: string;
  readonly VITE_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';

  // --- Express Backend (optional) ---
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;

  // --- KB Backend Services (Phase 32) ---
  readonly VITE_KB_VECTOR_PORT: string;
  readonly VITE_KB_MULTIMODAL_PORT: string;
  readonly VITE_KB_NLP_PORT: string;

  // --- Application Environment (4-Environment Setup) ---
  readonly VITE_APP_PORT: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production' | 'testing';

  // --- AI Capability Enhancement ---
  readonly VITE_AI_CONTEXT_SIZE: string;
  readonly VITE_AI_TEMPERATURE: string;
  readonly VITE_AI_STREAMING: string;
  readonly VITE_AI_MAX_RETRIES: string;
  readonly VITE_AI_TIMEOUT: string;
  readonly VITE_AI_FUNCTION_CALLING: string;

  // --- Knowledge Base Enhancement ---
  readonly VITE_KB_SIMILARITY_THRESHOLD: string;
  readonly VITE_KB_MAX_RESULTS: string;
  readonly VITE_KB_SEMANTIC_CACHE: string;
}
