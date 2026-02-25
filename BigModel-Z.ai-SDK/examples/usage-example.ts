// ============================================================
// BigModel-Z.ai SDK 使用示例
// ============================================================

import { BigModelSDK } from './BigModelSDK';

async function main() {
  // 初始化 SDK
  const sdk = BigModelSDK.create({
    apiKey: 'your-api-key-here',
    baseUrl: 'https://open.bigmodel.cn/api/',
    timeout: 30000,
  });

  console.log('=== BigModel-Z.ai SDK 示例 ===\n');

  // ============================================================
  // 示例1：基础对话
  // ============================================================
  console.log('1. 基础对话示例');
  try {
    const chatResponse = await sdk.client.chat(
      '65940acff94777010aa6b796',
      [
        { role: 'user', content: '你好，我是清言，超开心遇见你！😺' },
      ],
    );

    console.log('AI 回复:', chatResponse.choices[0].message.content);
    console.log('Token 使用:', chatResponse.usage);
  } catch (error) {
    console.error('对话失败:', error);
  }

  // ============================================================
  // 示例2：流式对话
  // ============================================================
  console.log('\n2. 流式对话示例');
  try {
    const stream = await sdk.client.chatStream(
      '65940acff94777010aa6b796',
      [
        { role: 'user', content: '请用三句话介绍一下你自己' },
      ],
    );

    console.log('AI 回复（流式）:');
    for await (const chunk of stream) {
      process.stdout.write(chunk);
    }
    console.log('\n');
  } catch (error) {
    console.error('流式对话失败:', error);
  }

  // ============================================================
  // 示例3：助手管理
  // ============================================================
  console.log('\n3. 助手管理示例');
  try {
    // 获取助手列表
    const assistants = await sdk.assistants.listAssistants();

    console.log('可用助手:', assistants.map(a => a.name).join(', '));

    // 获取特定助手
    const assistant = await sdk.assistants.getAssistant('65940acff94777010aa6b796');

    console.log('助手详情:', assistant.name, '-', assistant.desc);

    // 创建新对话
    const conversation = await sdk.assistants.createConversation(
      '65940acff94777010aa6b796',
      '新对话',
    );

    console.log('创建对话:', conversation.id);

    // 获取对话历史
    const messages = await sdk.assistants.getConversationHistory(conversation.id);

    console.log('对话消息数:', messages.length);
  } catch (error) {
    console.error('助手管理失败:', error);
  }

  // ============================================================
  // 示例4：文件管理
  // ============================================================
  console.log('\n4. 文件管理示例');
  try {
    // 上传文件（需要实际的 File 对象）
    // const file = await sdk.files.uploadFile(fileObject)

    // 获取文件列表
    const files = await sdk.files.listFiles();

    console.log('文件列表:', files.length, '个文件');

    // 获取文件内容
    if (files.length > 0) {
      const content = await sdk.files.getFileContent(files[0].id);

      console.log('文件内容:', content.substring(0, 100) + '...');
    }

    // 解析文件
    // const parseResult = await sdk.files.parseFile('file-id')
    // console.log('解析结果:', parseResult)

    // 网络搜索
    const searchResults = await sdk.files.webSearch('BigModel-Z.ai SDK', 5);

    console.log('搜索结果:', searchResults);
  } catch (error) {
    console.error('文件管理失败:', error);
  }

  // ============================================================
  // 示例5：知识库管理
  // ============================================================
  console.log('\n5. 知识库管理示例');
  try {
    // 创建知识库
    const kb = await sdk.knowledge.createKnowledgeBase(
      '我的知识库',
      '用于存储项目相关文档',
    );

    console.log('创建知识库:', kb.id);

    // 上传文档到知识库（需要实际的 File 对象）
    // const doc = await sdk.knowledge.uploadDocument(kb.id, fileObject)

    // 从URL上传文档
    // const doc = await sdk.knowledge.uploadDocumentFromUrl(kb.id, 'https://example.com/doc.pdf')

    // 搜索知识库
    const searchResults = await sdk.knowledge.search(kb.id, {
      query: 'SDK 使用方法',
      top_k: 5,
    });

    console.log('知识库搜索结果:', searchResults.length, '条');

    // 获取使用量
    const usage = await sdk.knowledge.getUsage(kb.id);

    console.log('知识库使用量:', usage);
  } catch (error) {
    console.error('知识库管理失败:', error);
  }

  // ============================================================
  // 示例6：多模态功能
  // ============================================================
  console.log('\n6. 多模态功能示例');
  try {
    // 图像生成
    const image = await sdk.multimodal.generateImage({
      model: 'cogview-3-flash',
      prompt: '一只可爱的猫咪',
      size: '1024x1024',
      n: 1,
    });

    console.log('图像生成:', image.data[0].url);

    // 文本转语音
    const audio = await sdk.multimodal.textToSpeech({
      model: 'glm-4v-flash',
      input: '你好，世界',
      voice: 'alloy',
      speed: 1.0,
    });

    console.log('语音生成:', audio.data[0].audio_url);

    // 获取音色列表
    const voices = await sdk.multimodal.listVoices();

    console.log('可用音色:', voices.length, '个');

    // 获取图像模型列表
    const imageModels = await sdk.multimodal.listImageModels();

    console.log('可用图像模型:', imageModels.length, '个');

    // 获取视频模型列表
    const videoModels = await sdk.multimodal.listVideoModels();

    console.log('可用视频模型:', videoModels.length, '个');

    // 视频生成
    const video = await sdk.multimodal.generateVideo({
      model: 'cogvideox-2',
      prompt: '日落时分的海滩',
      duration: 5,
      aspect_ratio: '16:9',
    });

    console.log('视频生成:', video.data[0].video_url);
  } catch (error) {
    console.error('多模态功能失败:', error);
  }

  console.log('\n=== 示例完成 ===');
}

main().catch(console.error);
