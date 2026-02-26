// ============================================================
// BigModel-Z.ai SDK - OpenAI 兼容客户端使用示例
// 展示如何使用 OpenAI 兼容的 API
// ============================================================

/* eslint-disable no-console */

import { OpenAICompatibleClient } from '../index';

async function basicExample() {
  console.log('=== OpenAI 兼容客户端基础示例 ===\n');

  const client = new OpenAICompatibleClient({
    apiKey: 'your-api-key-here',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/',
    model: 'glm-4',
  });

  const response = await client.chatCompletion({
    model: 'glm-4',
    messages: [
      { role: 'system', content: '你是一个有用的助手。' },
      { role: 'user', content: '你好！' },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  console.log('响应:', response.choices[0].message.content);
  console.log('使用量:', response.usage);
}

async function streamExample() {
  console.log('\n=== OpenAI 兼容客户端流式示例 ===\n');

  const client = new OpenAICompatibleClient({
    apiKey: 'your-api-key-here',
    model: 'glm-4',
  });

  console.log('流式响应：');
  const stream = await client.chatCompletionStream({
    model: 'glm-4',
    messages: [
      { role: 'user', content: '请介绍一下你自己' },
    ],
  });

  for await (const chunk of stream) {
    if (chunk) {
      process.stdout.write(chunk);
    }
  }
  console.log('\n');
}

async function configExample() {
  console.log('\n=== 配置管理示例 ===\n');

  const client = new OpenAICompatibleClient({
    apiKey: 'your-api-key-here',
  });

  console.log('当前配置:', client.getConfig());

  console.log('\n更新配置...');
  client.setApiKey('new-api-key');
  client.setBaseUrl('https://open.bigmodel.cn/api/paas/v4/');
  client.setTimeout(60000);
  client.setModel('glm-4-plus');

  console.log('更新后配置:', client.getConfig());
}

async function main() {
  try {
    await basicExample();
    await streamExample();
    await configExample();
  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  }
}

main();
