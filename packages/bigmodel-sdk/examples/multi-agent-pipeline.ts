// ============================================================
// BigModel-Z.ai SDK - 多智能体协作示例 (Pipeline模式)
// 展示如何让多个智能体按顺序协作完成任务
// ============================================================

/* eslint-disable no-console */

import { BigModelSDK } from '../index';

async function multiAgentPipeline() {
  console.log('🤝 开始多智能体协作示例 (Pipeline模式)\n');

  if (!process.env.BIGMODEL_API_KEY) {
    console.error('❌ 错误: 请设置环境变量 BIGMODEL_API_KEY');
    process.exit(1);
  }

  console.log('1️⃣ 初始化 SDK...');
  const sdk = BigModelSDK.create({
    apiKey: process.env.BIGMODEL_API_KEY,
    timeout: 60000,
  });
  console.log('✅ SDK初始化成功\n');

  console.log('2️⃣ 获取智能体列表...');
  const assistants = await sdk.assistants.listAssistants();
  console.log(`📋 找到 ${assistants.length} 个智能体\n`);

  const engineer = assistants.find(a => 
    a.name.includes('工程师') || a.nameEn.toLowerCase().includes('engineer')
  );
  const designer = assistants.find(a => 
    a.name.includes('设计师') || a.nameEn.toLowerCase().includes('designer')
  );
  const tester = assistants.find(a => 
    a.name.includes('测试') || a.nameEn.toLowerCase().includes('test')
  );

  if (!engineer) {
    console.log('⚠️  未找到工程师智能体，使用默认智能体');
  }
  if (!designer) {
    console.log('⚠️  未找到设计师智能体，使用默认智能体');
  }
  if (!tester) {
    console.log('⚠️  未找到测试员智能体，使用默认智能体');
  }

  const workerAgent = engineer || assistants[0];
  if (!workerAgent) {
    console.error('❌ 没有可用的智能体');
    process.exit(1);
  }

  console.log('📋 协作流程:');
  console.log(`   1. 智能体A (${workerAgent.name}): 编写冒泡排序算法`);
  console.log(`   2. 智能体B (${workerAgent.name}): 优化代码可读性`);
  console.log(`   3. 智能体C (${workerAgent.name}): 编写测试用例\n`);

  const task = '编写一个冒泡排序算法';
  console.log(`3️⃣ 步骤1: 智能体A 编写代码`);
  console.log(`任务: ${task}\n`);

  const startTime1 = Date.now();
  const codeResponse = await sdk.client.chat(workerAgent.id, [
    { 
      role: 'user', 
      content: `请${task}，使用TypeScript实现。要求简洁、高效。` 
    }
  ]);
  const codeTime = Date.now() - startTime1;
  const code = codeResponse.choices[0].message.content;

  console.log('📝 智能体A 输出:');
  console.log('='.repeat(60));
  console.log(code);
  console.log('='.repeat(60));
  console.log(`⏱️  耗时: ${codeTime}ms | Tokens: ${codeResponse.usage.total_tokens}\n`);

  console.log(`4️⃣ 步骤2: 智能体B 优化代码可读性`);
  console.log('任务: 为代码添加详细注释和优化结构\n');

  const startTime2 = Date.now();
  const optimizeResponse = await sdk.client.chat(workerAgent.id, [
    { 
      role: 'user', 
      content: `请优化以下代码的可读性，添加详细注释和类型定义:\n\n${code}` 
    }
  ]);
  const optimizeTime = Date.now() - startTime2;
  const optimizedCode = optimizeResponse.choices[0].message.content;

  console.log('🎨 智能体B 输出:');
  console.log('='.repeat(60));
  console.log(optimizedCode);
  console.log('='.repeat(60));
  console.log(`⏱️  耗时: ${optimizeTime}ms | Tokens: ${optimizeResponse.usage.total_tokens}\n`);

  console.log(`5️⃣ 步骤3: 智能体C 编写测试用例`);
  console.log('任务: 为优化后的代码编写单元测试\n');

  const startTime3 = Date.now();
  const testResponse = await sdk.client.chat(workerAgent.id, [
    { 
      role: 'user', 
      content: `请为以下代码编写完整的单元测试用例:\n\n${optimizedCode}` 
    }
  ]);
  const testTime = Date.now() - startTime3;
  const testCases = testResponse.choices[0].message.content;

  console.log('🧪 智能体C 输出:');
  console.log('='.repeat(60));
  console.log(testCases);
  console.log('='.repeat(60));
  console.log(`⏱️  耗时: ${testTime}ms | Tokens: ${testResponse.usage.total_tokens}\n`);

  console.log('6️⃣ 协作完成！生成最终报告...\n');
  console.log('📊 协作统计:');
  console.log('='.repeat(60));
  console.log(`总耗时: ${codeTime + optimizeTime + testTime}ms`);
  console.log(`总Token数: ${codeResponse.usage.total_tokens + optimizeResponse.usage.total_tokens + testResponse.usage.total_tokens}`);
  console.log(`参与智能体: ${workerAgent.name} (承担了所有角色)`);
  console.log(`协作模式: Pipeline (串行接力)`);
  console.log('='.repeat(60));

  console.log('\n✅ 交付物清单:');
  console.log('1. ✅ 原始代码实现');
  console.log('2. ✅ 优化后的代码（带注释）');
  console.log('3. ✅ 完整的测试用例');
  console.log('\n🎉 Pipeline模式协作示例完成！');
}

