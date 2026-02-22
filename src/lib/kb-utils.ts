// ============================================================
// YYC3 Hacker Chatbot — Knowledge Base Utilities
// Phase 32: KB Enhancement (Export/Import + AI Summary + Fuzzy Search)
//
// Features:
//   1. JSON Export/Import with validation
//   2. LLM Bridge auto-summary generation
//   3. Fuzzy search with keyword highlighting
//   4. NAS backend interface stubs (semantic search, OCR/ASR, KG NER)
//
// Shared by:
//   - views/KnowledgeBaseView.tsx
//   - console/KnowledgeBase.tsx
// ============================================================

import type { KnowledgeEntry, KnowledgeCategory } from './agent-identity';
import { generalStreamChat, hasConfiguredProvider, type StreamChunk, type LLMMessage } from './llm-bridge';
import { eventBus } from './event-bus';

// ============================================================
// 1. JSON Export/Import
// ============================================================

export interface KBExportData {
  version: '1.0';
  exportedAt: string;
  source: 'yyc3-knowledge-base';
  entryCount: number;
  entries: KnowledgeEntry[];
}

/**
 * Export knowledge entries as a downloadable JSON file.
 */
export function exportKnowledgeJSON(entries: KnowledgeEntry[]): void {
  const data: KBExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    source: 'yyc3-knowledge-base',
    entryCount: entries.length,
    entries,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `yyc3-kb-export-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  eventBus.persist('knowledge_export', `Exported ${entries.length} entries`, 'info');
}

/**
 * Import knowledge entries from a JSON file.
 * Returns validated entries and any errors.
 */
export interface KBImportResult {
  success: boolean;
  entries: KnowledgeEntry[];
  errors: string[];
  merged: number;
  added: number;
}

const VALID_CATEGORIES: KnowledgeCategory[] = [
  'architecture', 'devops', 'security', 'ai-ml',
  'best-practice', 'troubleshooting', 'family', 'general',
];

function validateEntry(raw: Record<string, unknown>, index: number): { entry: KnowledgeEntry | null; error: string | null } {
  const errors: string[] = [];

  if (typeof raw.id !== 'string' || !raw.id) errors.push(`[${index}] missing id`);
  if (typeof raw.title !== 'string' || !raw.title) errors.push(`[${index}] missing title`);
  if (typeof raw.content !== 'string') errors.push(`[${index}] missing content`);

  if (errors.length > 0) return { entry: null, error: errors.join('; ') };

  const category = VALID_CATEGORIES.includes(raw.category as KnowledgeCategory)
    ? (raw.category as KnowledgeCategory)
    : 'general';

  return {
    entry: {
      id: raw.id as string,
      title: raw.title as string,
      content: (raw.content as string) || '',
      summary: (typeof raw.summary === 'string' ? raw.summary : '') || '',
      category,
      tags: Array.isArray(raw.tags) ? (raw.tags as string[]).filter(t => typeof t === 'string') : [],
      linkedAgents: Array.isArray(raw.linkedAgents) ? (raw.linkedAgents as string[]).filter(a => typeof a === 'string') : [],
      source: (typeof raw.source === 'string' ? raw.source : 'Import'),
      importance: (['low', 'medium', 'high', 'critical'].includes(raw.importance as string)
        ? (raw.importance as 'low' | 'medium' | 'high' | 'critical')
        : 'medium'),
      createdAt: (typeof raw.createdAt === 'string' ? raw.createdAt : new Date().toISOString()),
      updatedAt: (typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString()),
      accessCount: (typeof raw.accessCount === 'number' ? raw.accessCount : 0),
    },
    error: null,
  };
}

export function parseImportJSON(jsonString: string, existingEntries: KnowledgeEntry[]): KBImportResult {
  const result: KBImportResult = { success: false, entries: [], errors: [], merged: 0, added: 0 };

  try {
    const parsed = JSON.parse(jsonString) as Record<string, unknown>;
    let rawEntries: Record<string, unknown>[];

    // Support both wrapped format and bare array
    if (parsed.version === '1.0' && Array.isArray(parsed.entries)) {
      rawEntries = parsed.entries as Record<string, unknown>[];
    } else if (Array.isArray(parsed)) {
      rawEntries = parsed as Record<string, unknown>[];
    } else {
      result.errors.push('Invalid format: expected { version, entries } or an array');
      return result;
    }

    const existingIds = new Set(existingEntries.map(e => e.id));
    const importedEntries: KnowledgeEntry[] = [];

    for (let i = 0; i < rawEntries.length; i++) {
      const { entry, error } = validateEntry(rawEntries[i], i);
      if (error) {
        result.errors.push(error);
        continue;
      }
      if (!entry) continue;

      if (existingIds.has(entry.id)) {
        result.merged++;
      } else {
        result.added++;
      }
      importedEntries.push(entry);
    }

    result.entries = importedEntries;
    result.success = importedEntries.length > 0;

    eventBus.persist('knowledge_import',
      `Imported ${importedEntries.length} entries (${result.added} new, ${result.merged} merged)`,
      result.errors.length > 0 ? 'warn' : 'info'
    );
  } catch (err) {
    result.errors.push(`JSON parse error: ${(err as Error).message}`);
  }

  return result;
}

/**
 * Merge imported entries into existing entries.
 * Newer updatedAt wins for duplicates.
 */
export function mergeEntries(existing: KnowledgeEntry[], imported: KnowledgeEntry[]): KnowledgeEntry[] {
  const map = new Map<string, KnowledgeEntry>();
  for (const e of existing) map.set(e.id, e);
  for (const e of imported) {
    const current = map.get(e.id);
    if (!current || e.updatedAt > current.updatedAt) {
      map.set(e.id, e);
    }
  }
  return Array.from(map.values());
}

/**
 * Trigger file picker and return selected file content as string.
 */
export function pickJSONFile(): Promise<string | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) { resolve(null); return; }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsText(file);
    };
    input.click();
  });
}

// ============================================================
// 2. LLM Bridge Auto-Summary
// ============================================================

export interface SummaryResult {
  summary: string;
  isStreaming: boolean;
  error: string | null;
}

/**
 * Check if any LLM provider is available for summary generation.
 */
export function canGenerateSummary(): boolean {
  return hasConfiguredProvider();
}

/**
 * Generate a summary for a knowledge entry using the configured LLM.
 * Streams tokens via callback.
 */
export async function generateEntrySummary(
  entry: { title: string; content: string; tags: string[] },
  onChunk: (text: string, done: boolean) => void,
  signal?: AbortSignal
): Promise<string | null> {
  if (!hasConfiguredProvider()) {
    onChunk('', true);
    return null;
  }

  const prompt = `Please generate a concise summary (within 80 characters in the same language as the content) for the following knowledge entry. Return ONLY the summary text, nothing else.

Title: ${entry.title}
Tags: ${entry.tags.join(', ')}
Content:
${entry.content.slice(0, 2000)}`;

  let accumulated = '';

  const handleChunk = (chunk: StreamChunk) => {
    if (chunk.type === 'content') {
      accumulated += chunk.content;
      onChunk(accumulated, false);
    } else if (chunk.type === 'done') {
      onChunk(accumulated, true);
    } else if (chunk.type === 'error') {
      onChunk(accumulated, true);
    }
  };

  try {
    const history: LLMMessage[] = [];
    const response = await generalStreamChat(prompt, history, handleChunk, signal);
    if (!response) {
      // All providers failed — return accumulated if any
      onChunk(accumulated || '(LLM unavailable)', true);
      return accumulated || null;
    }
    return accumulated;
  } catch (err) {
    const msg = (err as Error).message || 'Unknown error';
    if (msg !== 'Request aborted') {
      onChunk(`Error: ${msg}`, true);
    }
    return null;
  }
}

// ============================================================
// 3. Fuzzy Search + Keyword Highlighting
// ============================================================

export interface FuzzySearchResult<T> {
  item: T;
  score: number;
  matches: { field: string; indices: Array<[number, number]> }[];
}

/**
 * Tokenize search query into individual terms.
 */
function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,;]+/)
    .map(t => t.trim())
    .filter(t => t.length > 0);
}

/**
 * Find all match indices for a single token in text.
 */
function findMatchIndices(text: string, token: string): Array<[number, number]> {
  const indices: Array<[number, number]> = [];
  const lower = text.toLowerCase();
  let pos = 0;
  while (pos < lower.length) {
    const idx = lower.indexOf(token, pos);
    if (idx === -1) break;
    indices.push([idx, idx + token.length]);
    pos = idx + 1;
  }
  return indices;
}

/**
 * Score and search knowledge entries using fuzzy matching.
 * Weights: title(5x), summary(3x), content(1x), tags(4x)
 */
export function fuzzySearchEntries(
  entries: KnowledgeEntry[],
  query: string
): FuzzySearchResult<KnowledgeEntry>[] {
  if (!query.trim()) return entries.map(item => ({ item, score: 0, matches: [] }));

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return entries.map(item => ({ item, score: 0, matches: [] }));

  const results: FuzzySearchResult<KnowledgeEntry>[] = [];

  for (const entry of entries) {
    let score = 0;
    const matches: FuzzySearchResult<KnowledgeEntry>['matches'] = [];

    for (const token of tokens) {
      // Title matches (5x weight)
      const titleIndices = findMatchIndices(entry.title, token);
      if (titleIndices.length > 0) {
        score += titleIndices.length * 5;
        matches.push({ field: 'title', indices: titleIndices });
      }

      // Summary matches (3x weight)
      const summaryIndices = findMatchIndices(entry.summary || '', token);
      if (summaryIndices.length > 0) {
        score += summaryIndices.length * 3;
        matches.push({ field: 'summary', indices: summaryIndices });
      }

      // Content matches (1x weight)
      const contentIndices = findMatchIndices(entry.content, token);
      if (contentIndices.length > 0) {
        score += contentIndices.length;
        matches.push({ field: 'content', indices: contentIndices });
      }

      // Tag matches (4x weight)
      for (const tag of entry.tags) {
        const tagIndices = findMatchIndices(tag, token);
        if (tagIndices.length > 0) {
          score += tagIndices.length * 4;
          matches.push({ field: 'tag', indices: tagIndices });
        }
      }
    }

    if (score > 0) {
      results.push({ item: entry, score, matches });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Simple version for the Views KB (which uses a different doc structure)
 */
export interface SimpleDoc {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  [key: string]: unknown;
}

export function fuzzySearchSimpleDocs<T extends SimpleDoc>(
  docs: T[],
  query: string
): FuzzySearchResult<T>[] {
  if (!query.trim()) return docs.map(item => ({ item, score: 0, matches: [] }));

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return docs.map(item => ({ item, score: 0, matches: [] }));

  const results: FuzzySearchResult<T>[] = [];

  for (const doc of docs) {
    let score = 0;
    const matches: FuzzySearchResult<T>['matches'] = [];

    for (const token of tokens) {
      const titleIndices = findMatchIndices(doc.title, token);
      if (titleIndices.length > 0) {
        score += titleIndices.length * 5;
        matches.push({ field: 'title', indices: titleIndices });
      }

      const contentIndices = findMatchIndices(doc.content, token);
      if (contentIndices.length > 0) {
        score += contentIndices.length;
        matches.push({ field: 'content', indices: contentIndices });
      }

      for (const tag of doc.tags) {
        const tagIndices = findMatchIndices(tag, token);
        if (tagIndices.length > 0) {
          score += tagIndices.length * 4;
          matches.push({ field: 'tag', indices: tagIndices });
        }
      }
    }

    if (score > 0) {
      results.push({ item: doc, score, matches });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Generate highlighted text segments from a text and search query.
 * Returns array of { text, highlight } chunks for rendering.
 */
export interface HighlightSegment {
  text: string;
  highlight: boolean;
}

export function getHighlightSegments(text: string, query: string): HighlightSegment[] {
  if (!query.trim() || !text) return [{ text, highlight: false }];

  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) return [{ text, highlight: false }];

  // Collect all match ranges
  const ranges: Array<[number, number]> = [];
  for (const token of tokens) {
    const indices = findMatchIndices(text, token);
    ranges.push(...indices);
  }

  if (ranges.length === 0) return [{ text, highlight: false }];

  // Merge overlapping ranges
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: Array<[number, number]> = [ranges[0]];
  for (let i = 1; i < ranges.length; i++) {
    const last = merged[merged.length - 1];
    if (ranges[i][0] <= last[1]) {
      last[1] = Math.max(last[1], ranges[i][1]);
    } else {
      merged.push(ranges[i]);
    }
  }

  // Build segments
  const segments: HighlightSegment[] = [];
  let pos = 0;
  for (const [start, end] of merged) {
    if (pos < start) {
      segments.push({ text: text.slice(pos, start), highlight: false });
    }
    segments.push({ text: text.slice(start, end), highlight: true });
    pos = end;
  }
  if (pos < text.length) {
    segments.push({ text: text.slice(pos), highlight: false });
  }

  return segments;
}

// ============================================================
// 4. NAS Backend Interface Stubs
//    Activatable when NAS backend services are deployed.
//    All functions gracefully degrade to null/empty on failure.
// ============================================================

// --- 4a. Semantic Vector Search ---

export interface VectorSearchRequest {
  query: string;
  topK: number;
  minScore?: number;
  categoryFilter?: KnowledgeCategory[];
}

export interface VectorSearchResult {
  entryId: string;
  score: number;           // cosine similarity 0-1
  snippet: string;         // matching text fragment
  highlightRanges: Array<[number, number]>;
}

export interface VectorSearchResponse {
  results: VectorSearchResult[];
  queryEmbeddingMs: number;
  searchMs: number;
  model: string;           // embedding model name
}

/**
 * Semantic vector search via NAS Chroma/FAISS endpoint.
 * Endpoint: POST http://{nas_ip}:8090/api/v1/kb/vector-search
 */
export async function vectorSearch(
  nasIp: string,
  request: VectorSearchRequest,
  signal?: AbortSignal
): Promise<VectorSearchResponse | null> {
  try {
    const resp = await fetch(`http://${nasIp}:8090/api/v1/kb/vector-search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
    if (!resp.ok) return null;
    return await resp.json() as VectorSearchResponse;
  } catch {
    return null;
  }
}

