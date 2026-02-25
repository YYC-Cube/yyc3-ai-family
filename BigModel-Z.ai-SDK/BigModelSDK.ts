// ============================================================
// BigModel-Z.ai SDK - 统一入口
// ============================================================

import { BigModelClient } from './core/BigModelClient'
import { AssistantManager } from './core/AssistantManager'
import { FileManager } from './core/FileManager'
import { KnowledgeBaseManager } from './core/KnowledgeBaseManager'
import { MultiModalManager } from './core/MultiModalManager'

export interface BigModelSDKConfig {
  apiKey: string,
  baseUrl?: string,
  timeout?: number,
}

export class BigModelSDK {
  public readonly client: BigModelClient,
  public readonly assistants: AssistantManager,
  public readonly files: FileManager,
  public readonly knowledge: KnowledgeBaseManager,
  public readonly multimodal: MultiModalManager,

  constructor(config: BigModelSDKConfig) {
    this.client = new BigModelClient(config),
    this.assistants = new AssistantManager(this.client),
    this.files = new FileManager(this.client),
    this.knowledge = new KnowledgeBaseManager(this.client),
    this.multimodal = new MultiModalManager(this.client),
  }

  static create(config: BigModelSDKConfig): BigModelSDK {
    return new BigModelSDK(config),
  }
}

export default BigModelSDK
