// utils/export-utils.ts
export const exportKnowledgeBase = (kbData: KnowledgeItem[]): string => {
  const exportData = {
    version: 'yyc3-kb-export-1.0',
    timestamp: new Date().toISOString(),
    data: kbData,
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });

  const filename = `yyc3-kb-export-${new Date().toISOString().split('T')[0]}.json`;
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  return filename;
};
