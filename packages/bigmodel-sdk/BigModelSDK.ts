// ============================================================
// BigModel-Z.ai SDK - 统一入口
// ============================================================

import { AssistantManager } from './core/AssistantManager';
import { BigModelClient, BigModelConfig } from './core/BigModelClient';
import { FileManager } from './core/FileManager';
import { KnowledgeBaseManager } from './core/KnowledgeBaseManager';
import { MultiModalManager } from './core/MultiModalManager';

export type BigModelSDKConfig = BigModelConfig;

export class BigModelSDK {
  public readonly client: BigModelClient;

  public readonly assistants: AssistantManager;

  public readonly files: FileManager;

  public readonly knowledge: KnowledgeBaseManager;

  public readonly multimodal: MultiModalManager;

  private _config: BigModelSDKConfig;

  constructor(config: BigModelSDKConfig) {
    this._config = config;
    this.client = new BigModelClient(config);
    this.assistants = new AssistantManager(this.client);
    this.files = new FileManager(
      this.client,
      config.baseUrl || 'https://open.bigmodel.cn/api/',
      config.apiKey,
    );
    this.knowledge = new KnowledgeBaseManager(this.client);
    this.multimodal = new MultiModalManager(this.client);
  }

  get config(): BigModelSDKConfig {
    return this._config;
  }

  static create(config: BigModelSDKConfig): BigModelSDK {
    return new BigModelSDK(config);
  }
}

export default BigModelSDK;
