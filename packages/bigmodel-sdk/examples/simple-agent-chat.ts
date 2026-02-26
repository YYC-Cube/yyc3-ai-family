// ============================================================
// BigModel-Z.ai SDK - 简单智能体对话示例
// 展示如何与AI智能体进行基础交互
// ============================================================

/* eslint-disable no-console */

import { BigModelSDK } from '../index';

async function simpleAgentChat() {
  console.log('🤖 开始简单智能体对话示例\n');

  if (!process.env.BIGMODEL_API_KEY) {
    console.error('❌ 错误: 请设置环境变量 BIGMODEL_API_KEY');
    process.exit(1);
  }

  console.log('1️⃣ 初始化 BigModel SDK...');
  const sdk = BigModelSDK.create({
    apiKey: process.env.BIGMODEL_API_KEY,
    baseUrl: 'https://open.bigmodel.cn/api/',
    timeout: 30000,
  });
  console.log('✅ SDK初始化成功\n');

  console.log('2️⃣ 获取可用助手列表...');
  const assistants = await sdk.assistants.listAssistants();
  console.log(`📋 可用助手数量: ${assistants.length}`);

  assistants.forEach((assistant, index) => {
    console.log(`${index + 1}. ${assistant.name} (${assistant.nameEn})`);
    console.log(`   角色: ${assistant.role}`);
    console.log(`   描述: ${assistant.desc}`);
  });
  console.log('');

  console.log('3️⃣ 选择工程师助手进行对话...');
  const engineerAssistant = assistants.find(a =>
    a.name.includes('工程师') || a.nameEn.toLowerCase().includes('engineer')
  );

  if (!engineerAssistant) {
    console.log('⚠️  未找到工程师助手，使用第一个可用助手');
    const firstAssistant = assistants[0];

    if (!firstAssistant) {
      console.error('❌ 没有可用的助手');
      process.exit(1);
    }

    console.log(`使用助手: ${firstAssistant.name}\n`);

    const response = await sdk.client.chat(firstAssistant.id, [
      { role: 'user', content: '你好！请简单介绍一下你自己。' }
    ]);

    console.log('💬 助手回复:');
    console.log(response.choices[0].message.content);
    console.log('\n📊 Token使用量:', response.usage);
    return;
  }

  console.log(`✅ 找到工程师助手: ${engineerAssistant.name}\n`);

  console.log('4️⃣ 发起对话: "请帮我设计一个用户登录系统"');
  const startTime = Date.now();

  const response = await sdk.client.chat(engineerAssistant.id, [
    { role: 'user', content: '请帮我设计一个用户登录系统的基本架构，包括前端、后端和数据库设计。请简洁回答。' }
  ]);

  const elapsed = Date.now() - startTime;

  console.log('\n💬 工程师助手回复:');
  console.log('='.repeat(60));
  console.log(response.choices[0].message.content);
  console.log('='.repeat(60));
  console.log(`\n⏱️  响应时间: ${elapsed}ms`);
  console.log('📊 Token使用量:', response.usage);
  console.log('✅ 对话完成\n');
}

async function streamChatExample() {
  console.log('🌊 开始流式对话示例\n');

  if (!process.env.BIGMODEL_API_KEY) {
    console.error('❌ 错误: 请设置环境变量 BIGMODEL_API_KEY');
    return;
  }

  const sdk = BigModelSDK.create({
    apiKey: process.env.BIGMODEL_API_KEY,
  });

  const assistants = await sdk.assistants.listAssistants();
  const assistant = assistants[0];

  if (!assistant) {
    console.log('❌ 没有可用的助手');
    return;
  }

  console.log(`使用助手: ${assistant.name}`);
  console.log('开始流式对话: "请用200字介绍YYC³项目"\n');
  console.log('💬 实时回复:');
  console.log('='.repeat(60));

  const startTime = Date.now();

  const stream = await sdk.client.chatStream(assistant.id, [
    { role: 'user', content: '请用200字介绍YYC³（言云立方）项目的核心理念和特点。' }
  ]);

  for await (const chunk of stream) {
    process.stdout.write(chunk);
  }

  const elapsed = Date.now() - startTime;

  console.log('\n' + '='.repeat(60));
  console.log(`\n⏱️  总耗时: ${elapsed}ms`);
  console.log('✅ 流式对话完成\n');
}

async function main() {
  try {
    await simpleAgentChat();
    console.log('\n' + '='.repeat(60) + '\n');
    await streamChatExample();
    console.log('\n🎉 所有示例执行完成！');
  } catch (error) {
    console.error('\n❌ 执行失败:', error);
    process.exit(1);
  }
}

main();
