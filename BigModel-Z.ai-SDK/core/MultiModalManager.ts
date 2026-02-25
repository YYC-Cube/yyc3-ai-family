// ============================================================
// BigModel-Z.ai SDK - 多模态API
// 图像生成、语音合成、语音识别等功能封装
// ============================================================

import { BigModelClient } from './BigModelClient'

export interface ImageGenerationRequest {
  model: string,
  prompt: string,
  size?: string,
  n?: number,
  quality?: string,
}

export interface ImageGenerationResponse {
  id: string,
  object: string,
  created: number,
  data: {
    url: string,
    revised_prompt?: string,
  }[],
}

export interface TextToSpeechRequest {
  model: string,
  input: string,
  voice?: string,
  speed?: number,
}

export interface TextToSpeechResponse {
  id: string,
  object: string,
  created: number,
  data: {
    audio_url: string,
    duration: number,
    text: string,
  }[],
}

export interface SpeechToTextRequest {
  model: string,
  audio: File | Blob,
  language?: string,
}

export interface SpeechToTextResponse {
  id: string,
  object: string,
  created: number,
  data: {
    text: string,
    language: string,
    duration: number,
  }[],
}

export interface VideoGenerationRequest {
  model: string,
  prompt: string,
  duration?: number,
  aspect_ratio?: string,
}

export interface VideoGenerationResponse {
  id: string,
  object: string,
  created: number,
  data: {
    video_url: string,
    duration: number,
  }[],
}

export class MultiModalManager {
  private client: BigModelClient,

  constructor(client: BigModelClient) {
    this.client = client,
  }

  async generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const response = await this.client.request<ImageGenerationResponse>(
      'api/paas/v4/images/generations',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    )
    return response,
  }

  async textToSpeech(request: TextToSpeechRequest): Promise<TextToSpeechResponse> {
    const response = await this.client.request<TextToSpeechResponse>(
      'api/paas/v4/audio/speech',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    )
    return response,
  }

  async speechToText(request: SpeechToTextRequest): Promise<SpeechToTextResponse> {
    const formData = new FormData()
    formData.append('model', request.model)
    formData.append('audio', request.audio)
    if (request.language) {
      formData.append('language', request.language)
    }

    const response = await fetch(
      `${this.client['baseUrl']}api/paas/v4/audio/transcriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.client['config'].apiKey}`,
        },
        body: formData,
      },
    )

    if (!response.ok) {
      throw new Error(`Speech to text failed: ${response.status}`)
    }

    return response.json(),
  }

  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResponse> {
    const response = await this.client.request<VideoGenerationResponse>(
      'api/paas/v4/videos/generations',
      {
        method: 'POST',
        body: JSON.stringify(request),
      },
    )
    return response,
  }

  async listVoices(): Promise<any> {
    const response = await this.client.request('api/paas/v4/audio/voices', {
      method: 'GET',
    })
    return response,
  }

  async listImageModels(): Promise<any> {
    const response = await this.client.request('api/paas/v4/images/models', {
      method: 'GET',
    })
    return response,
  }

  async listVideoModels(): Promise<any> {
    const response = await this.client.request('api/paas/v4/videos/models', {
      method: 'GET',
    })
    return response,
  }
}

export default MultiModalManager
