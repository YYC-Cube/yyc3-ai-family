// ============================================================
// YYC3 Hacker Chatbot — Branding & Agent Customization Tests (Vitest)
// Phase 51: Branding Config Test Suite
//
// Tests: BrandingConfig CRUD, logo storage separation,
//        AgentCustomConfig persistence, getMergedAgents merge logic,
//        default fallback behavior, AGENT_COLOR_PRESETS structure,
//        event dispatching on save.
//
// Run: npx vitest run src/lib/__tests__/branding-config.test.ts
// ============================================================

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AGENT_COLOR_PRESETS,
  DEFAULT_BRANDING,
  getMergedAgents,
  loadAgentCustomConfig,
  loadBranding,
  saveAgentCustomConfig,
  saveBranding,
  type AgentCustomConfig,
  type BrandingConfig,
  type CustomAgent
} from '../branding-config';
import { AGENT_REGISTRY } from '../types';

const BRANDING_KEY = 'yyc3-branding-config';
const BRANDING_LOGO_KEY = 'yyc3-branding-logo';
const AGENT_CUSTOM_KEY = 'yyc3-agent-custom-config';

// ============================================================
// Setup
// ============================================================

beforeEach(() => {
  localStorage.removeItem(BRANDING_KEY);
  localStorage.removeItem(BRANDING_LOGO_KEY);
  localStorage.removeItem(AGENT_CUSTOM_KEY);
});

// ============================================================
// Suite 1: DEFAULT_BRANDING structure
// ============================================================

describe('DEFAULT_BRANDING', () => {
  it('should have all required fields', () => {
    expect(DEFAULT_BRANDING).toHaveProperty('appName');
    expect(DEFAULT_BRANDING).toHaveProperty('tagline');
    expect(DEFAULT_BRANDING).toHaveProperty('version');
    expect(DEFAULT_BRANDING).toHaveProperty('logoText');
    expect(DEFAULT_BRANDING).toHaveProperty('logoDataUrl');
    expect(DEFAULT_BRANDING).toHaveProperty('logoFileName');
  });

  it('should have correct default values', () => {
    expect(DEFAULT_BRANDING.appName).toBe('YYC3_DEVOPS');
    expect(DEFAULT_BRANDING.tagline).toBe('v3.0.1-beta');
    expect(DEFAULT_BRANDING.version).toBe('3.0.1');
    expect(DEFAULT_BRANDING.logoText).toBe('Y3');
    expect(DEFAULT_BRANDING.logoDataUrl).toBe('');
    expect(DEFAULT_BRANDING.logoFileName).toBe('');
  });
});

// ============================================================
// Suite 2: loadBranding — default fallback
// ============================================================

describe('loadBranding — default fallback', () => {
  it('should return DEFAULT_BRANDING when localStorage is empty', () => {
    const result = loadBranding();
    expect(result).toEqual(DEFAULT_BRANDING);
  });

  it('should return a new object each time (no reference sharing)', () => {
    const a = loadBranding();
    const b = loadBranding();
    expect(a).not.toBe(b);
    expect(a).toEqual(b);
  });

  it('should return defaults when localStorage has invalid JSON', () => {
    localStorage.setItem(BRANDING_KEY, 'not-json');
    const result = loadBranding();
    expect(result).toEqual(DEFAULT_BRANDING);
  });
});

// ============================================================
// Suite 3: saveBranding / loadBranding round-trip
// ============================================================

describe('saveBranding / loadBranding round-trip', () => {
  it('should persist and retrieve appName', () => {
    const config: BrandingConfig = { ...DEFAULT_BRANDING, appName: 'MyCluster' };
    saveBranding(config);
    const loaded = loadBranding();
    expect(loaded.appName).toBe('MyCluster');
  });

  it('should persist tagline and version', () => {
    const config: BrandingConfig = { ...DEFAULT_BRANDING, tagline: 'Edge v2', version: '2.0.0' };
    saveBranding(config);
    const loaded = loadBranding();
    expect(loaded.tagline).toBe('Edge v2');
    expect(loaded.version).toBe('2.0.0');
  });

  it('should persist logoText', () => {
    const config: BrandingConfig = { ...DEFAULT_BRANDING, logoText: 'MC' };
    saveBranding(config);
    expect(loadBranding().logoText).toBe('MC');
  });

  it('should merge with defaults for missing fields', () => {
    // Simulate a partial save (old schema)
    localStorage.setItem(BRANDING_KEY, JSON.stringify({ appName: 'Partial' }));
    const loaded = loadBranding();
    expect(loaded.appName).toBe('Partial');
    expect(loaded.version).toBe(DEFAULT_BRANDING.version); // fallback
    expect(loaded.logoText).toBe(DEFAULT_BRANDING.logoText); // fallback
  });
});

