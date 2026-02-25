// ============================================================
// BigModel-Z.ai SDK - OpenAI 兼容客户端
// 支持 OpenAI 统一认证方式
// ============================================================

export interface OpenAICompatibleConfig {
  apiKey: string,
  baseUrl?: string,
  timeout?: number,
  model?: string,
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant',
  content: string,
}

export interface ChatCompletionRequest {
  model: string,
  messages: ChatMessage[],
  temperature?: number,
  max_tokens?: number,
  stream?: boolean,
}

export interface ChatCompletionResponse {
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

export interface ChatCompletionChunk {
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
    finish_reason?: string | null,
  }[],
}

export class OpenAICompatibleClient {
  private config: OpenAICompatibleConfig,
  private baseUrl: string,

  constructor(config: OpenAICompatibleConfig) {
    this.config = {
      timeout: 30000,
      model: 'glm-4',
      ...config,
    }
    this.baseUrl = this.config.baseUrl || 'https://open.bigmodel.cn/api/paas/v4/'
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
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
      const error = await response.text()
      throw new Error(`API request failed: ${response.status} ${response.statusText}\n${error}`)
    }

    return response.json()
  }

  async chatCompletion(
    request: ChatCompletionRequest,
  ): Promise<ChatCompletionResponse> {
    const model = request.model || this.config.model!
    return this.request<ChatCompletionResponse>('chat/completions', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        model,
      }),
    })
  }

  async *chatCompletionStream(
    request: ChatCompletionRequest,
  ): AsyncGenerator<ChatCompletionChunk, void, unknown> {
    const model = request.model || this.config.model!
    const response = await fetch(`${this.baseUrl}chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        model,
        stream: true,
      }),
      signal: AbortSignal.timeout(this.config.timeout!),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API request failed: ${response.status} ${response.statusText}\n${error}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Response body is not readable')
    }

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
          if (data === '[DONE]') {
            return
          }
          try {
            const chunk = JSON.parse(data) as ChatCompletionChunk
            yield chunk
          } catch (e) {
            console.error('Failed to parse chunk:', e)
          }
        }
      }
    }
  }

  getConfig(): OpenAICompatibleConfig {
    return { ...this.config }
  }

  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey
  }

  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl
  }

  setTimeout(timeout: number): void {
    this.config.timeout = timeout
  }

  setModel(model: string): void {
    this.config.model = model
  }
}

export default OpenAICompatibleClient
