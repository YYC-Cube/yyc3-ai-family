// ============================================================
// BigModel-Z.ai SDK - MCP Brave Search 服务器
// Brave 搜索功能封装
// ============================================================

import { MCPClient, MCPServerConfig } from './MCPClient';

export interface BraveSearchConfig {
  apiKey: string,
}

export interface SearchResult {
  title: string,
  url: string,
  snippet: string,
  publishedDate?: string,
}

export class MCPBraveSearchServer extends MCPClient {
  constructor(apiKey: string) {
    const config: MCPServerConfig = {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-brave-search'],
      env: {
        BRAVE_API_KEY: apiKey,
      },
    };

    super(config);
  }

  async search(query: string, count = 10): Promise<SearchResult[]> {
    const response = await this.callTool('brave_web_search', {
      query,
      count,
    });

    return response.content?.[0]?.results || [];
  }

  async searchWithOffset(
    query: string,
    count = 10,
    offset = 0,
  ): Promise<SearchResult[]> {
    const response = await this.callTool('brave_web_search', {
      query,
      count,
      offset,
    });

    return response.content?.[0]?.results || [];
  }

  async getApiKey(): string {
    const config = this.getConfig();

    return config.env?.BRAVE_API_KEY || '';
  }
}

export default MCPBraveSearchServer;