async function debateExample() {
  console.log('\n\n🎤 开始辩论模式示例\n');
  console.log('场景: 选择前端框架 (React vs Vue)\n');

  if (!process.env.BIGMODEL_API_KEY) {
    console.error('❌ 错误: 请设置环境变量 BIGMODEL_API_KEY');
    return;
  }

  const sdk = BigModelSDK.create({
    apiKey: process.env.BIGMODEL_API_KEY,
  });

  const assistants = await sdk.assistants.listAssistants();
  const agent = assistants[0];

  if (!agent) {
    console.log('❌ 没有可用的智能体');
    return;
  }

  console.log('1️⃣ 方案A: 支持React');
  const reactResponse = await sdk.client.chat(agent.id, [
    { 
      role: 'user', 
      content: '作为React支持者，请说明为什么应该选择React作为前端框架。列出3个核心优势。' 
    }
  ]);
  console.log('React方案:');
  console.log(reactResponse.choices[0].message.content);
  console.log('');

  console.log('2️⃣ 方案B: 支持Vue');
  const vueResponse = await sdk.client.chat(agent.id, [
    { 
      role: 'user', 
      content: '作为Vue支持者，请说明为什么应该选择Vue作为前端框架。列出3个核心优势。' 
    }
  ]);
  console.log('Vue方案:');
  console.log(vueResponse.choices[0].message.content);
  console.log('');

  console.log('3️⃣ 仲裁决策');
  const judgeResponse = await sdk.client.chat(agent.id, [
    { 
      role: 'user', 
      content: `作为技术决策者，请基于以下两个方案，给出最终的技术选型建议:\n\nReact方案:\n${reactResponse.choices[0].message.content}\n\nVue方案:\n${vueResponse.choices[0].message.content}\n\n请综合考虑团队技能、生态系统、学习曲线等因素，给出明确的建议。` 
    }
  ]);
  console.log('仲裁结果:');
  console.log(judgeResponse.choices[0].message.content);
  console.log('\n✅ 辩论模式示例完成！');
}

async function main() {
  try {
    await multiAgentPipeline();
    await debateExample();
    console.log('\n🎊 所有协作模式示例执行完成！');
  } catch (error) {
    console.error('\n❌ 执行失败:', error);
    process.exit(1);
  }
}

main();