// ============================================================
// Suite 4: Logo storage separation
// ============================================================

describe('Logo storage separation', () => {
  it('should store logo data URL in a separate key', () => {
    const fakeDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';
    const config: BrandingConfig = { ...DEFAULT_BRANDING, logoDataUrl: fakeDataUrl, logoFileName: 'logo.png' };
    saveBranding(config);

    // Main key should have __stored__ placeholder
    const mainRaw = JSON.parse(localStorage.getItem(BRANDING_KEY)!);
    expect(mainRaw.logoDataUrl).toBe('__stored__');

    // Logo key should have actual data
    expect(localStorage.getItem(BRANDING_LOGO_KEY)).toBe(fakeDataUrl);

    // loadBranding should reassemble
    const loaded = loadBranding();
    expect(loaded.logoDataUrl).toBe(fakeDataUrl);
    expect(loaded.logoFileName).toBe('logo.png');
  });

  it('should clear logo key when logoDataUrl is empty', () => {
    // First set a logo
    saveBranding({ ...DEFAULT_BRANDING, logoDataUrl: 'data:image/png;base64,abc' });
    expect(localStorage.getItem(BRANDING_LOGO_KEY)).toBe('data:image/png;base64,abc');

    // Now clear it
    saveBranding({ ...DEFAULT_BRANDING, logoDataUrl: '' });
    expect(localStorage.getItem(BRANDING_LOGO_KEY)).toBeNull();
    expect(loadBranding().logoDataUrl).toBe('');
  });

  it('should handle missing logo key gracefully', () => {
    // Simulate: main key says __stored__ but logo key is missing
    localStorage.setItem(BRANDING_KEY, JSON.stringify({ ...DEFAULT_BRANDING, logoDataUrl: '__stored__' }));
    const loaded = loadBranding();
    expect(loaded.logoDataUrl).toBe(''); // fallback to empty
  });
});

// ============================================================
// Suite 5: saveBranding event dispatching
// ============================================================

describe('saveBranding event dispatching', () => {
  it('should dispatch yyc3-branding-update event', () => {
    const handler = vi.fn();
    window.addEventListener('yyc3-branding-update', handler);
    try {
      saveBranding({ ...DEFAULT_BRANDING, appName: 'EventTest' });
      expect(handler).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener('yyc3-branding-update', handler);
    }
  });
});

// ============================================================
// Suite 6: loadAgentCustomConfig — default fallback
// ============================================================

describe('loadAgentCustomConfig — default fallback', () => {
  it('should return empty overrides and customAgents when localStorage is empty', () => {
    const result = loadAgentCustomConfig();
    expect(result.overrides).toEqual({});
    expect(result.customAgents).toEqual([]);
  });

  it('should return defaults on invalid JSON', () => {
    localStorage.setItem(AGENT_CUSTOM_KEY, '{{broken');
    const result = loadAgentCustomConfig();
    expect(result.overrides).toEqual({});
    expect(result.customAgents).toEqual([]);
  });
});

// ============================================================
// Suite 7: saveAgentCustomConfig / loadAgentCustomConfig round-trip
// ============================================================

describe('saveAgentCustomConfig round-trip', () => {
  it('should persist overrides for built-in agents', () => {
    const config: AgentCustomConfig = {
      overrides: { navigator: { name: 'NavBot', color: 'text-red-500' } },
      customAgents: [],
    };
    saveAgentCustomConfig(config);
    const loaded = loadAgentCustomConfig();
    expect(loaded.overrides['navigator']).toEqual({ name: 'NavBot', color: 'text-red-500' });
  });

  it('should persist custom agents', () => {
    const ca: CustomAgent = {
      id: 'custom-1', name: 'Test Agent', nameEn: 'Test Agent',
      role: 'Tester', desc: 'A test agent', descEn: 'A test agent',
      icon: 'Bot', color: 'text-cyan-500', bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/20', enabled: true,
    };
    const config: AgentCustomConfig = { overrides: {}, customAgents: [ca] };
    saveAgentCustomConfig(config);
    const loaded = loadAgentCustomConfig();
    expect(loaded.customAgents).toHaveLength(1);
    expect(loaded.customAgents[0].id).toBe('custom-1');
    expect(loaded.customAgents[0].name).toBe('Test Agent');
  });

  it('should dispatch yyc3-agents-update event', () => {
    const handler = vi.fn();
    window.addEventListener('yyc3-agents-update', handler);
    try {
      saveAgentCustomConfig({ overrides: {}, customAgents: [] });
      expect(handler).toHaveBeenCalledTimes(1);
    } finally {
      window.removeEventListener('yyc3-agents-update', handler);
    }
  });
});

