// ============================================================
// YYC3 Hacker Chatbot — Environment Variable Validator
// Phase 33: Dev Environment Bootstrap
//
// Usage (standalone):
//   npx tsx scripts/verify-env.ts
//   node --loader tsx scripts/verify-env.ts
//
// Usage (in code):
//   import { validateEnv } from './scripts/verify-env'
//   const result = validateEnv()
// ============================================================

interface EnvVarSpec {
  key: string;
  required: boolean;
  defaultValue: string;
  description: string;
  validate?: (value: string) => boolean;
  group: string;
}

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;
const PORT_REGEX = /^\d{1,5}$/;

const ENV_SPECS: EnvVarSpec[] = [
  // --- NAS Infrastructure ---
  { key: 'VITE_NAS_HOST', required: false, defaultValue: '192.168.3.45', description: 'NAS IP address', validate: v => IP_REGEX.test(v), group: 'NAS' },
  { key: 'VITE_NAS_SQLITE_PORT', required: false, defaultValue: '8484', description: 'SQLite HTTP Proxy port', validate: v => PORT_REGEX.test(v), group: 'NAS' },
  { key: 'VITE_NAS_DOCKER_PORT', required: false, defaultValue: '2375', description: 'Docker Engine API port', validate: v => PORT_REGEX.test(v), group: 'NAS' },
  { key: 'VITE_HEARTBEAT_WS_HOST', required: false, defaultValue: '192.168.3.45', description: 'Heartbeat WS host', validate: v => IP_REGEX.test(v) || v === 'localhost', group: 'NAS' },
  { key: 'VITE_HEARTBEAT_WS_PORT', required: false, defaultValue: '9090', description: 'Heartbeat WS port', validate: v => PORT_REGEX.test(v), group: 'NAS' },
  { key: 'VITE_HEARTBEAT_WS_PATH', required: false, defaultValue: '/ws/heartbeat', description: 'Heartbeat WS path', validate: v => v.startsWith('/'), group: 'NAS' },

  // --- Cluster Devices ---
  { key: 'VITE_DEVICE_M4_MAX', required: false, defaultValue: '192.168.3.22', description: 'MacBook Pro M4 Max IP', validate: v => IP_REGEX.test(v), group: 'Cluster' },
  { key: 'VITE_DEVICE_IMAC_M4', required: false, defaultValue: '192.168.3.77', description: 'iMac M4 IP', validate: v => IP_REGEX.test(v), group: 'Cluster' },
  { key: 'VITE_DEVICE_MATEBOOK', required: false, defaultValue: '192.168.3.66', description: 'MateBook X Pro IP', validate: v => IP_REGEX.test(v), group: 'Cluster' },
  { key: 'VITE_DEVICE_NAS', required: false, defaultValue: '192.168.3.45', description: 'NAS IP', validate: v => IP_REGEX.test(v), group: 'Cluster' },

  // --- LLM Provider API Keys ---
  { key: 'VITE_OPENAI_API_KEY', required: false, defaultValue: '', description: 'OpenAI API Key', validate: v => !v || v.startsWith('sk-'), group: 'LLM' },
  { key: 'VITE_ANTHROPIC_API_KEY', required: false, defaultValue: '', description: 'Anthropic API Key', validate: v => !v || v.startsWith('sk-ant-'), group: 'LLM' },
  { key: 'VITE_DEEPSEEK_API_KEY', required: false, defaultValue: '', description: 'DeepSeek API Key', group: 'LLM' },
  { key: 'VITE_ZHIPU_API_KEY', required: false, defaultValue: '', description: 'Zhipu Z.AI API Key', group: 'LLM' },
  { key: 'VITE_GOOGLE_API_KEY', required: false, defaultValue: '', description: 'Google AI API Key', group: 'LLM' },
  { key: 'VITE_GROQ_API_KEY', required: false, defaultValue: '', description: 'Groq API Key', validate: v => !v || v.startsWith('gsk_'), group: 'LLM' },

  // --- Local LLM ---
  { key: 'VITE_OLLAMA_HOST', required: false, defaultValue: 'localhost', description: 'Ollama host', group: 'Local LLM' },
  { key: 'VITE_OLLAMA_PORT', required: false, defaultValue: '11434', description: 'Ollama port', validate: v => PORT_REGEX.test(v), group: 'Local LLM' },
  { key: 'VITE_LMSTUDIO_HOST', required: false, defaultValue: 'localhost', description: 'LM Studio host', group: 'Local LLM' },
  { key: 'VITE_LMSTUDIO_PORT', required: false, defaultValue: '1234', description: 'LM Studio port', validate: v => PORT_REGEX.test(v), group: 'Local LLM' },

  // --- Application Config ---
  { key: 'VITE_PERSISTENCE_STRATEGY', required: false, defaultValue: 'localStorage', description: 'Persistence strategy', validate: v => ['localStorage', 'nasSqlite'].includes(v), group: 'App' },
  { key: 'VITE_METRICS_ARCHIVE_INTERVAL', required: false, defaultValue: '30000', description: 'Metrics interval (ms)', validate: v => Number(v) >= 1000, group: 'App' },
  { key: 'VITE_HEARTBEAT_SIMULATION_INTERVAL', required: false, defaultValue: '8000', description: 'Heartbeat sim interval (ms)', validate: v => Number(v) >= 1000, group: 'App' },
  { key: 'VITE_LOG_LEVEL', required: false, defaultValue: 'info', description: 'Log level', validate: v => ['debug', 'info', 'warn', 'error'].includes(v), group: 'App' },

  // --- Backend ---
  { key: 'VITE_API_BASE_URL', required: false, defaultValue: 'http://localhost:3001/api', description: 'REST API Base URL', validate: v => v.startsWith('http'), group: 'Backend' },
  { key: 'VITE_WS_URL', required: false, defaultValue: 'ws://localhost:3001/ws', description: 'WebSocket URL', validate: v => v.startsWith('ws'), group: 'Backend' },

  // --- KB Backend ---
  { key: 'VITE_KB_VECTOR_PORT', required: false, defaultValue: '8090', description: 'KB Vector Search port', validate: v => PORT_REGEX.test(v), group: 'KB Backend' },
  { key: 'VITE_KB_MULTIMODAL_PORT', required: false, defaultValue: '8091', description: 'KB OCR/ASR port', validate: v => PORT_REGEX.test(v), group: 'KB Backend' },
  { key: 'VITE_KB_NLP_PORT', required: false, defaultValue: '8092', description: 'KB NLP/KG port', validate: v => PORT_REGEX.test(v), group: 'KB Backend' },
];

