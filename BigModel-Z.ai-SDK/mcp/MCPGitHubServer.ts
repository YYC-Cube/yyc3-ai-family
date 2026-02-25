// ============================================================
// BigModel-Z.ai SDK - MCP GitHub 服务器
// GitHub 仓库管理功能封装
// ============================================================

import { MCPClient, MCPServerConfig } from './MCPClient';

export interface GitHubConfig {
  personalAccessToken: string,
}

export interface Repository {
  name: string,
  full_name: string,
  description: string,
  private: boolean,
  url: string,
  language?: string,
  stars: number,
  forks: number,
}

export interface Issue {
  id: number,
  title: string,
  body: string,
  state: 'open' | 'closed',
  created_at: string,
  updated_at: string,
  user: {
    login: string,
  },
}

export interface PullRequest {
  id: number,
  title: string,
  body: string,
  state: 'open' | 'closed',
  created_at: string,
  updated_at: string,
  user: {
    login: string,
  },
  head: {
    ref: string,
  },
  base: {
    ref: string,
  },
}

export class MCPGitHubServer extends MCPClient {
  constructor(personalAccessToken: string) {
    const config: MCPServerConfig = {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: personalAccessToken,
      },
    };

    super(config);
  }

  async listRepositories(): Promise<Repository[]> {
    const response = await this.callTool('list_repositories', {});

    return response.content?.[0]?.repositories || [];
  }

  async getRepository(owner: string, repo: string): Promise<Repository> {
    const response = await this.callTool('get_repository', { owner, repo });

    return response.content?.[0];
  }

  async listIssues(
    owner: string,
    repo: string,
    state = 'open',
  ): Promise<Issue[]> {
    const response = await this.callTool('list_issues', { owner, repo, state });

    return response.content?.[0]?.issues || [];
  }

  async getIssue(
    owner: string,
    repo: string,
    issueNumber: number,
  ): Promise<Issue> {
    const response = await this.callTool('get_issue', {
      owner,
      repo,
      issue_number: issueNumber,
    });

    return response.content?.[0];
  }

  async createIssue(
    owner: string,
    repo: string,
    title: string,
    body?: string,
  ): Promise<Issue> {
    const response = await this.callTool('create_issue', {
      owner,
      repo,
      title,
      body,
    });

    return response.content?.[0];
  }

  async listPullRequests(
    owner: string,
    repo: string,
    state = 'open',
  ): Promise<PullRequest[]> {
    const response = await this.callTool('list_pull_requests', { owner, repo, state });

    return response.content?.[0]?.pull_requests || [];
  }

  async getPullRequest(
    owner: string,
    repo: string,
    pullNumber: number,
  ): Promise<PullRequest> {
    const response = await this.callTool('get_pull_request', {
      owner,
      repo,
      pull_number: pullNumber,
    });

    return response.content?.[0];
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref = 'main',
  ): Promise<string> {
    const response = await this.callTool('get_file_content', {
      owner,
      repo,
      path,
      ref,
    });

    return response.content?.[0]?.content || '';
  }

  async createRepository(
    name: string,
    description?: string,
    isPrivate = false,
  ): Promise<Repository> {
    const response = await this.callTool('create_repository', {
      name,
      description,
      private: isPrivate,
    });

    return response.content?.[0];
  }

  async getPersonalAccessToken(): string {
    const config = this.getConfig();

    return config.env?.GITHUB_PERSONAL_ACCESS_TOKEN || '';
  }
}

export default MCPGitHubServer;
