// ============================================================
// BigModel-Z.ai SDK - MCP GitHub 服务器
// ============================================================

import { MCPClient } from './MCPClient';

export interface GitHubConfig {
  token: string;
}

export interface Repository {
  owner: string;
  name: string;
  fullName: string;
  description?: string;
}

export interface Issue {
  number: number;
  title: string;
  state: string;
  body?: string;
}

export interface PullRequest {
  number: number;
  title: string;
  state: string;
  body?: string;
}

export class MCPGitHubServer extends MCPClient {
  constructor(config: GitHubConfig) {
    super({
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: {
        GITHUB_TOKEN: config.token,
      },
    });
  }
}

export default MCPGitHubServer;
