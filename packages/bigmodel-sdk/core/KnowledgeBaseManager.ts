// ============================================================
// BigModel-Z.ai SDK - 知识库管理
// 知识库创建、文档上传、检索等功能封装
// ============================================================

import { BigModelClient } from './BigModelClient';

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  document_count: number;
  vector_count: number;
}

export interface KnowledgeBaseListResponse {
  code: number;
  msg: string;
  data: {
    knowledge_bases: KnowledgeBase[];
    total: number;
  };
}

export interface Document {
  id: string;
  knowledge_base_id: string;
  filename: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface DocumentListResponse {
  code: number;
  msg: string;
  data: {
    documents: Document[];
    total: number;
  };
}

export interface SearchQuery {
  query: string;
  top_k?: number;
  score_threshold?: number;
}

export interface SearchResult {
  document_id: string;
  content: string;
  score: number;
  metadata: Record<string, unknown>;
}

export interface SearchResponse {
  code: number;
  msg: string;
  data: {
    results: SearchResult[];
    total: number;
  };
}

export class KnowledgeBaseManager {
  private client: BigModelClient;

  constructor(client: BigModelClient) {
    this.client = client;
  }

  async listKnowledgeBases(
    page = 1,
    pageSize = 20,
  ): Promise<KnowledgeBase[]> {
    const response = await this.client.request<KnowledgeBaseListResponse>(
      `paas/v4/knowledge-bases?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
      },
    );

    return response.data.knowledge_bases;
  }

  async getKnowledgeBase(kbId: string): Promise<KnowledgeBase> {
    const response = await this.client.request<{
      code: number;
      msg: string;
      data: KnowledgeBase;
    }>(
      `paas/v4/knowledge-bases/${kbId}`,
      {
        method: 'GET',
      },
    );

    return response.data;
  }

  async createKnowledgeBase(
    name: string,
    description: string,
  ): Promise<KnowledgeBase> {
    const response = await this.client.request<{
      code: number;
      msg: string;
      data: KnowledgeBase;
    }>(
      'paas/v4/knowledge-bases',
      {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      },
    );

    return response.data;
  }

  async updateKnowledgeBase(
    kbId: string,
    data: { name?: string; description?: string },
  ): Promise<KnowledgeBase> {
    const response = await this.client.request<{
      code: number;
      msg: string;
      data: KnowledgeBase;
    }>(
      `paas/v4/knowledge-bases/${kbId}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
    );

    return response.data;
  }

  async deleteKnowledgeBase(kbId: string): Promise<void> {
    await this.client.request(`paas/v4/knowledge-bases/${kbId}`, {
      method: 'DELETE',
    });
  }

  async listDocuments(
    kbId: string,
    page = 1,
    pageSize = 20,
  ): Promise<Document[]> {
    const response = await this.client.request<DocumentListResponse>(
      `paas/v4/knowledge-bases/${kbId}/documents?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
      },
    );

    return response.data.documents;
  }

  async uploadDocument(
    kbId: string,
    file: File,
  ): Promise<Document> {
    const formData = new FormData();

    formData.append('file', file);

    const response = await fetch(
      `https://open.bigmodel.cn/api/paas/v4/knowledge-bases/${kbId}/documents`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${(this.client as unknown as { config: { apiKey: string } }).config.apiKey}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Document upload failed: ${response.status}`);
    }

    const result = await response.json();

    return result.data;
  }

  async deleteDocument(kbId: string, docId: string): Promise<void> {
    await this.client.request(
      `paas/v4/knowledge-bases/${kbId}/documents/${docId}`,
      {
        method: 'DELETE',
      },
    );
  }

  async search(
    kbId: string,
    query: SearchQuery,
  ): Promise<SearchResult[]> {
    const response = await this.client.request<SearchResponse>(
      `paas/v4/knowledge-bases/${kbId}/search`,
      {
        method: 'POST',
        body: JSON.stringify(query),
      },
    );

    return response.data.results;
  }
}

export default KnowledgeBaseManager;
