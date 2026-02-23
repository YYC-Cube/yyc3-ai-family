// ============================================================
// Phase 51: Branding & Agent Customization Config
// ============================================================
// Shared utility for app branding (logo/name/tagline) and
// agent card customization (overrides + custom agents).
// Persisted to localStorage, read by Sidebar + Settings.
// ============================================================

import type { AgentInfo } from './types';
import { AGENT_REGISTRY } from './types';

// ─── Branding ──────────────────────────────────────────────

export interface BrandingConfig {
  appName: string;
  tagline: string;
  version: string;
  logoText: string; // Short text shown inside logo box (e.g. "Y3")
  logoDataUrl: string; // Base64 data URL for uploaded logo image
  logoFileName: string; // Original file name for display
}

const BRANDING_STORAGE_KEY = 'yyc3-branding-config';
const BRANDING_LOGO_KEY = 'yyc3-branding-logo';

export const DEFAULT_BRANDING: BrandingConfig = {
  appName: 'YYC3_DEVOPS',
  tagline: 'v3.0.1-beta',
  version: '3.0.1',
  logoText: 'Y3',
  logoDataUrl: '',
  logoFileName: '',
};

export function loadBranding(): BrandingConfig {
  try {
    const raw = localStorage.getItem(BRANDING_STORAGE_KEY);

    if (raw) {
      const parsed = { ...DEFAULT_BRANDING, ...JSON.parse(raw) };

      // Load logo separately (can be large)
      if (parsed.logoDataUrl === '__stored__') {
        parsed.logoDataUrl = localStorage.getItem(BRANDING_LOGO_KEY) || '';
      }

      return parsed;
    }
  } catch { /* ignore */ }

  return { ...DEFAULT_BRANDING };
}

export function saveBranding(config: BrandingConfig) {
  try {
    // Store logo separately (can be large base64)
    if (config.logoDataUrl && config.logoDataUrl !== '__stored__') {
      localStorage.setItem(BRANDING_LOGO_KEY, config.logoDataUrl);
    } else if (!config.logoDataUrl) {
      localStorage.removeItem(BRANDING_LOGO_KEY);
    }
    const toSave = { ...config, logoDataUrl: config.logoDataUrl ? '__stored__' : '' };

    localStorage.setItem(BRANDING_STORAGE_KEY, JSON.stringify(toSave));
  } catch { /* ignore — may exceed quota */ }
  // Notify other components
  window.dispatchEvent(new Event('yyc3-branding-update'));
}

// ─── Agent Customization ──────────────────────────────────

export interface AgentOverride {
  name?: string;
  nameEn?: string;
  role?: string;
  desc?: string;
  descEn?: string;
  icon?: string;
  color?: string;
  bgColor?: string;
  borderColor?: string;
}

export interface CustomAgent {
  id: string; // unique id like 'custom-xxx'
  name: string;
  nameEn: string;
  role: string;
  desc: string;
  descEn: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  enabled: boolean;
}

export interface AgentCustomConfig {
  overrides: Record<string, AgentOverride>; // keyed by built-in agent id
  customAgents: CustomAgent[];
}

const AGENT_CUSTOM_STORAGE_KEY = 'yyc3-agent-custom-config';

export function loadAgentCustomConfig(): AgentCustomConfig {
  try {
    const raw = localStorage.getItem(AGENT_CUSTOM_STORAGE_KEY);

    if (raw) return { overrides: {}, customAgents: [], ...JSON.parse(raw) };
  } catch { /* ignore */ }

  return { overrides: {}, customAgents: [] };
}

export function saveAgentCustomConfig(config: AgentCustomConfig) {
  try {
    localStorage.setItem(AGENT_CUSTOM_STORAGE_KEY, JSON.stringify(config));
  } catch { /* ignore */ }
  window.dispatchEvent(new Event('yyc3-agents-update'));
}

/**
 * Merge built-in AGENT_REGISTRY with user overrides to produce the effective agent list.
 * Returns built-in agents (with overrides applied) + custom agents appended.
 */
export function getMergedAgents(config: AgentCustomConfig): (Omit<AgentInfo, 'id'> & { id: string; isCustom?: boolean })[] {
  const merged = AGENT_REGISTRY.map(agent => {
    const override = config.overrides[agent.id];

    if (!override) return { ...agent, isCustom: false };

    return {
      ...agent,
      ...Object.fromEntries(
        Object.entries(override).filter(([_, v]) => v !== undefined && v !== ''),
      ),
      isCustom: false,
    };
  });

  const custom = config.customAgents.map(ca => ({
    id: ca.id,
    name: ca.name,
    nameEn: ca.nameEn,
    role: ca.role,
    desc: ca.desc,
    descEn: ca.descEn,
    icon: ca.icon,
    color: ca.color,
    bgColor: ca.bgColor,
    borderColor: ca.borderColor,
    isCustom: true,
  }));

  return [...merged, ...custom];
}

// ─── Color Presets for Custom Agents ──────────────────────

export const AGENT_COLOR_PRESETS = [
  { label: 'Amber', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { label: 'Blue', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { label: 'Purple', color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { label: 'Pink', color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { label: 'Cyan', color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  { label: 'Red', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { label: 'Green', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20' },
  { label: 'Orange', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { label: 'Teal', color: 'text-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
  { label: 'Indigo', color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
];
