---
@file: ELECTRON-PACKAGING.md
@description: YYC3-AI-Family Electron 桌面应用封装指南
@author: YanYuCloudCube Team
@version: 1.0.0
@created: 2026-02-25
@updated: 2026-02-25
@status: active
@tags: [electron], [desktop], [packaging]
---

> ***YanYuCloudCube***
> *言启象限 | 语枢未来*
> ***Words Initiate Quadrants, Language Serves as Core for Future***
> *万象归元于云枢 | 深栈智启新纪元*
> ***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***

---

# YYC³ AI-Family 桌面应用封装指南

## 概述

本文档详细描述如何将 YYC³ AI-Family Web 应用封装为跨平台桌面应用。

---

## 1. 技术方案对比

| 方案 | 优点 | 缺点 | 包体积 | 推荐度 |
|-----|------|------|--------|--------|
| **Electron** | 生态成熟、跨平台、复用Node.js | 包体积大 | ~150MB | ⭐⭐⭐⭐⭐ |
| **Tauri** | 轻量、安全、性能好 | 需Rust、生态较小 | ~10MB | ⭐⭐⭐⭐ |
| **Neutralino** | 极轻量 | 功能有限 | ~5MB | ⭐⭐⭐ |

**推荐方案：Electron** - 因为项目已使用 Node.js 后端，可无缝集成。

---

## 2. 安装依赖

```bash
# 安装 Electron 相关依赖
pnpm add -D electron electron-builder concurrently wait-on

# 创建 electron 目录
mkdir -p electron
```

---

## 3. 核心文件

### 3.1 electron/main.ts (主进程)