/**
 * Index a knowledge entry into the vector database.
 * Endpoint: POST http://{nas_ip}:8090/api/v1/kb/vector-index
 */
export async function vectorIndex(
  nasIp: string,
  entry: KnowledgeEntry,
  signal?: AbortSignal
): Promise<boolean> {
  try {
    const resp = await fetch(`http://${nasIp}:8090/api/v1/kb/vector-index`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: entry.id,
        title: entry.title,
        content: entry.content,
        summary: entry.summary,
        tags: entry.tags,
        category: entry.category,
      }),
      signal,
    });
    return resp.ok;
  } catch {
    return false;
  }
}

// --- 4b. OCR / ASR Multi-Modal ---

export interface OCRRequest {
  /** Base64-encoded image data */
  imageBase64: string;
  /** Language hint: 'zh', 'en', 'mixed' */
  language?: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  blocks: Array<{
    text: string;
    bbox: { x: number; y: number; w: number; h: number };
    confidence: number;
  }>;
  processingMs: number;
}

/**
 * OCR image to text via NAS PaddleOCR endpoint.
 * Endpoint: POST http://{nas_ip}:8091/api/v1/ocr/recognize
 */
export async function ocrRecognize(
  nasIp: string,
  request: OCRRequest,
  signal?: AbortSignal
): Promise<OCRResult | null> {
  try {
    const resp = await fetch(`http://${nasIp}:8091/api/v1/ocr/recognize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
    if (!resp.ok) return null;
    return await resp.json() as OCRResult;
  } catch {
    return null;
  }
}

export interface ASRRequest {
  /** Base64-encoded audio data */
  audioBase64: string;
  format: 'wav' | 'mp3' | 'webm' | 'ogg';
  language?: string;
}

export interface ASRResult {
  text: string;
  segments: Array<{
    text: string;
    start: number;   // seconds
    end: number;
    confidence: number;
  }>;
  processingMs: number;
  model: string;
}

/**
 * ASR audio to text via NAS Whisper endpoint.
 * Endpoint: POST http://{nas_ip}:8091/api/v1/asr/transcribe
 */
export async function asrTranscribe(
  nasIp: string,
  request: ASRRequest,
  signal?: AbortSignal
): Promise<ASRResult | null> {
  try {
    const resp = await fetch(`http://${nasIp}:8091/api/v1/asr/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
    if (!resp.ok) return null;
    return await resp.json() as ASRResult;
  } catch {
    return null;
  }
}

// --- 4c. Knowledge Graph NER ---

export interface NERRequest {
  text: string;
  extractRelations?: boolean;
}

export interface NEREntity {
  text: string;
  type: string;        // PERSON, ORG, TECH, CONCEPT, etc.
  start: number;
  end: number;
  confidence: number;
}

export interface NERRelation {
  subject: NEREntity;
  predicate: string;   // 'uses', 'depends_on', 'part_of', 'related_to', etc.
  object: NEREntity;
  confidence: number;
}

export interface NERResult {
  entities: NEREntity[];
  relations: NERRelation[];
  processingMs: number;
  model: string;
}

/**
 * Named Entity Recognition via NAS HanLP/BERT-NER endpoint.
 * Endpoint: POST http://{nas_ip}:8092/api/v1/nlp/ner
 */
export async function nerExtract(
  nasIp: string,
  request: NERRequest,
  signal?: AbortSignal
): Promise<NERResult | null> {
  try {
    const resp = await fetch(`http://${nasIp}:8092/api/v1/nlp/ner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
    if (!resp.ok) return null;
    return await resp.json() as NERResult;
  } catch {
    return null;
  }
}

/**
 * Knowledge graph query via NAS Neo4j proxy.
 * Endpoint: POST http://{nas_ip}:8092/api/v1/kg/query
 */
export interface KGQueryRequest {
  entityId?: string;
  entityText?: string;
  depth?: number;       // hop count, default 2
  limit?: number;       // max results, default 50
}

export interface KGNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, string>;
}

export interface KGEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

export interface KGQueryResult {
  nodes: KGNode[];
  edges: KGEdge[];
  queryMs: number;
}

export async function kgQuery(
  nasIp: string,
  request: KGQueryRequest,
  signal?: AbortSignal
): Promise<KGQueryResult | null> {
  try {
    const resp = await fetch(`http://${nasIp}:8092/api/v1/kg/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
      signal,
    });
    if (!resp.ok) return null;
    return await resp.json() as KGQueryResult;
  } catch {
    return null;
  }
}

// ============================================================
// 5. NAS Backend Health Check
// ============================================================

export interface KBBackendStatus {
  vectorSearch: boolean;
  ocr: boolean;
  asr: boolean;
  ner: boolean;
  kg: boolean;
}

/**
 * Check which KB backend services are available on NAS.
 */
export async function checkKBBackendHealth(nasIp: string): Promise<KBBackendStatus> {
  const status: KBBackendStatus = {
    vectorSearch: false,
    ocr: false,
    asr: false,
    ner: false,
    kg: false,
  };

  const checks = [
    { key: 'vectorSearch' as const, url: `http://${nasIp}:8090/api/v1/health` },
    { key: 'ocr' as const, url: `http://${nasIp}:8091/api/v1/health` },
    { key: 'asr' as const, url: `http://${nasIp}:8091/api/v1/health` },
    { key: 'ner' as const, url: `http://${nasIp}:8092/api/v1/health` },
    { key: 'kg' as const, url: `http://${nasIp}:8092/api/v1/health` },
  ];

  const results = await Promise.allSettled(
    checks.map(async ({ key, url }) => {
      const resp = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (resp.ok) status[key] = true;
    })
  );

  // Silence unused variable
  void results;

  return status;
}