export interface EnvValidationResult {
  valid: boolean;
  total: number;
  configured: number;
  warnings: string[];
  errors: string[];
  groups: Record<string, { total: number; configured: number; issues: string[] }>;
}

export function validateEnv(env?: Record<string, string | undefined>): EnvValidationResult {
  const getEnv = env
    ? (key: string) => env[key]
    : (key: string) => (typeof process !== 'undefined' ? process.env[key] : undefined);

  const result: EnvValidationResult = {
    valid: true,
    total: ENV_SPECS.length,
    configured: 0,
    warnings: [],
    errors: [],
    groups: {},
  };

  for (const spec of ENV_SPECS) {
    // Init group
    if (!result.groups[spec.group]) {
      result.groups[spec.group] = { total: 0, configured: 0, issues: [] };
    }
    result.groups[spec.group].total++;

    const value = getEnv(spec.key);

    if (!value && spec.required) {
      result.errors.push(`[REQUIRED] ${spec.key} — ${spec.description}`);
      result.groups[spec.group].issues.push(`${spec.key}: missing (required)`);
      result.valid = false;
      continue;
    }

    if (value) {
      result.configured++;
      result.groups[spec.group].configured++;

      if (spec.validate && !spec.validate(value)) {
        result.warnings.push(`[INVALID] ${spec.key}=${value} — ${spec.description}`);
        result.groups[spec.group].issues.push(`${spec.key}: invalid format`);
      }
    }
  }

  return result;
}

// ============================================================
// CLI Runner
// ============================================================

function main() {
  console.log('\n  YYC3 Environment Variable Validator\n');
  console.log('  =' .repeat(50));

  const result = validateEnv();

  // Group summary
  for (const [group, info] of Object.entries(result.groups)) {
    const status = info.issues.length === 0 ? '\x1b[32mOK\x1b[0m' : `\x1b[33m${info.issues.length} issues\x1b[0m`;
    console.log(`\n  [${group}] ${info.configured}/${info.total} configured — ${status}`);
    for (const issue of info.issues) {
      console.log(`    - ${issue}`);
    }
  }

  // Summary
  console.log('\n  ' + '='.repeat(50));
  console.log(`  Total: ${result.configured}/${result.total} variables configured`);

  if (result.errors.length > 0) {
    console.log(`  \x1b[31mErrors: ${result.errors.length}\x1b[0m`);
    result.errors.forEach(e => console.log(`    ${e}`));
  }
  if (result.warnings.length > 0) {
    console.log(`  \x1b[33mWarnings: ${result.warnings.length}\x1b[0m`);
    result.warnings.forEach(w => console.log(`    ${w}`));
  }

  // LLM provider count
  const llmKeys = ENV_SPECS.filter(s => s.group === 'LLM');
  const configuredLlm = llmKeys.filter(s => {
    const val = typeof process !== 'undefined' ? process.env[s.key] : undefined;
    return !!val;
  }).length;
  console.log(`\n  LLM Providers configured: ${configuredLlm}/${llmKeys.length}`);
  if (configuredLlm === 0) {
    console.log('  \x1b[33mHint: Configure at least 1 LLM provider in .env.local or UI Settings\x1b[0m');
  }

  console.log(`\n  Status: ${result.valid ? '\x1b[32mVALID\x1b[0m' : '\x1b[31mINVALID\x1b[0m'}\n`);

  if (typeof process !== 'undefined') {
    process.exit(result.valid ? 0 : 1);
  }
}

// Run if executed directly
if (typeof process !== 'undefined' && process.argv[1]?.includes('verify-env')) {
  main();
}
