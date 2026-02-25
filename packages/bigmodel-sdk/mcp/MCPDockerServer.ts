// ============================================================
// BigModel-Z.ai SDK - MCP Docker 服务器
// ============================================================

import { MCPClient } from './MCPClient';

export interface DockerConfig {
  socketPath?: string;
}

export interface ContainerInfo {
  id: string;
  name: string;
  status: string;
  image: string;
}

export class MCPDockerServer extends MCPClient {
  constructor(config: DockerConfig = {}) {
    super({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-docker'],
      env: config.socketPath ? { DOCKER_HOST: config.socketPath } : undefined,
    });
  }
}

export default MCPDockerServer;
