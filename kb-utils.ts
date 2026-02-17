// kb-utils.ts 使用示例
import {
  vectorSearch,
  ocrProcess,
  asrProcess,
  nerExtract,
  kgQuery
} from './kb-utils';

// 向量搜索示例
const searchSimilarItems = async (query: string, limit = 10) => {
  try {
    const results = await vectorSearch(query, limit);
    return results || []; // 优雅降级
  } catch (error) {
    console.warn('向量搜索服务不可用，使用本地搜索');
    return localSearch(query, limit);
  }
};

// OCR 处理示例
const processImage = async (imageFile: File) => {
  const result = await ocrProcess(imageFile);
  if (result) {
    // 创建新的知识条目
    return {
      title: `图片: ${imageFile.name}`,
      content: result.text,
      type: 'image',
      ocrData: result
    };
  }
  return null;
};

// 知识图谱查询
const exploreRelatedConcepts = async (entity: string) => {
  const kgResult = await kgQuery(entity);
  if (kgResult) {
    // 可视化相关实体和关系
    return kgResult.relations;
  }
  return [];
};
