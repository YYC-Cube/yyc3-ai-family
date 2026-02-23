// ============================================================
// Phase 34: Dev-mode CORS Proxy Endpoint Resolver
// ============================================================
// Maps cloud LLM providers to local Vite proxy paths.
// Only active when `import.meta.env.DEV === true`.
// Local providers (Ollama, LM Studio) never need proxying.
//
// Architecture:
//   Browser → /api/proxy/deepseek/chat/completions
//           → Vite dev server proxy
//           → https://api.deepseek.com/v1/chat/completions
//
// In production builds, this module returns `undefined` for all
// providers, falling back to the provider's defaultEndpoint.
// ============================================================

/**
 * Proxy-prefix map for cloud providers.
 * Keys must match providerId in llm-providers.ts.
 * Values are the local proxy path prefix (without trailing slash).
 */
const DEV_PROXY_MAP: Record<string, string> = {
  openai: '/api/proxy/openai',
  anthropic: '/api/proxy/anthropic',
  deepseek: '/api/proxy/deepseek',
  zhipu: '/api/proxy/zhipu',
  gemini: '/api/proxy/gemini',
  groq: '/api/proxy/groq',
};

/**
 * Providers that run locally and never need CORS proxying.
 */
const LOCAL_PROVIDERS = new Set(['ollama', 'lmstudio']);

/**
 * Resolves the effective API endpoint for a given provider.
 *
 * Priority chain:
 *   1. User-configured endpoint override (from Settings) → always wins
 *   2. Dev-mode proxy path (if DEV && cloud provider) → CORS bypass
 *   3. undefined → let llm-bridge fall back to provider.defaultEndpoint
 *
 * @param providerId - e.g. 'deepseek', 'openai', 'ollama'
 * @param configEndpoint - user-configured override from ProviderConfig.endpoint
 * @returns resolved endpoint string, or undefined to use default
 */
export function resolveProviderEndpoint(
  providerId: string,
  configEndpoint?: string,
): string | undefined {
  // 1. User override always takes precedence
  if (configEndpoint && configEndpoint.trim().length > 0) {
    return configEndpoint;
  }

  // 2. Local providers — never proxy
  if (LOCAL_PROVIDERS.has(providerId)) {
    return undefined;
  }

  // 3. Dev mode — use Vite proxy path for cloud providers
  if (import.meta.env.DEV) {
    return DEV_PROXY_MAP[providerId] ?? undefined;
  }

  // 4. Production — use provider default
  return undefined;
}

/**
 * Check whether dev-mode proxy is available for a given provider.
 * Useful for UI hints in settings panel.
 */
export function isDevProxyAvailable(providerId: string): boolean {
  return import.meta.env.DEV && providerId in DEV_PROXY_MAP;
}

/**
 * Get the full list of proxied providers (for diagnostics display).
 */
export function getProxiedProviders(): string[] {
  if (!import.meta.env.DEV) return [];

  return Object.keys(DEV_PROXY_MAP);
}
