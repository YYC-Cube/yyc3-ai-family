// ============================================================
// BigModel-Z.ai SDK - MCP 文件系统服务器
// 文件系统访问功能封装
// ============================================================

import { MCPClient, MCPServerConfig } from './MCPClient';

export interface FileSystemConfig {
  allowedDirectories: string[],
}

export class MCPFileSystemServer extends MCPClient {
  constructor(allowedDirectories: string | string[]) {
    const dirs = Array.isArray(allowedDirectories) ? allowedDirectories : [allowedDirectories];

    const config: MCPServerConfig = {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', ...dirs],
    };

    super(config);
  }

  async readFile(path: string): Promise<string> {
    const response = await this.callTool('read_file', { path });

    return response.content?.[0]?.text || '';
  }

  async readMultipleFiles(paths: string[]): Promise<Record<string, string>> {
    const response = await this.callTool('read_multiple_files', { paths });
    const result: Record<string, string> = {};

    response.content?.forEach((item: any) => {
      if (item.file && item.content) {
        result[item.file] = item.content;
      }
    });

    return result;
  }

  async listDirectory(path: string, recursive = false): Promise<string[]> {
    const response = await this.callTool('list_directory', { path, recursive });

    return response.content?.[0]?.files || [];
  }

  async listAllowedDirectories(): Promise<string[]> {
    const response = await this.callTool('list_allowed_directories', {});

    return response.content?.[0]?.directories || [];
  }

  async writeFile(path: string, content: string): Promise<void> {
    await this.callTool('write_file', { path, content });
  }

  async createDirectory(path: string): Promise<void> {
    await this.callTool('create_directory', { path });
  }

  async searchFiles(
    path: string,
    pattern: string,
    excludePatterns?: string[],
  ): Promise<string[]> {
    const params: any = { path, pattern };

    if (excludePatterns) {
      params.excludePatterns = excludePatterns;
    }

    const response = await this.callTool('search_files', params);

    return response.content?.[0]?.files || [];
  }

  async getFileInfo(path: string): Promise<any> {
    const response = await this.callTool('get_file_info', { path });

    return response.content?.[0];
  }

  async listAllowedDirectoriesConfig(): Promise<string[]> {
    const config = this.getConfig();

    return config.args?.slice(2) || [];
  }
}

export default MCPFileSystemServer;
