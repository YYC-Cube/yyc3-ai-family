// ============================================================
// BigModel-Z.ai SDK - MCP 管理器
// 统一管理多个 MCP 服务器
// ============================================================

import { MCPClient, MCPServerConfig } from './MCPClient';

export interface MCPManagerConfig {
  servers: Record<string, MCPServerConfig>;
}

export class MCPManager {
  private servers = new Map<string, MCPClient>();

  constructor(config: MCPManagerConfig) {
    for (const [name, serverConfig] of Object.entries(config.servers)) {
      this.servers.set(name, new MCPClient(serverConfig));
    }
  }

  getServer(name: string): MCPClient | undefined {
    return this.servers.get(name);
  }

  async connectAll(): Promise<void> {
    await Promise.all(
      Array.from(this.servers.values()).map(server => server.connect()),
    );
  }

  async disconnectAll(): Promise<void> {
    await Promise.all(
      Array.from(this.servers.values()).map(server => server.disconnect()),
    );
  }
}

export default MCPManager;
