// ============================================================
// BigModel-Z.ai SDK - TypeScript 封装
// 完整的 BigModel-Z.ai API 客户端封装
// ============================================================

export interface BigModelConfig {
  apiKey: string,
  baseUrl?: string,
  timeout?: number,
}

export interface AssistantMessage {
  role: 'user' | 'assistant' | 'system',
  content: string,
  timestamp?: number,
}

export interface AssistantResponse {
  id: string,
  object: string,
  created: number,
  model: string,
  choices: {
    index: number,
    message: {
      role: string,
      content: string,
    },
    finish_reason: string,
  }[],
  usage: {
    prompt_tokens: number,
    completion_tokens: number,
    total_tokens: number,
  },
}

export interface StreamChunk {
  id: string,
  object: string,
  created: number,
  model: string,
  choices: {
    index: number,
    delta: {
      role?: string,
      content?: string,
    },
    finish_reason?: string,
  }[],
}

export class BigModelClient {
  private config: BigModelConfig,
  private baseUrl: string,

  constructor(config: BigModelConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    }
    this.baseUrl = this.config.baseUrl || 'https://open.bigmodel.cn/api/',
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`,
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    }

    const response = await fetch(url, {
      ...options,
      headers,
      signal: AbortSignal.timeout(this.config.timeout!),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    return response.json(),
  }

  async chat(
    assistantId: string,
    messages: AssistantMessage[],
    stream = false,
  ): Promise<AssistantResponse> {
    return this.request<AssistantResponse>('paas/v4/assistant', {
      method: 'POST',
      body: JSON.stringify({
        assistant_id: assistantId,
        messages,
        stream,
      }),
    })
  }

  async *chatStream(
    assistantId: string,
    messages: AssistantMessage[],
  ): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${this.baseUrl}paas/v4/assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        messages,
        stream: true,
      }),
    })

    const reader = response.body?.getReader()
    if (!reader) throw new Error('Response body is not readable')

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue

          try {
            const chunk: StreamChunk = JSON.parse(data)
            const content = chunk.choices[0]?.delta?.content
            if (content) yield content
          } catch (e) {
            console.error('Failed to parse stream chunk:', e)
          }
        }
      }
    }
  }
}

export default BigModelClient