```typescript
import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { spawn } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let backendProcess: any = null;

const isDev = process.env.NODE_ENV === 'development';
const FRONTEND_PORT = 3133;
const BACKEND_PORT = 3177;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    icon: path.join(__dirname, '../public/icon.png'),
  });

  if (isDev) {
    mainWindow.loadURL(`http://localhost:${FRONTEND_PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  const backendPath = isDev 
    ? path.join(__dirname, '../backend/dist/index.js')
    : path.join(process.resourcesPath, 'backend/dist/index.js');
  
  backendProcess = spawn('node', [backendPath], {
    env: { 
      ...process.env, 
      PORT: String(BACKEND_PORT),
      NODE_ENV: isDev ? 'development' : 'production',
    },
    stdio: 'inherit',
  });

  backendProcess.on('error', (err: Error) => {
    console.error('Backend process error:', err);
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

// IPC handlers
ipcMain.handle('app-version', () => app.getVersion());
ipcMain.handle('app-info', () => ({
  name: app.getName(),
  version: app.getVersion(),
  platform: process.platform,
}));

ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow?.close());

// App lifecycle
app.whenReady().then(() => {
  startBackend();
  setTimeout(createWindow, 1000); // Wait for backend to start
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', stopBackend);
```

### 3.2 electron/preload.ts (预加载脚本)

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  platform: process.platform,
  appVersion: () => ipcRenderer.invoke('app-version'),
  appInfo: () => ipcRenderer.invoke('app-info'),
  
  // Window controls
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  
  // System
  isElectron: true,
});
```

### 3.3 electron/tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["./**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

## 4. package.json 配置

```json
{
  "main": "electron/dist/main.js",
  "scripts": {
    "electron:dev": "concurrently -k \"pnpm run dev\" \"pnpm run electron:start\"",
    "electron:start": "wait-on http://localhost:3133 && cross-env NODE_ENV=development electron .",
    "electron:build": "pnpm run build && pnpm run build:backend && electron-builder",
    "electron:build:mac": "pnpm run build && pnpm run build:backend && electron-builder --mac",
    "electron:build:win": "pnpm run build && pnpm run build:backend && electron-builder --win",
    "electron:build:linux": "pnpm run build && pnpm run build:backend && electron-builder --linux",
    "build:backend": "cd backend && pnpm run build",
    "build:electron": "cd electron && tsc"
  },
  "build": {
    "appId": "com.yyc3.ai-family",
    "productName": "YYC³ AI-Family",
    "copyright": "Copyright © 2026 YanYuCloudCube",
    "directories": {
      "output": "release",
      "buildResources": "build"
    },
    "files": [
      "dist/**/*",
      "electron/dist/**/*",
      "package.json"
    ],
    "extraResources": [
      {
        "from": "backend/dist",
        "to": "backend/dist",
        "filter": ["**/*"]
      },
      {
        "from": "node_modules",
        "to": "node_modules",
        "filter": ["**/*"]
      }
    ],
    "mac": {
      "category": "public.app-category.productivity",
      "icon": "public/icon.icns",
      "target": [
        {
          "target": "dmg",
          "arch": ["x64", "arm64"]
        },
        {
          "target": "zip",
          "arch": ["x64", "arm64"]
        }
      ],
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.inherit.plist"
    },
    "win": {
      "icon": "public/icon.ico",
      "target": [
        {
          "target": "nsis",
          "arch": ["x64"]
        },
        {
          "target": "portable",
          "arch": ["x64"]
        }
      ]
    },
    "linux": {
      "icon": "public/icon.png",
      "target": ["AppImage", "deb"],
      "category": "Office"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "installerIcon": "public/icon.ico",
      "uninstallerIcon": "public/icon.ico"
    },
    "dmg": {
      "contents": [
        { "x": 130, "y": 220 },
        { "x": 410, "y": 220, "type": "link", "path": "/Applications" }
      ]
    }
  }
}
```

---

## 5. 构建命令

| 命令 | 说明 |
|-----|------|
| `pnpm electron:dev` | 开发模式（热重载） |
| `pnpm electron:build` | 构建所有平台 |
| `pnpm electron:build:mac` | 构建 macOS 应用（Universal） |
| `pnpm electron:build:win` | 构建 Windows 应用 |
| `pnpm electron:build:linux` | 构建 Linux 应用 |

---

## 6. 应用图标

需要准备以下格式的图标：

| 平台 | 格式 | 尺寸 | 位置 |
|-----|------|------|------|
| macOS | .icns | 512x512 | public/icon.icns |
| Windows | .ico | 256x256 | public/icon.ico |
| Linux | .png | 512x512 | public/icon.png |

**生成 icns (macOS):**
```bash
mkdir icon.iconset
sips -z 16 16 icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32 icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32 icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64 icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128 icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256 icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256 icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512 icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512 icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png
iconutil -c icns icon.iconset -o public/icon.icns
```

---

## 7. macOS 权限配置

**build/entitlements.mac.plist:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.cs.disable-library-validation</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
  <key>com.apple.security.network.server</key>
  <true/>
</dict>
</plist>
```

---

## 8. 前端适配

在 React 中使用 Electron API：

```typescript
// src/lib/useElectron.ts
import { useEffect, useState } from 'react';

interface ElectronAPI {
  platform: string;
  isElectron: boolean;
  appVersion: () => Promise<string>;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export function useElectron() {
  const [isElectron, setIsElectron] = useState(false);
  const [platform, setPlatform] = useState<string>('web');

  useEffect(() => {
    if (window.electronAPI) {
      setIsElectron(true);
      setPlatform(window.electronAPI.platform);
    }
  }, []);

  return {
    isElectron,
    platform,
    minimize: window.electronAPI?.minimize,
    maximize: window.electronAPI?.maximize,
    close: window.electronAPI?.close,
    appVersion: window.electronAPI?.appVersion,
  };
}
```

---

## 9. 输出目录结构

```
release/
├── mac-arm64/
│   └── YYC³ AI-Family.app
├── mac-x64/
│   └── YYC³ AI-Family.app
├── YYC³ AI-Family-1.0.0-arm64.dmg
├── YYC³ AI-Family-1.0.0-x64.dmg
├── YYC³ AI-Family-1.0.0-universal.dmg
└── win-unpacked/
    └── YYC³ AI-Family 1.0.0.exe
```

---

<div align="center">

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for Future***」
> 「***All things converge in cloud pivot; Deep stacks ignite a new era of intelligence***」

</div>
