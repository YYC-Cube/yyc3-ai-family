// utils/import-utils.ts
interface ImportResult {
  added: number;
  merged: number;
  errors: string[];
  total: number;
}

export const importKnowledgeBase = async (
  file: File,
  existingData: KnowledgeItem[],
): Promise<ImportResult> => {
  const result: ImportResult = {
    added: 0,
    merged: 0,
    errors: [],
    total: 0,
  };

  try {
    const text = await file.text();
    const importData = JSON.parse(text);

    // 验证版本和数据结构
    if (!importData.version || !importData.version.startsWith('yyc3-kb-export')) {
      result.errors.push('无效的导出文件版本');

      return result;
    }

    if (!Array.isArray(importData.data)) {
      result.errors.push('数据格式错误：应为数组格式');

      return result;
    }

    result.total = importData.data.length;

    for (const item of importData.data) {
      try {
        // 验证条目结构
        if (!item.id || !item.title || !item.content) {
          result.errors.push(`条目 ${item.id || '未知'} 缺少必要字段`);
          continue;
        }

        const existingIndex = existingData.findIndex(existing => existing.id === item.id);

        if (existingIndex === -1) {
          // 新增条目
          existingData.push(item);
          result.added++;
        } else {
          // 合并条目 - 较新者胜出
          const existingItem = existingData[existingIndex];
          const existingTime = new Date(existingItem.updatedAt || 0);
          const newTime = new Date(item.updatedAt || 0);

          if (newTime > existingTime) {
            existingData[existingIndex] = {
              ...existingItem,
              ...item,
              updatedAt: new Date().toISOString(),
              _imported: true,
            };
            result.merged++;
          }
        }
      } catch (error) {
        result.errors.push(`处理条目 ${item.id} 时出错: ${error.message}`);
      }
    }

  } catch (error) {
    result.errors.push(`文件解析失败: ${error.message}`);
  }

  return result;
};
