// ============================================================
// BigModel-Z.ai SDK - 文件管理
// 文件上传、删除、内容获取等功能封装
// ============================================================

import { BigModelClient } from './BigModelClient';

export interface FileInfo {
  id: string;
  filename: string;
  size: number;
  content_type: string;
  created_at: string;
  url: string;
}

export interface FileListResponse {
  code: number;
  msg: string;
  data: {
    files: FileInfo[];
    total: number;
  };
}

export interface FileContentResponse {
  code: number;
  msg: string;
  data: {
    content: string;
    filename: string;
  };
}

export interface ParsedResult {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    summary: string;
    key_points: string[];
    metadata: Record<string, unknown>;
  };
  error?: string;
}

export interface ParseResultResponse {
  code: number;
  msg: string;
  data: ParsedResult;
}

export class FileManager {
  private client: BigModelClient;
  private baseUrl: string;
  private apiKey: string;

  constructor(client: BigModelClient, baseUrl: string, apiKey: string) {
    this.client = client;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  async uploadFile(file: File): Promise<FileInfo> {
    const formData = new FormData();

    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}paas/v4/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.status}`);
    }

    const result = await response.json();

    return result.data;
  }

  async listFiles(page = 1, pageSize = 20): Promise<FileInfo[]> {
    const response = await this.client.request<FileListResponse>(
      `paas/v4/files?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
      },
    );

    return response.data.files;
  }

  async getFile(fileId: string): Promise<FileInfo> {
    const response = await this.client.request<{ code: number; msg: string; data: FileInfo }>(
      `paas/v4/files/${fileId}`,
      {
        method: 'GET',
      },
    );

    return response.data;
  }

  async getFileContent(fileId: string): Promise<string> {
    const response = await this.client.request<FileContentResponse>(
      `paas/v4/files/${fileId}/content`,
      {
        method: 'GET',
      },
    );

    return response.data.content;
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.client.request(`paas/v4/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async parseFile(fileId: string): Promise<ParsedResult> {
    const response = await this.client.request<ParseResultResponse>(
      `paas/v4/files/${fileId}/parse`,
      {
        method: 'POST',
      },
    );

    return response.data;
  }

  async parseFileSync(fileId: string): Promise<ParsedResult> {
    const response = await this.client.request<ParseResultResponse>(
      `paas/v4/files/${fileId}/parse/sync`,
      {
        method: 'POST',
      },
    );

    return response.data;
  }

  async webSearch(query: string, maxResults = 10): Promise<unknown> {
    const response = await this.client.request('paas/v4/files/web-search', {
      method: 'POST',
      body: JSON.stringify({
        query,
        max_results: maxResults,
      }),
    });

    return response;
  }

  async webRead(url: string): Promise<unknown> {
    const response = await this.client.request('paas/v4/files/web-read', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });

    return response;
  }
}

export default FileManager;
