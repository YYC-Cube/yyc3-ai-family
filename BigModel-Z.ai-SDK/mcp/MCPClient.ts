// ============================================================
// BigModel-Z.ai SDK - MCP 基础客户端
// Model Context Protocol 基础封装
// ============================================================

export interface MCPServerConfig {
  command: string,
  args?: string[],
  env?: Record<string, string>,
}

export interface MCPTool {
  name: string,
  description: string,
  inputSchema: any,
}

export interface MCPResource {
  uri: string,
  name: string,
  description?: string,
  mimeType?: string,
}

export interface MCPMessage {
  role: 'user' | 'assistant' | 'system',
  content: any,
}

export interface MCPResponse {
  content: any[],
  isError?: boolean,
}

export class MCPClient {
  private config: MCPServerConfig,
  private process?: any,
  private messageId: number = 0,

  constructor(config: MCPServerConfig) {
    this.config = config,
  }

  async connect(): Promise<void> {
    console.log(`Connecting to MCP server: ${this.config.command} ${this.config.args?.join(' ') || ''}`)
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill()
      this.process = undefined
    }
  }

  async listTools(): Promise<MCPTool[]> {
    this.messageId++
    const response = await this.sendRequest({
      jsonrpc: '2.0',
      id: this.messageId,
      method: 'tools/list',
      params: {},
    })

    return response.tools || []
  }

  async callTool(name: string, args: any = {}): Promise<MCPResponse> {
    this.messageId++
    const response = await this.sendRequest({
      jsonrpc: '2.0',
      id: this.messageId,
      method: 'tools/call',
      params: {
        name,
        arguments: args,
      },
    })

    return response
  }

  async listResources(): Promise<MCPResource[]> {
    this.messageId++
    const response = await this.sendRequest({
      jsonrpc: '2.0',
      id: this.messageId,
      method: 'resources/list',
      params: {},
    })

    return response.resources || []
  }

  async readResource(uri: string): Promise<any> {
    this.messageId++
    const response = await this.sendRequest({
      jsonrpc: '2.0',
      id: this.messageId,
      method: 'resources/read',
      params: { uri },
    })

    return response
  }

  async listPrompts(): Promise<any[]> {
    this.messageId++
    const response = await this.sendRequest({
      jsonrpc: '2.0',
      id: this.messageId,
      method: 'prompts/list',
      params: {},
    })

    return response.prompts || []
  }

  async getPrompt(name: string, args: any = {}): Promise<any> {
    this.messageId++
    const response = await this.sendRequest({
      jsonrpc: '2.0',
      id: this.messageId,
      method: 'prompts/get',
      params: {
        name,
        arguments: args,
      },
    })

    return response
  }

  private async sendRequest(request: any): Promise<any> {
    console.log('MCP Request:', JSON.stringify(request, null, 2))

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {},
    }
  }

  getConfig(): MCPServerConfig {
    return this.config
  }
}

export default MCPClient
