// ============================================================
// BigModel-Z.ai SDK - MCP 管理器
// 统一的 MCP 服务器管理
// ============================================================

import { MCPBraveSearchServer } from './MCPBraveSearchServer';
import { MCPClient } from './MCPClient';
import { MCPDockerServer } from './MCPDockerServer';
import { MCPFileSystemServer } from './MCPFileSystemServer';
import { MCPGitHubServer } from './MCPGitHubServer';
import { MCPPostgreSQLServer } from './MCPPostgreSQLServer';
import { YYC3CNServer, YYC3CNConfig } from './YYC3CNServer';

export interface MCPManagerConfig {
  fileSystem?: string | string[],
  postgresql?: string,
  braveSearch?: string,
  docker?: string,
  github?: string,
  yyc3cn?: YYC3CNConfig,
}

export class MCPManager {
  private servers = new Map<string, MCPClient>();

  constructor(config: MCPManagerConfig) {
    if (config.fileSystem) {
      this.servers.set('filesystem', new MCPFileSystemServer(config.fileSystem));
    }

    if (config.postgresql) {
      this.servers.set('postgresql', new MCPPostgreSQLServer(config.postgresql));
    }

    if (config.braveSearch) {
      this.servers.set('brave-search', new MCPBraveSearchServer(config.braveSearch));
    }

    if (config.docker) {
      this.servers.set('docker', new MCPDockerServer(config.docker));
    }

    if (config.github) {
      this.servers.set('github', new MCPGitHubServer(config.github));
    }

    if (config.yyc3cn) {
      this.servers.set('yyc3cn', new YYC3CNServer(config.yyc3cn));
    }
  }

  async connectAll(): Promise<void> {
    const promises = Array.from(this.servers.values()).map(server => server.connect());

    await Promise.all(promises);
  }

  async disconnectAll(): Promise<void> {
    const promises = Array.from(this.servers.values()).map(server => server.disconnect());

    await Promise.all(promises);
  }

  getServer(name: string): MCPClient | undefined {
    return this.servers.get(name);
  }

  getFileSystem(): MCPFileSystemServer | undefined {
    return this.servers.get('filesystem') as MCPFileSystemServer;
  }

  getPostgreSQL(): MCPPostgreSQLServer | undefined {
    return this.servers.get('postgresql') as MCPPostgreSQLServer;
  }

  getBraveSearch(): MCPBraveSearchServer | undefined {
    return this.servers.get('brave-search') as MCPBraveSearchServer;
  }

  getDocker(): MCPDockerServer | undefined {
    return this.servers.get('docker') as MCPDockerServer;
  }

  getGitHub(): MCPGitHubServer | undefined {
    return this.servers.get('github') as MCPGitHubServer;
  }

  getYYC3CN(): YYC3CNServer | undefined {
    return this.servers.get('yyc3cn') as YYC3CNServer;
  }

  listServers(): string[] {
    return Array.from(this.servers.keys());
  }

  async listAllTools(): Promise<Map<string, any[]>> {
    const tools = new Map<string, any[]>();

    for (const [name, server] of this.servers.entries()) {
      const serverTools = await server.listTools();

      tools.set(name, serverTools);
    }

    return tools;
  }

  async listAllResources(): Promise<Map<string, any[]>> {
    const resources = new Map<string, any[]>();

    for (const [name, server] of this.servers.entries()) {
      const serverResources = await server.listResources();

      resources.set(name, serverResources);
    }

    return resources;
  }
}

export default MCPManager;
