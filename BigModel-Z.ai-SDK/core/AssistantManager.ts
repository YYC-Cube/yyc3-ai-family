// ============================================================
// BigModel-Z.ai SDK - 助手管理
// 助手列表、助手对话等功能封装
// ============================================================

import { BigModelClient } from './BigModelClient'

export interface Assistant {
  id: string,
  name: string,
  nameEn: string,
  role: string,
  desc: string,
  descEn: string,
  icon: string,
  color: string,
  bgColor: string,
  borderColor: string,
}

export interface AssistantListResponse {
  code: number,
  msg: string,
  data: Assistant[],
}

export interface Conversation {
  id: string,
  assistant_id: string,
  title: string,
  created_at: string,
  updated_at: string,
}

export interface ConversationListResponse {
  code: number,
  msg: string,
  data: {
    conversations: Conversation[],
    total: number,
  },
}

export interface Message {
  id: string,
  conversation_id: string,
  role: 'user' | 'assistant',
  content: string,
  created_at: string,
}

export interface ConversationHistoryResponse {
  code: number,
  msg: string,
  data: {
    messages: Message[],
    total: number,
  },
}

export class AssistantManager {
  private client: BigModelClient,

  constructor(client: BigModelClient) {
    this.client = client,
  }

  async listAssistants(): Promise<Assistant[]> {
    const response = await this.client.request<AssistantListResponse>(
      'paas/v4/assistants',
      {
        method: 'GET',
      },
    )
    return response.data,
  }

  async getAssistant(assistantId: string): Promise<Assistant> {
    const response = await this.client.request<{ code: number, msg: string, data: Assistant }>(
      `paas/v4/assistants/${assistantId}`,
      {
        method: 'GET',
      },
    )
    return response.data,
  }

  async listConversations(
    assistantId: string,
    page = 1,
    pageSize = 20,
  ): Promise<Conversation[]> {
    const response = await this.client.request<ConversationListResponse>(
      `paas/v4/assistants/${assistantId}/conversations?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
      },
    )
    return response.data.conversations,
  }

  async getConversationHistory(
    conversationId: string,
    page = 1,
    pageSize = 50,
  ): Promise<Message[]> {
    const response = await this.client.request<ConversationHistoryResponse>(
      `paas/v4/conversations/${conversationId}/messages?page=${page}&page_size=${pageSize}`,
      {
        method: 'GET',
      },
    )
    return response.data.messages,
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await this.client.request('paas/v4/conversations/' + conversationId, {
      method: 'DELETE',
    })
  }

  async createConversation(
    assistantId: string,
    title: string,
  ): Promise<Conversation> {
    const response = await this.client.request<{ code: number, msg: string, data: Conversation }>(
      'paas/v4/conversations',
      {
        method: 'POST',
        body: JSON.stringify({
          assistant_id: assistantId,
          title,
        }),
      },
    )
    return response.data,
  }
}

export default AssistantManager
