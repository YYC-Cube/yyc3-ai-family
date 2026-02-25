// ============================================================
// BigModel-Z.ai SDK - MCP 文件系统服务器
// ============================================================

import { MCPClient } from './MCPClient';

export interface FileSystemConfig {
  rootPath: string;
  readOnly?: boolean;
}

export class MCPFileSystemServer extends MCPClient {
  constructor(config: FileSystemConfig) {
    super({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', config.rootPath],
    });
  }
}

export default MCPFileSystemServer;
