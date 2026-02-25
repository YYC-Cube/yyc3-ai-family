// ============================================================
// BigModel-Z.ai SDK - MCP Brave Search 服务器
// ============================================================

import { MCPClient } from './MCPClient';

export interface BraveSearchConfig {
  apiKey: string;
}

export interface SearchResult {
  title: string;
  url: string;
  description: string;
}

export class MCPBraveSearchServer extends MCPClient {
  constructor(config: BraveSearchConfig) {
    super({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-brave-search'],
      env: {
        BRAVE_API_KEY: config.apiKey,
      },
    });
  }
}

export default MCPBraveSearchServer;