// ============================================================
// Suite 8: getMergedAgents — merge logic
// ============================================================

describe('getMergedAgents — merge logic', () => {
  it('should return all built-in agents with no config', () => {
    const merged = getMergedAgents({ overrides: {}, customAgents: [] });
    expect(merged.length).toBe(AGENT_REGISTRY.length);
    merged.forEach(a => {
      expect(a.isCustom).toBe(false);
    });
  });

  it('should preserve built-in agent IDs and fields', () => {
    const merged = getMergedAgents({ overrides: {}, customAgents: [] });
    const navigator = merged.find(a => a.id === 'navigator');
    expect(navigator).toBeDefined();
    const original = AGENT_REGISTRY.find(a => a.id === 'navigator')!;
    expect(navigator!.name).toBe(original.name);
    expect(navigator!.nameEn).toBe(original.nameEn);
    expect(navigator!.role).toBe(original.role);
  });

  it('should apply overrides to built-in agents', () => {
    const config: AgentCustomConfig = {
      overrides: {
        navigator: { name: 'Custom Nav', role: 'Leader' },
      },
      customAgents: [],
    };
    const merged = getMergedAgents(config);
    const nav = merged.find(a => a.id === 'navigator')!;
    expect(nav.name).toBe('Custom Nav');
    expect(nav.role).toBe('Leader');
    // Other fields unchanged
    const original = AGENT_REGISTRY.find(a => a.id === 'navigator')!;
    expect(nav.nameEn).toBe(original.nameEn);
    expect(nav.desc).toBe(original.desc);
    expect(nav.isCustom).toBe(false);
  });

  it('should not apply empty string overrides', () => {
    const original = AGENT_REGISTRY.find(a => a.id === 'thinker')!;
    const config: AgentCustomConfig = {
      overrides: {
        thinker: { name: '', color: '' }, // empty strings should be ignored
      },
      customAgents: [],
    };
    const merged = getMergedAgents(config);
    const thinker = merged.find(a => a.id === 'thinker')!;
    expect(thinker.name).toBe(original.name); // unchanged because empty
    expect(thinker.color).toBe(original.color); // unchanged because empty
  });

  it('should append custom agents after built-in agents', () => {
    const ca: CustomAgent = {
      id: 'custom-merge-test', name: 'MergeTest', nameEn: 'MergeTest',
      role: 'Scout', desc: 'desc', descEn: 'desc-en',
      icon: 'Bot', color: 'text-pink-500', bgColor: 'bg-pink-500/10',
      borderColor: 'border-pink-500/20', enabled: true,
    };
    const config: AgentCustomConfig = { overrides: {}, customAgents: [ca] };
    const merged = getMergedAgents(config);
    expect(merged.length).toBe(AGENT_REGISTRY.length + 1);
    const last = merged[merged.length - 1];
    expect(last.id).toBe('custom-merge-test');
    expect(last.isCustom).toBe(true);
    expect(last.name).toBe('MergeTest');
    expect(last.role).toBe('Scout');
    expect(last.color).toBe('text-pink-500');
  });

  it('should handle multiple custom agents', () => {
    const agents: CustomAgent[] = [
      { id: 'c1', name: 'One', nameEn: 'One', role: 'R1', desc: '', descEn: '', icon: 'Bot', color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20', enabled: true },
      { id: 'c2', name: 'Two', nameEn: 'Two', role: 'R2', desc: '', descEn: '', icon: 'Bot', color: 'text-blue-500', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-500/20', enabled: true },
      { id: 'c3', name: 'Three', nameEn: 'Three', role: 'R3', desc: '', descEn: '', icon: 'Bot', color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20', enabled: true },
    ];
    const merged = getMergedAgents({ overrides: {}, customAgents: agents });
    expect(merged.length).toBe(AGENT_REGISTRY.length + 3);
    const customOnes = merged.filter(a => a.isCustom);
    expect(customOnes.length).toBe(3);
    expect(customOnes.map(a => a.id)).toEqual(['c1', 'c2', 'c3']);
  });

  it('should apply overrides AND append custom agents simultaneously', () => {
    const config: AgentCustomConfig = {
      overrides: {
        prophet: { name: 'Orakle', color: 'text-yellow-500' },
      },
      customAgents: [
        { id: 'custom-x', name: 'X', nameEn: 'X', role: 'Rx', desc: '', descEn: '', icon: 'Bot', color: 'text-teal-500', bgColor: 'bg-teal-500/10', borderColor: 'border-teal-500/20', enabled: true },
      ],
    };
    const merged = getMergedAgents(config);
    const prophet = merged.find(a => a.id === 'prophet')!;
    expect(prophet.name).toBe('Orakle');
    expect(prophet.color).toBe('text-yellow-500');
    expect(prophet.isCustom).toBe(false);

    const customX = merged.find(a => a.id === ('custom-x' as string))!;
    expect(customX.name).toBe('X');
    expect(customX.isCustom).toBe(true);
    expect(merged.length).toBe(AGENT_REGISTRY.length + 1);
  });

  it('should handle override for non-existent agent (ignored)', () => {
    const config: AgentCustomConfig = {
      overrides: { 'non-existent-agent': { name: 'Ghost' } },
      customAgents: [],
    };
    const merged = getMergedAgents(config);
    // Should still have exactly built-in count
    expect(merged.length).toBe(AGENT_REGISTRY.length);
    expect(merged.find(a => a.id === 'non-existent-agent')).toBeUndefined();
  });
});

// ============================================================
// Suite 9: AGENT_COLOR_PRESETS structure
// ============================================================

describe('AGENT_COLOR_PRESETS', () => {
  it('should have at least 8 presets', () => {
    expect(AGENT_COLOR_PRESETS.length).toBeGreaterThanOrEqual(8);
  });

  it('each preset should have label, color, bg, border fields', () => {
    AGENT_COLOR_PRESETS.forEach(preset => {
      expect(preset).toHaveProperty('label');
      expect(preset).toHaveProperty('color');
      expect(preset).toHaveProperty('bg');
      expect(preset).toHaveProperty('border');
      expect(typeof preset.label).toBe('string');
      expect(preset.color).toMatch(/^text-/);
      expect(preset.bg).toMatch(/^bg-/);
      expect(preset.border).toMatch(/^border-/);
    });
  });

  it('should have unique labels', () => {
    const labels = AGENT_COLOR_PRESETS.map(p => p.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

// ============================================================
// Suite 10: Edge cases
// ============================================================

describe('Edge cases', () => {
  it('saveBranding then loadBranding should survive special characters', () => {
    const config: BrandingConfig = {
      ...DEFAULT_BRANDING,
      appName: 'YYC3<script>alert("xss")</script>',
      tagline: 'Line1\nLine2\t"quotes"',
    };
    saveBranding(config);
    const loaded = loadBranding();
    expect(loaded.appName).toBe('YYC3<script>alert("xss")</script>');
    expect(loaded.tagline).toBe('Line1\nLine2\t"quotes"');
  });

  it('getMergedAgents should return isCustom=false for all built-in agents', () => {
    const merged = getMergedAgents({ overrides: {}, customAgents: [] });
    merged.forEach(agent => {
      expect(agent.isCustom).toBe(false);
    });
  });

  it('getMergedAgents should return isCustom=true for all custom agents', () => {
    const ca: CustomAgent = {
      id: 'cust-edge', name: 'Edge', nameEn: 'Edge', role: 'R',
      desc: '', descEn: '', icon: 'Bot',
      color: 'text-zinc-500', bgColor: 'bg-zinc-500/10',
      borderColor: 'border-zinc-500/20', enabled: true,
    };
    const merged = getMergedAgents({ overrides: {}, customAgents: [ca] });
    const custom = merged.find(a => a.id === 'cust-edge')!;
    expect(custom.isCustom).toBe(true);
  });

  it('empty customAgents array should not affect built-in count', () => {
    const merged = getMergedAgents({ overrides: {}, customAgents: [] });
    expect(merged.length).toBe(AGENT_REGISTRY.length);
  });

  it('undefined override values should not override built-in fields', () => {
    const config: AgentCustomConfig = {
      overrides: {
        sentinel: { name: undefined as unknown as string },
      },
      customAgents: [],
    };
    const merged = getMergedAgents(config);
    const sentinel = merged.find(a => a.id === 'sentinel')!;
    const original = AGENT_REGISTRY.find(a => a.id === 'sentinel')!;
    expect(sentinel.name).toBe(original.name);
  });
});
