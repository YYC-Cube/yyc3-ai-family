# YYC3 Hacker Chatbot -- Usability Test Plan v2.0

> **YanYuCloudCube**
> *言启象限 | 语枢未来*
> **Words Initiate Quadrants, Language Serves as Core for Future**
> *万象归元于云枢 | 深栈智启新纪元*
> **All things converge in cloud pivot; Deep stacks ignite a new era of intelligence**

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [State Management & Data Flow](#2-state-management--data-flow)
3. [Test Environment Setup](#3-test-environment-setup)
4. [Module Test Matrix](#4-module-test-matrix)
   - 4.1 Sidebar Navigation
   - 4.2 ChatArea (Terminal View)
   - 4.3 Chat Mode Toggle (Navigate vs AI)
   - 4.4 ArtifactsPanel
   - 4.5 Welcome Screen (ClaudeWelcome)
   - 4.6 Message Bubbles & Streaming
   - 4.7 SearchPalette (Ctrl+K)
   - 4.8 ConsoleView (20+ Sub-tabs)
   - 4.9 ServiceHealthMonitor
   - 4.10 ProjectsView
   - 4.11 ArtifactsView
   - 4.12 ServicesView
   - 4.13 KnowledgeBaseView
   - 4.14 BookmarksView
   - 4.15 SettingsModal (7 Tabs)
   - 4.16 YYC3Background (Custom Background)
   - 4.17 Persistence & Recovery
   - 4.18 i18n (Internationalization)
   - 4.19 Responsive & Layout
   - 4.20 LLM Bridge Integration
5. [Cross-Cutting Concerns](#5-cross-cutting-concerns)
6. [Known Issues & Risk Matrix](#6-known-issues--risk-matrix)
7. [Regression Checklist](#7-regression-checklist)

---

## 1. Architecture Overview

```
App.tsx (LanguageProvider > AppContent)
  |
  +-- YYC3Background ............... z-0, absolute, pointer-events-none
  +-- Sidebar ...................... z-20, hover-expand/pin, mobile drawer
  +-- <main> ....................... z-10, flex-1
  |     |
  |     +-- [terminal view] ....... PanelGroup (resizable)
  |     |     +-- ChatArea ......... Panel order=1, minSize=25
  |     |     +-- PanelResizeHandle  3px blue glow handle
  |     |     +-- ArtifactsPanel ... Panel order=2, collapsible
  |     |
  |     +-- [console view] ........ ConsoleView (20+ lazy-loaded sub-tabs)
  |     +-- [monitor view] ........ ServiceHealthMonitor
  |     +-- [projects view] ....... ProjectsView
  |     +-- [artifacts view] ...... ArtifactsView
  |     +-- [services view] ....... ServicesView
  |     +-- [knowledge view] ...... KnowledgeBaseView
  |     +-- [bookmarks view] ...... BookmarksView
  |
  +-- SettingsModal ................ z-50, Radix Dialog, 7 tabs
  +-- ErrorBoundary ................ wraps <main> content
```

### View Mode Enum

```typescript
type ViewMode = 'terminal' | 'console' | 'projects' | 'artifacts'
             | 'monitor' | 'services' | 'knowledge' | 'bookmarks';
```

---

## 2. State Management & Data Flow

### Zustand Store (`useSystemStore`)

| State Slice | Type | Persisted | Notes |
|---|---|---|---|
| `activeView` | `ViewMode` | Preferences | Current top-level view |
| `consoleTab` | `string` | Preferences | Active console sub-tab |
| `consoleAgent` | `string \| null` | Preferences | Active agent in AI tab |
| `chatMode` | `'navigate' \| 'ai'` | No (default: 'navigate') | Chat input routing mode |
| `messages` | `ChatMessage[]` | chat_messages | Main chat history |
| `isStreaming` | `boolean` | No | LLM response in progress |
| `isArtifactsOpen` | `boolean` | No | Right panel visibility |
| `activeArtifact` | `ChatArtifact \| null` | No | Code artifact being viewed |
| `agentChatHistories` | `Record<string, AgentChatMessage[]>` | agent_messages | Per-agent chat state |
| `navFavorites` | `string[]` | Persisted | ArtifactsPanel starred items |
| `isSettingsOpen` | `boolean` | No | Settings modal visibility |
| `settingsTab` | `string` | No | Active settings tab |
| `sidebarCollapsed` | `boolean` | No | Sidebar expand state |
| `sidebarPinned` | `boolean` | No | Sidebar pin state |
| `isMobile` / `isTablet` | `boolean` | No | Responsive breakpoints |
| `status` / `latency` / `cpuLoad` | various | No | System health metrics |
| `clusterMetrics` | `ClusterMetricsSnapshot \| null` | metrics_snapshots | Real-time cluster data |
| `logs` | `LogEntry[]` | system_logs | Rolling 100 entries |

### localStorage Keys

| Key | Content | Written By |
|---|---|---|
| `yyc3-appearance-config` | JSON: colors, fonts, opacity, shadow, etc. | SettingsModal > Appearance |
| `yyc3-bg-image` | dataURL (base64 PNG/JPG) | SettingsModal > Appearance |
| `yyc3-models-config` | JSON: ModelConfig[] | SettingsModal > Models |
| `yyc3-llm-provider-config` | JSON: ProviderConfig[] | Synced from models config |
| `yyc3-llm-usage` | JSON: UsageRecord[] (max 1000) | trackUsage() after LLM calls |
| Various persistence keys | Chat messages, agent histories, logs, metrics | persistence-binding.ts |

### Data Flow: Chat Message Lifecycle

```
User types text -> handleSend() -> onSendMessage(text)
  |
  +-> addMessage(userMsg) -> Zustand store -> React re-render
  +-> setIsStreaming(true)
  |
  +-> [chatMode === 'navigate']
  |     +-> matchNavigationIntent(text)
  |     +-> if match: setTimeout(action, 600ms) + addMessage(aiResponse)
  |     +-> if no match: addMessage(helpMsg)
  |
  +-> [chatMode === 'ai']
        +-> hasConfiguredProvider() check
        +-> if false: addMessage(configHintMsg)
        +-> if true:
              +-> addMessage(emptyAiPlaceholder)
              +-> generalStreamChat(text, history, onChunk, signal)
              +-> onChunk: accumulated += content -> updateLastAiMessage(accumulated)
              +-> on complete: trackUsage() + addLog()
              +-> on error: updateLastAiMessage(errorMsg)
              +-> finally: setIsStreaming(false)
```

---

## 3. Test Environment Setup

### Prerequisites

| Item | Requirement |
|---|---|
| Browser | Chrome 120+ (required for `queryLocalFonts()` API) |
| Screen | Desktop 1920x1080 (primary), test at 768px (tablet), 375px (mobile) |
| DevTools | Console open for error monitoring |
| localStorage | Clear before fresh test: `localStorage.clear()` |
| Network | Optional: local Ollama instance at `http://localhost:11434` |

### Quick Reset Procedure

```javascript
// Run in browser console to reset all state
localStorage.clear();
location.reload();
```

### Inspect State Procedure

```javascript
// Run in browser console to inspect current Zustand state
// (Zustand stores are accessible via the module scope)
// Use React DevTools > Components > AppContent > hooks to inspect store
```

---

## 4. Module Test Matrix

---

### 4.1 Sidebar Navigation

**File:** `/src/app/components/layout/Sidebar.tsx`
**State:** `activeView`, `sidebarCollapsed`, `sidebarPinned`, `isMobile`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SB-01 | Hover expand (desktop) | Move mouse over collapsed sidebar | Sidebar expands from 56px to 224px within 200ms | P0 |
| SB-02 | Hover collapse delay | Move mouse away from expanded sidebar | Sidebar collapses after 300ms delay | P0 |
| SB-03 | Pin sidebar | Expand sidebar -> click Pin icon | Sidebar stays expanded; Pin icon highlights in primary color | P1 |
| SB-04 | Unpin sidebar | Click Pin icon on pinned sidebar | Sidebar collapses; hover behavior resumes | P1 |
| SB-05 | Navigate to all views | Click each nav item: terminal, console, monitor, projects, artifacts, services, knowledge, bookmarks | `activeView` changes; main content area updates; nav item shows active state (blue left border + bg) | P0 |
| SB-06 | New Session button | Click "+" / "New Session" | `activeView` resets to 'terminal'; messages cleared; artifacts panel closed | P0 |
| SB-07 | Settings shortcut | Click Settings button at bottom | SettingsModal opens with 'general' tab active | P0 |
| SB-08 | GitOps shortcut | Click GitHub icon at bottom | SettingsModal opens with 'gitops' tab active | P1 |
| SB-09 | Collapsed tooltips | Hover over nav icons when sidebar collapsed | Tooltip label appears to the right of each icon | P2 |
| SB-10 | Mobile hamburger | Resize to <768px; click hamburger menu | Drawer slides in from left with overlay backdrop | P0 |
| SB-11 | Mobile drawer close | Tap overlay area behind drawer | Drawer closes | P0 |
| SB-12 | Mobile auto-close on nav | In mobile drawer, click a nav item | View changes AND drawer closes | P0 |
| SB-13 | Active state indicator | Navigate to 'console' | Console nav item shows blue left border, primary bg; previous active item loses styling | P1 |

---

### 4.2 ChatArea (Terminal View)

**File:** `/src/app/components/chat/ChatArea.tsx`
**State:** `messages`, `isStreaming`, `isArtifactsOpen`, `chatMode`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| CA-01 | Empty state (Welcome) | Fresh load or new session | ClaudeWelcome component visible with logo, 3 quick action buttons | P0 |
| CA-02 | Send message (Enter) | Type "hello" + press Enter | Message appears in chat; AI response follows; input clears | P0 |
| CA-03 | Send message (button) | Type "hello" + click EXECUTE button | Same as CA-02 | P0 |
| CA-04 | Shift+Enter for newline | Type text + Shift+Enter + more text | Newline inserted in textarea; message NOT sent | P1 |
| CA-05 | Empty send prevention | Click EXECUTE with empty input | Nothing happens; button should be disabled | P1 |
| CA-06 | Streaming indicator | Send any message | "BUSY..." pulse animation appears below messages; EXECUTE button disabled | P0 |
| CA-07 | Auto-scroll on new message | Send multiple messages to overflow viewport | Chat area scrolls to bottom automatically after each message | P0 |
| CA-08 | Messages persist in view | Send 5+ messages; scroll up; wait | Messages stay in place (NOT sliding down or disappearing) | P0 |
| CA-09 | Search bar (Ctrl+K) | Press Ctrl+K (or Cmd+K on Mac) | SearchPalette opens | P1 |
| CA-10 | Search bar input | Type in search bar | SearchPalette dropdown appears with filtered results | P1 |
| CA-11 | File attachment | Click paperclip icon -> select file | File appears as tag in input area with name, size, and X button | P1 |
| CA-12 | File drag & drop | Drag a file over the input area | Drop zone overlay appears; dropping adds file to attachments | P1 |
| CA-13 | Remove attachment | Click X on attached file tag | File tag removed from attachments list | P2 |
| CA-14 | Folder upload | Click folder upload icon -> select folder | Multiple files from folder appear as attachment tags | P2 |
| CA-15 | Prompt templates menu | Click lightbulb icon | Prompt templates dropdown opens with categorized templates | P1 |
| CA-16 | Insert prompt template | Click a template item | Template text inserted into textarea | P1 |
| CA-17 | Quick selector (Ctrl+J) | Press Ctrl+J or click + icon | Model/MCP tool selector dropdown opens | P1 |
| CA-18 | Model selection inserts @ | Click "GPT-4o" in quick selector | `@gpt-4o ` inserted into textarea; selector closes | P2 |
| CA-19 | MCP tool inserts / | Click "Figma MCP" in quick selector | `/mcp-figma ` inserted into textarea; selector closes | P2 |
| CA-20 | Voice input | Click microphone icon (Chrome only) | Permission prompt appears; icon turns red with pulse animation; speech-to-text begins | P2 |
| CA-21 | Voice auto-stop | Start voice input; wait 30 seconds | Voice recording auto-stops; icon returns to default | P2 |
| CA-22 | Web search button | Click globe "Web Search" button | Button exists and is clickable (functionality TBD) | P3 |

---

### 4.3 Chat Mode Toggle (Navigate vs AI)

**File:** `/src/app/App.tsx` (handleSendMessage), `/src/app/components/chat/ChatArea.tsx` (toggle UI)
**State:** `chatMode`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| CM-01 | Default mode is Navigate | Fresh load | Top bar shows amber compass icon + "Navigate Mode" / "Pilot Mode" label | P0 |
| CM-02 | Toggle to AI mode | Click mode toggle button | Button changes to green chat icon + "AI Chat" label; placeholder changes to "Ask AI anything..." / "Toward AI question..." | P0 |
| CM-03 | Toggle back to Navigate | Click mode toggle button again | Returns to amber compass + original placeholder | P0 |
| CM-04 | Navigate: keyword match | In Navigate mode, type "dashboard" + Enter | AI responds "Navigated to: Dashboard"; view switches to console > dashboard | P0 |
| CM-05 | Navigate: Chinese keyword | Type "Run Warehouse" + Enter | AI responds "Navigated to: DevOps"; view switches to console > devops tab | P0 |
| CM-06 | Navigate: agent keyword | Type "navigator" + Enter | AI responds "Navigated to: Agent: navigator"; view switches to console > ai tab with navigator agent | P1 |
| CM-07 | Navigate: unknown keyword | Type "random gibberish" + Enter | AI responds with help message listing available keywords and suggestion to switch to AI mode | P0 |
| CM-08 | AI: no provider configured | Switch to AI mode; send any message (no API keys set) | AI responds with warning: "No AI provider configured" + instructions to Settings > AI Models | P0 |
| CM-09 | AI: provider configured | Configure an API key in Settings > Models; switch to AI mode; send "Hello" | Empty AI placeholder message appears; streaming chunks update the message in real-time; final response visible | P0 |
| CM-10 | AI: streaming display | Send message in AI mode with valid provider | Message content grows character-by-character as chunks arrive | P0 |
| CM-11 | AI: abort previous | Send message A; immediately send message B | First request aborted (AbortController); second request proceeds | P1 |
| CM-12 | AI: error handling | Configure invalid API key; send message in AI mode | Error message displayed: "Request error: ..." with troubleshooting hint | P1 |
| CM-13 | AI: all providers fail | Configure API key for provider that's down | Fallback message: "All providers unavailable" | P1 |
| CM-14 | AI: navigation in AI mode | In AI mode, type "Open dashboard" | Dashboard navigation fires AND AI attempts to respond | P2 |
| CM-15 | AI: usage tracking | Complete a successful AI response | `yyc3-llm-usage` in localStorage contains new UsageRecord entry | P2 |
| CM-16 | AI: log entries | Send message in AI mode | `logs` in Zustand store contain LLM_BRIDGE entries for the request | P2 |

---

### 4.4 ArtifactsPanel

**File:** `/src/app/components/chat/ArtifactsPanel.tsx`
**State:** `isArtifactsOpen`, `activeArtifact`, `navFavorites`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| AP-01 | Toggle open/close | Click ARTIFACTS button in ChatArea top bar | Panel expands from right; resize handle appears | P0 |
| AP-02 | Toggle close | Click ARTIFACTS button again (or X in panel) | Panel collapses; resize handle hidden | P0 |
| AP-03 | Resize handle drag | Drag the blue resize handle between chat and artifacts | Both panels resize proportionally; handle glows on hover | P0 |
| AP-04 | Minimum size enforcement | Drag resize handle to extreme left | Chat panel doesn't go below 25% width; artifacts below 30% | P1 |
| AP-05 | Collapse by drag | Drag artifacts panel to minimum -> continue dragging | Panel collapses to 0; `isArtifactsOpen` becomes false | P1 |
| AP-06 | Project navigation tree | Open artifacts panel (no artifact active) | Two-level project nav tree visible: "Core Modules", "Infrastructure", "AI Agents", etc. | P1 |
| AP-07 | Star/unstar nav item | Click star icon on a nav item | Item added to favorites (persisted via Zustand); star icon fills | P1 |
| AP-08 | Favorites persistence | Star items -> refresh page | Starred items remain starred after reload | P1 |
| AP-09 | Category collapse/expand | Click category header in nav tree | Category items toggle visibility | P2 |
| AP-10 | Code artifact view | From chat, click "OPEN_ARTIFACT" on a code block | ArtifactsPanel shows syntax-highlighted code with language label | P0 |
| AP-11 | Copy artifact code | Click copy button in artifact view | Code copied to clipboard; brief checkmark feedback | P1 |
| AP-12 | Download artifact | Click download button | `.txt` file download triggers | P2 |
| AP-13 | Code/Preview toggle | Click Eye/Code toggle | Switches between raw code and preview (if applicable) | P2 |

---

### 4.5 Welcome Screen (ClaudeWelcome)

**File:** `/src/app/components/chat/ClaudeWelcome.tsx`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| WL-01 | Logo display | View empty chat | YYC3 logo image visible in gradient card with green pulse dot | P1 |
| WL-02 | Title i18n | Switch language in settings | Title changes: "YYC3_OS is ready" (zh) / "YYC3_OS READY" (en) | P1 |
| WL-03 | Quick action 1 | Click "Build React Component" | Message sent to chat; AI response follows | P0 |
| WL-04 | Quick action 2 | Click "Deploy Microservice" | Message sent to chat; AI response follows | P0 |
| WL-05 | Quick action 3 | Click "Scan Vulnerabilities" | Message sent to chat; AI response follows | P0 |
| WL-06 | Animation | Observe welcome screen on load | fade-in + zoom-in-95 animation plays smoothly over 700ms | P2 |

---

### 4.6 Message Bubbles & Streaming

**File:** `/src/app/components/chat/MessageBubble.tsx`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| MB-01 | User message alignment | Send a user message | Message right-aligned with slate avatar showing User icon | P0 |
| MB-02 | AI message alignment | Receive AI response | Message left-aligned with colored agent icon; agent name + role badge visible | P0 |
| MB-03 | Code block rendering | AI response contains ` ```python\nprint("hi")\n``` ` | Syntax-highlighted code block with line numbers, language label, copy button | P0 |
| MB-04 | Open Artifact button | Code block in AI response | "OPEN_ARTIFACT" button visible in code block header; clicking opens ArtifactsPanel | P1 |
| MB-05 | Copy code button | Click copy icon in code block header | Code copied to clipboard; icon briefly shows checkmark | P1 |
| MB-06 | Inline code rendering | AI response contains `` `variable` `` | Rendered with monospace font, primary color, subtle bg/border | P1 |
| MB-07 | Agent role badge | AI message with `agentRole: 'architect'` | Purple "ARCHITECT" badge next to agent name | P2 |
| MB-08 | Timestamp display | All messages | Timestamp in 10px monospace at right side of header | P2 |
| MB-09 | Hover effects | Hover over AI message | Subtle background change, slight upward translate, border appears | P2 |
| MB-10 | Streaming empty state | AI mode; empty placeholder message appears during stream | Empty message bubble visible; content grows as chunks arrive | P0 |

---

### 4.7 SearchPalette (Ctrl+K)

**File:** `/src/app/components/search/SearchPalette.tsx`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SP-01 | Open via shortcut | Press Ctrl+K (or Cmd+K) | SearchPalette dropdown opens below search input | P0 |
| SP-02 | Open via input focus | Click search bar and type text | Dropdown opens with filtered results | P0 |
| SP-03 | Close on Escape | Press Escape while palette is open | Palette closes | P1 |
| SP-04 | Close on outside click | Click outside the palette area | Palette closes | P1 |
| SP-05 | Terminal commands | Type a command keyword (e.g., "deploy") | Terminal command entries appear in results with icons | P1 |
| SP-06 | Navigation results | Type "dashboard" | Console tabs and views matching "dashboard" appear | P1 |
| SP-07 | Empty query | Open palette with empty query | Default categories (Files, Code, Chat, Commands) shown | P2 |
| SP-08 | No results state | Type random unmatched text | "No results found" message displayed | P2 |

---

### 4.8 ConsoleView (20+ Sub-tabs)

**File:** `/src/app/components/console/ConsoleView.tsx`
**State:** `consoleTab`, `consoleAgent`

> **Note:** ConsoleView contains 20+ lazy-loaded sub-modules. Each sub-tab is a separate test scope.

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| CV-01 | Default tab | Switch to Console view | Dashboard tab active and loaded | P0 |
| CV-02 | Tab switching | Click each tab in console sidebar | Content area updates; no flash/flicker; loading spinner if lazy | P0 |
| CV-03 | Lazy loading | Switch to a tab not yet loaded | Loader spinner appears briefly; component mounts without error | P0 |
| CV-04 | Agent chat (AI tab) | Navigate to AI tab + select an agent | AgentChatInterface loads with agent-specific system prompt | P1 |
| CV-05 | Agent history persistence | Send messages to an agent; switch away; switch back | Chat history preserved for that agent | P1 |
| CV-06 | Architecture tab | Open Architecture tab | ClusterTopology component renders | P1 |
| CV-07 | DevOps tab | Open DevOps tab | DevOpsTerminal renders with pipeline/container/terminal sub-views | P1 |
| CV-08 | MCP tab | Open MCP tab | MCP Service Builder or Workflows view renders | P1 |
| CV-09 | Persistence tab | Open Persistence tab | PersistenceManager renders with snapshot controls | P1 |
| CV-10 | Orchestration tab | Open Orchestrate tab | AgentOrchestrator renders with multi-agent workflow UI | P2 |
| CV-11 | Ollama Manager | Open Ollama tab | OllamaManager renders; shows connectivity status to localhost:11434 | P1 |
| CV-12 | API Docs | Open API Docs tab | ApiDocsViewer renders with endpoint documentation | P2 |
| CV-13 | Smoke Test | Open Smoke Test tab | SmokeTestRunner renders with test execution UI | P2 |
| CV-14 | Test Framework | Open Test Framework tab | TestFrameworkRunner renders | P2 |
| CV-15 | Metrics History | Open Metrics History tab | MetricsHistoryDashboard renders with Recharts graphs | P2 |
| CV-16 | Family Presence | Open Family Presence tab | FamilyPresenceBoard renders | P2 |
| CV-17 | Knowledge Base (console) | Open Knowledge Base tab in console | KnowledgeBase console component renders | P2 |
| CV-18 | NAS Deployment | Open NAS Deployment tab | NasDeploymentToolkit renders with connectivity checks | P2 |
| CV-19 | Remote Docker Deploy | Open Remote Docker Deploy tab | RemoteDockerDeploy renders | P2 |
| CV-20 | Token Usage | Open Token Usage tab | TokenUsageDashboard renders with usage charts | P2 |

---

### 4.9 ServiceHealthMonitor

**File:** `/src/app/components/monitoring/ServiceHealthMonitor.tsx`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| MN-01 | Initial render | Navigate to Monitor view | Dashboard with service cards, metrics gauges visible | P0 |
| MN-02 | Real-time updates | Wait 5 seconds on monitor view | Metrics values update (via useMetricsSimulator) | P1 |
| MN-03 | Status indicators | Observe service status colors | Green for optimal, amber for warning, red for critical | P1 |

---

### 4.10 ProjectsView

**File:** `/src/app/components/views/ProjectsView.tsx`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| PV-01 | Initial render | Navigate to Projects view | Project list with cards/table visible | P0 |
| PV-02 | Search projects | Type in project search bar | Filtered results update | P1 |
| PV-03 | Project card interaction | Click/hover on project card | Card shows hover effects; details accessible | P1 |

---

### 4.11 ArtifactsView

**File:** `/src/app/components/views/ArtifactsView.tsx`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| AV-01 | Initial render | Navigate to Artifacts view | Artifacts log/list visible with items | P0 |
| AV-02 | Artifact details | Click on an artifact entry | Details panel or expanded view shows code/metadata | P1 |

---

### 4.12 ServicesView

**File:** `/src/app/components/views/ServicesView.tsx`
**Persistence:** localStorage `yyc3-services-data` (if implemented)

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SV-01 | Initial render | Navigate to Services view | Service cards organized by category (DevOps, Database, Monitoring, etc.) | P0 |
| SV-02 | Search services | Type in search bar | Services filtered by name/description | P1 |
| SV-03 | Add service | Click "Add Service" button | Form appears with name, URL, category, description fields | P0 |
| SV-04 | Save new service | Fill form and save | New service card appears in correct category | P0 |
| SV-05 | Edit service | Click edit icon on service card | Inline edit mode with pre-filled fields | P1 |
| SV-06 | Delete service | Click delete icon on service card | Service removed (with confirmation if implemented) | P1 |
| SV-07 | Pin/unpin service | Click star icon on service | Service moves to/from pinned section | P1 |
| SV-08 | Open service URL | Click "Open" / external link button | New browser tab opens with service URL | P0 |
| SV-09 | Category collapse | Click category header chevron | Category section collapses/expands | P2 |
| SV-10 | Empty category | Delete all services from a category | Category section shows empty state or hides | P2 |

---

### 4.13 KnowledgeBaseView

**File:** `/src/app/components/views/KnowledgeBaseView.tsx`
**Persistence:** localStorage `yyc3-knowledge-data` (if implemented)

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| KB-01 | Initial render | Navigate to Knowledge view | Document list with categories, tags, search bar | P0 |
| KB-02 | Search documents | Type in search bar | Documents filtered by title/content/tags | P1 |
| KB-03 | Add document | Click "Add Document" | Form with title, content (textarea), category, tags | P0 |
| KB-04 | Save document | Fill form and save | New document appears in list | P0 |
| KB-05 | Edit document | Click edit on document card | Inline or modal edit with pre-filled fields | P1 |
| KB-06 | Delete document | Click delete on document | Document removed | P1 |
| KB-07 | Star document | Click star icon | Document marked as starred; appears in starred filter | P1 |
| KB-08 | Category filter | Click category tag/button | Documents filtered to selected category | P1 |
| KB-09 | Document preview | Click document card/title | Content preview or detail view opens | P1 |
| KB-10 | Stats display | View header area | Total docs count, category breakdown visible | P2 |

---

### 4.14 BookmarksView

**File:** `/src/app/components/views/BookmarksView.tsx`
**Persistence:** localStorage `yyc3-bookmarks-data` (if implemented)

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| BM-01 | Initial render | Navigate to Bookmarks view | Bookmark list with categories, tags, status badges | P0 |
| BM-02 | Search bookmarks | Type in search bar | Bookmarks filtered by name/description/tags | P1 |
| BM-03 | Add bookmark | Click "Add Project" | Form with name, URL, description, category, tags | P0 |
| BM-04 | Save bookmark | Fill form and save | New bookmark appears in correct category | P0 |
| BM-05 | Edit bookmark | Click edit icon | Edit mode with pre-filled fields | P1 |
| BM-06 | Delete bookmark | Click delete icon | Bookmark removed | P1 |
| BM-07 | Star bookmark | Click star icon | Bookmark starred; appears in starred filter | P1 |
| BM-08 | Visit URL | Click "Visit" / external link | New tab opens with bookmark URL | P0 |
| BM-09 | Status badges | View bookmark cards | Status badges (active/archived/maintenance) displayed with color coding | P2 |
| BM-10 | Tag display | View bookmark cards | Tags displayed as colored pills | P2 |
| BM-11 | Copy URL | Click copy icon on bookmark | URL copied to clipboard | P2 |

---

### 4.15 SettingsModal (7 Tabs)

**File:** `/src/app/components/settings/SettingsModal.tsx`

#### 4.15.1 General Settings

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SG-01 | Language switch | Toggle language selector (zh/en) | All UI text updates immediately; no page reload needed | P0 |
| SG-02 | Workspace name | Edit workspace name input | Value updates (visual only, or persisted if implemented) | P2 |
| SG-03 | Dev mode toggle | Toggle "Dev Mode" switch | Switch changes state; may enable debug features | P2 |
| SG-04 | Auto-save toggle | Toggle "Auto-Save Artifacts" switch | Switch changes state | P2 |
| SG-05 | Temperature slider | Adjust Temperature slider | Value updates in real-time | P1 |
| SG-06 | Max tokens slider | Adjust Max Tokens slider | Value updates | P1 |

#### 4.15.2 AI Models Settings

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SM-01 | Default models list | Open Models tab | 6 default models listed (Claude 4, GPT-4o, DeepSeek-R1, GLM-4, Llama-3, Gemini 2.5) | P0 |
| SM-02 | Toggle model status | Click status toggle on a model | Status switches between 'active' (green) and 'standby' (gray) | P0 |
| SM-03 | Edit model | Click edit icon on a model | Inline edit form appears with name, provider, API key, endpoint | P0 |
| SM-04 | Save API key | Enter API key in edit form; save | Key persisted to `yyc3-models-config`; synced to `yyc3-llm-provider-config` | P0 |
| SM-05 | API key masking | View saved model with API key | Key displayed as masked (e.g., `sk-...xxxx`) | P1 |
| SM-06 | Add custom model | Click "Add Model" | Empty form appears for custom model entry | P1 |
| SM-07 | Delete custom model | Click delete on a custom model | Model removed from list | P1 |
| SM-08 | Provider config sync | Edit model API key; check `yyc3-llm-provider-config` in localStorage | ProviderConfig[] updated with correct providerId, apiKey, endpoint, enabled status | P0 |

#### 4.15.3 GitOps Settings

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SGO-01 | Render | Open GitOps tab | Git configuration UI renders without error | P1 |

#### 4.15.4 Extensions Settings

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SE-01 | Render | Open Extensions tab | Extensions/plugins list renders | P1 |

#### 4.15.5 Security Settings

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SS-01 | Render | Open Security tab | Security policies UI renders | P1 |

#### 4.15.6 Appearance Settings (6 Blocks)

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SA-01 | Background color picker | Click a color swatch in "Background Colors" | `--background` CSS variable updates; visible change in UI bg | P0 |
| SA-02 | Accent color picker | Click an accent color swatch | `--primary` CSS variable updates; buttons, links, borders change color | P0 |
| SA-03 | Border color picker | Click a border color swatch | `--border` CSS variable updates | P1 |
| SA-04 | Background image upload | Click "Upload" -> select image file | Image stored as dataURL in `yyc3-bg-image`; visible behind app content | P0 |
| SA-05 | Background image display | Upload image + close settings | Background image visible through the main UI; grid overlay still shows | P0 |
| SA-06 | Background brightness slider | Adjust brightness slider (0-100) | Lower values = darker overlay on image; 0 = fully dark; 100 = full brightness | P0 |
| SA-07 | Background blur slider | Adjust blur slider (0-20px) | Image progressively blurs; slight scale-up to avoid white edges | P0 |
| SA-08 | Clear background image | Click "Clear Background" | Image removed from localStorage; default gradient background resumes | P1 |
| SA-09 | Shadow intensity slider | Adjust "Border Shadow Intensity" slider | `--yyc3-shadow-intensity` CSS variable updates; panel borders glow more/less | P1 |
| SA-10 | Overlay opacity slider | Adjust "Overlay Opacity" slider | `--yyc3-overlay-opacity` CSS variable updates; settings modal background opacity changes | P1 |
| SA-11 | Font family selector | Select a font from dropdown | `--font-sans` CSS variable updates; body text changes font | P0 |
| SA-12 | Local font detection | Click "Detect Local Fonts" (Chrome only) | `queryLocalFonts()` called; detected fonts populate dropdown; count shown | P1 |
| SA-13 | Monospace font selector | Select a mono font | `--font-mono` CSS variable updates; code blocks and terminal text change font | P1 |
| SA-14 | Font size slider | Adjust global font size (10-24px) | `--yyc3-font-size` + `document.body.style.fontSize` update; all text resizes | P0 |
| SA-15 | Theme Preview card | View preview card in Appearance tab | Card shows live preview reflecting current accent color, font, bg color | P1 |
| SA-16 | Persistence across reload | Change all appearance settings -> refresh page | All settings restored from `yyc3-appearance-config` on mount | P0 |
| SA-17 | Background image persistence | Upload bg image -> refresh | Image re-appears (loaded from `yyc3-bg-image` by YYC3Background) | P0 |

#### 4.15.7 Agent Cards Settings

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| SAC-01 | Render | Open Agent Cards tab | Agent cards configuration UI renders | P1 |
| SAC-02 | Agent list | View agents | 7 agents listed with name, role, status | P1 |

---

### 4.16 YYC3Background

**File:** `/src/app/components/chat/YYC3Background.tsx`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| BG-01 | Default gradient | Fresh load with no bg image | Dark radial gradient visible (slate-900 -> black); grid overlay | P0 |
| BG-02 | Glow orb | Observe background | Centered blue glow orb (500px, blur-100, primary/10) | P2 |
| BG-03 | Grid pattern | Observe background | 40px grid lines barely visible (2% white opacity) | P2 |
| BG-04 | Custom image layer | Upload bg image in settings | Image visible behind all UI content; gradient overlay reduced to 30% opacity | P0 |
| BG-05 | Brightness control | Set brightness to 30 in settings | 70% black overlay on image (very dark) | P0 |
| BG-06 | Brightness control max | Set brightness to 100 | No overlay on image (full brightness) | P0 |
| BG-07 | Blur control | Set blur to 10px | Image blurred at 10px; slight scale-up (1.1x) to avoid edges | P0 |
| BG-08 | Real-time update | Change brightness/blur in settings while preview is visible | Background updates in real-time via `yyc3-bg-update` custom event | P0 |
| BG-09 | Cross-tab sync | Change bg image in another tab | Background updates via `storage` event listener | P2 |
| BG-10 | Pointer events | Click/interact with background area | No interaction -- `pointer-events-none` on background div | P1 |
| BG-11 | Z-index layering | Observe z-index stack | Background at z-0; main content at z-10; sidebar at z-20 | P0 |

---

### 4.17 Persistence & Recovery

**File:** `/src/lib/persistence-binding.ts`, `/src/lib/store.ts`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| PS-01 | Messages persist | Send 5 messages -> refresh page | Messages restored from localStorage | P0 |
| PS-02 | Agent histories persist | Chat with an agent -> refresh | Agent chat history restored | P1 |
| PS-03 | Logs persist | Generate log entries -> refresh | Recent logs restored | P2 |
| PS-04 | Preferences persist | Change console tab -> refresh | Previous console tab restored | P1 |
| PS-05 | Nav favorites persist | Star items in ArtifactsPanel -> refresh | Starred items remain starred | P1 |
| PS-06 | Metrics archive | Wait on dashboard for 60s -> check localStorage | Metrics snapshots archived at 30s intervals (max 100 rolling) | P2 |
| PS-07 | Appearance config persist | Change all appearance settings -> refresh | CSS variables and fonts restored on mount | P0 |
| PS-08 | Debounced writes | Send 10 rapid messages | Persistence writes debounced at 2000ms (not 10 separate writes) | P2 |
| PS-09 | Clear all data | Run `localStorage.clear()` + refresh | App starts in clean default state; no errors | P0 |
| PS-10 | Corrupt data handling | Manually corrupt a localStorage key with invalid JSON -> refresh | App loads without crash; silently falls back to defaults | P1 |

---

### 4.18 i18n (Internationalization)

**File:** `/src/lib/i18n.tsx`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| I18N-01 | Default language | Fresh load | Chinese (zh) is default language | P0 |
| I18N-02 | Switch to English | Settings > General > Language > English | All UI text switches to English; no missing keys visible (raw key fallback) | P0 |
| I18N-03 | Switch back to Chinese | Settings > General > Language > Chinese | All UI text switches to Chinese | P0 |
| I18N-04 | Chat mode labels | Toggle chat mode in both languages | "Pilot Mode" / "AI Dialogue" (zh) vs "NAV_MODE" / "AI_CHAT" (en) | P1 |
| I18N-05 | Settings tab labels | Open Settings in both languages | All 7 tab labels translated | P1 |
| I18N-06 | Sidebar labels | View sidebar in both languages | All nav items translated | P1 |
| I18N-07 | Chat placeholder | Check textarea placeholder in both modes & languages | 4 variants correct (navigate zh/en, ai zh/en) | P1 |
| I18N-08 | Missing key fallback | Use a key not in translations dict | Raw key string displayed (e.g., `some.missing.key`) | P2 |

---

### 4.19 Responsive & Layout

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| RL-01 | Desktop 1920px | View at 1920x1080 | Full three-column layout: sidebar + chat + artifacts; all content visible | P0 |
| RL-02 | Desktop 1280px | View at 1280x720 | Still three-column; slightly narrower panels; no overflow | P0 |
| RL-03 | Tablet 768px | View at 768px width | `isTablet` true; sidebar may collapse by default; panels still horizontal | P1 |
| RL-04 | Mobile 375px | View at 375px width | `isMobile` true; sidebar becomes hamburger; chat stacks vertically above artifacts; no PanelGroup | P0 |
| RL-05 | Mobile chat usable | Test chat on mobile viewport | Input area visible; keyboard doesn't obscure input; send button reachable | P0 |
| RL-06 | Resize transition | Resize browser from 1920px to 375px and back | Layout transitions smoothly; no content jumping or overflow | P1 |
| RL-07 | Panel resize handle | Resize panels on desktop | Smooth drag experience; handle glow feedback; panels respect min sizes | P0 |
| RL-08 | Panel autoSave | Resize panels -> refresh | Panel sizes restored from `yyc3-main-layout` autoSaveId | P2 |
| RL-09 | Overflow prevention | Fill chat with 50+ messages | No horizontal overflow; vertical scrolling works; no content shift | P0 |
| RL-10 | Settings modal responsive | Open settings at 768px | Modal still usable; sidebar tabs may stack or scroll | P1 |

---

### 4.20 LLM Bridge Integration

**Files:** `/src/lib/llm-bridge.ts`, `/src/lib/llm-providers.ts`, `/src/lib/llm-router.ts`

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| LLM-01 | Provider registry | Check `PROVIDERS` object | 7+ providers defined: openai, anthropic, deepseek, zhipu, google, groq, ollama, lmstudio | P1 |
| LLM-02 | Config save/load | Save provider config in Settings > Models | `loadProviderConfigs()` returns updated configs | P0 |
| LLM-03 | `hasConfiguredProvider()` | Configure API key for one provider | Returns `true`; remove all keys -> returns `false` | P0 |
| LLM-04 | `generalStreamChat()` success | With valid API key, call from AI chat mode | Streaming chunks received; response object returned with usage stats | P0 |
| LLM-05 | `generalStreamChat()` no provider | No configs set | Returns `null` | P1 |
| LLM-06 | Router failover | Configure 2 providers; first has invalid key | Router tries first, fails, falls over to second; second succeeds | P1 |
| LLM-07 | Circuit breaker | Trigger 5+ failures for one provider | Circuit breaker opens; provider skipped in future requests until cooldown | P2 |
| LLM-08 | Abort controller | Start AI request; send another immediately | First request aborted cleanly; no "Request aborted" error message in UI | P1 |
| LLM-09 | Token tracking | Complete AI response | `getUsageSummary()` shows updated totals | P2 |
| LLM-10 | Ollama integration | Start Ollama locally | `useOllamaDiscovery()` detects models; models synced to provider registry | P1 |

---

## 5. Cross-Cutting Concerns

### 5.1 Error Handling

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| EH-01 | ErrorBoundary catch | Force-throw in a lazy component | Error boundary renders "SYSTEM_CRITICAL_FAILURE" with REBOOT_KERNEL button | P0 |
| EH-02 | REBOOT_KERNEL button | Click REBOOT_KERNEL in error state | Page reloads | P0 |
| EH-03 | Lazy load failure | Block network for a lazy module | Suspense fallback shown (loader spinner + LOADING_MODULE text) | P1 |
| EH-04 | localStorage quota | Fill localStorage near 5MB limit | App continues to function; persistence writes may silently fail but no crash | P2 |

### 5.2 Performance

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| PF-01 | Initial load time | Fresh page load | App renders within 2 seconds; lazy modules load on demand | P1 |
| PF-02 | 100+ messages | Generate 100 messages in chat | No perceptible lag; scroll smooth; React re-renders efficient | P1 |
| PF-03 | Rapid mode switching | Toggle chat mode 20 times quickly | No flicker; state consistent; no console errors | P1 |
| PF-04 | Background image size | Upload 5MB image as background | Image loads; may be slow initially but renders correctly; consider warning for large images | P2 |
| PF-05 | View switching speed | Rapidly switch between all 8 views | Lazy loading efficient; no stale content visible during switch | P1 |

### 5.3 Keyboard Accessibility

| ID | Test Case | Steps | Expected Result | Priority |
|---|---|---|---|---|
| KA-01 | Ctrl+K | Press Ctrl+K anywhere | SearchPalette opens | P0 |
| KA-02 | Ctrl+J | Press Ctrl+J anywhere | Quick selector opens | P1 |
| KA-03 | Escape | Press Escape when modal/palette open | Closes the topmost overlay | P0 |
| KA-04 | Enter to send | Focus in chat input; press Enter | Message sent | P0 |
| KA-05 | Tab navigation | Tab through interactive elements | Focus ring visible; logical tab order | P2 |

---

## 6. Known Issues & Risk Matrix

| Issue | Severity | Description | Affected Component | Mitigation |
|---|---|---|---|---|
| Chat messages may shift down | HIGH | Previous bug (Panel non-flex); fix applied but needs runtime validation | ChatArea in Panel | Verify `h-full flex-1` on ChatArea + `overflow-hidden` on messages area |
| Background image may not show | HIGH | Previous bug (z-index/bg-background conflict); fix applied but needs validation | YYC3Background + App.tsx | Verify root div has no `bg-background`; YYC3Background at `z-0`; main at `z-10` |
| Settings scrollbar visibility | MEDIUM | Previous bug (Radix ScrollArea opaque); replaced with native `overflow-y-auto` | SettingsModal content area | Verify custom scrollbar styles from theme.css apply (6px blue thumb) |
| Settings left/right title alignment | LOW | Previous bug (inconsistent height); fix applied | SettingsModal header bars | Verify both sidebars use `h-14 flex items-center shrink-0` |
| `chatMode` not persisted | LOW | `chatMode` resets to 'navigate' on page refresh | Store default | Consider adding to persistence if user preference should survive reload |
| AI streaming empty bubble | MEDIUM | When AI mode starts streaming, empty message bubble may briefly show with no content | ChatArea + MessageBubble | Streaming indicator ("BUSY...") should mask empty bubble; or hide bubble until first chunk |
| Large bg image base64 | LOW | Background images stored as dataURL may approach localStorage 5MB limit | SettingsModal > Appearance | Consider adding file size warning or compression |
| `matchNavigationIntent` false positives | LOW | Words like "history" in "tell me about history" would navigate to Metrics History | App.tsx navigation | Navigation mode clearly separated from AI mode; can add stricter matching later |
| Font detection Chrome-only | LOW | `queryLocalFonts()` API only available in Chrome 103+ | SettingsModal > Appearance | Graceful fallback: shows default font list if API unavailable |
| Concurrent streaming requests | MEDIUM | If user sends rapid messages in AI mode, AbortController should cancel previous | App.tsx handleSendMessage | Verify `abortRef.current.abort()` fires before new request starts |

---

## 7. Regression Checklist

After any code change, run through these critical paths:

### Quick Smoke Test (5 minutes)

- [ ] App loads without console errors
- [ ] Sidebar hover-expand and nav clicking works
- [ ] Chat input accepts text and Enter sends message
- [ ] Navigate mode: type "dashboard" -> view changes
- [ ] AI mode toggle: button visible and clickable
- [ ] AI mode: sends message -> gets response or appropriate error
- [ ] Artifacts panel: toggle open/close via button
- [ ] Settings modal: opens from sidebar Settings button
- [ ] Settings > Appearance: change accent color -> UI updates
- [ ] Settings > Models: models list renders with 6 default entries
- [ ] Responsive: resize to 375px -> mobile layout activates

### Full Regression (30 minutes)

- [ ] All 8 views render without error (terminal, console, monitor, projects, artifacts, services, knowledge, bookmarks)
- [ ] All 7 settings tabs render without error
- [ ] Background image upload + brightness + blur all work
- [ ] Font selection changes body font
- [ ] Language switch (zh <-> en) updates all visible text
- [ ] Messages persist across page refresh
- [ ] New Session clears chat and resets to terminal view
- [ ] Console > 5 most-used tabs render and are interactive
- [ ] SearchPalette opens with Ctrl+K and filters results
- [ ] File attachment workflow (attach, preview, remove, send)
- [ ] Prompt templates insert into textarea
- [ ] Panel resize handle drags correctly
- [ ] Mobile hamburger menu opens/closes correctly
- [ ] ErrorBoundary catches thrown errors

---

## Appendix A: Navigation Keyword Reference

### Navigate Mode Keywords (Alphabetical)

| Keyword (EN) | Keyword (ZH) | Target | Tab/View |
|---|---|---|---|
| api doc | api docs | API Docs | console > api_docs |
| architecture | Architecture | Architecture | console > architecture |
| bole | Bole | Agent: bole | console > ai |
| dashboard | Dashboard, General Control | Dashboard | console > dashboard |
| deploy toolkit | Deployment Tool | NAS Deployment | console > nas_deployment |
| devops, pipeline | Operations | DevOps | console > devops |
| diagnostic | Diagnosis | Diagnostics | console > dashboard |
| docker compose | Container Deployment | Remote Deploy | console > remote_docker_deploy |
| family | Family | Family Presence | console > family_presence |
| grandmaster | Master | Agent: grandmaster | console > ai |
| identity | Identity | Agent Identity | console > agent_identity |
| knowledge, kb | Knowledge | Knowledge Base | console > knowledge_base |
| mcp | Tool Chain | MCP Tools | console > mcp |
| metrics history | Historical Data | Metrics History | console > metrics_history |
| monitor, health | Monitoring | Monitor | (view: monitor) |
| navigator | Navigator | Agent: navigator | console > ai |
| ollama | Local Model | Ollama Manager | console > ollama_manager |
| orchestrate | Orchestration | Orchestration | console > orchestrate |
| persist, snapshot | Persist, Snapshot | Persistence | console > persist |
| pivot | Pivot | Agent: pivot | console > ai |
| project | Project | Projects | (view: projects) |
| prophet | Prophet | Agent: prophet | console > ai |
| sentinel | Sentinel | Agent: sentinel | console > ai |
| settings, config | Settings | Settings | console > settings |
| smoke, e2e | Smoke Test | Smoke Test | console > smoke_test |
| template | Template | DevOps | console > devops |
| test framework | Test Framework | Test Framework | console > test_framework |
| thinker | Thinker | Agent: thinker | console > ai |
| workflow, dag | Workflow | DevOps | console > devops |

---

## Appendix B: localStorage Key Map

| Key | Type | Size Estimate | Persistence Source |
|---|---|---|---|
| `yyc3-appearance-config` | JSON object | ~500 bytes | SettingsModal > saveAppearance() |
| `yyc3-bg-image` | base64 dataURL | 0-5MB | SettingsModal > image upload |
| `yyc3-models-config` | JSON array | ~2KB | SettingsModal > Models tab |
| `yyc3-llm-provider-config` | JSON array | ~1KB | Synced from models config |
| `yyc3-llm-usage` | JSON array (max 1000) | ~50KB max | trackUsage() after LLM calls |
| `yyc3-main-layout` | JSON | ~200 bytes | react-resizable-panels autoSave |
| PersistenceEngine keys | Various | Variable | persistence-binding.ts (debounced) |

---

## Appendix C: Test Execution Template

```markdown
## Test Run: [DATE]
### Tester: [NAME]
### Browser: [Chrome VERSION / Firefox VERSION]
### Screen: [Resolution]

| Test ID | Result | Notes |
|---------|--------|-------|
| SB-01   | PASS/FAIL | |
| SB-02   | PASS/FAIL | |
| ...     | ...    | |

### Bugs Found:
1. [Test ID] - Description - Screenshot URL
2. ...

### Overall Assessment:
- [ ] PASS - Ready for release
- [ ] CONDITIONAL PASS - Minor issues documented
- [ ] FAIL - Critical issues require fix
```
