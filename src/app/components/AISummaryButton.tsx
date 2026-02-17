// components/AISummaryButton.tsx
import { useState, useRef } from 'react';

interface AISummaryButtonProps {
  item: KnowledgeItem;
  onSummaryGenerated: (summary: string) => void;
}

export const AISummaryButton: React.FC<AISummaryButtonProps> = ({
  item,
  onSummaryGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateSummary = async () => {
    if (isGenerating) {
      abortControllerRef.current?.abort();
      setIsGenerating(false);
      return;
    }

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();

    try {
      const summary = await generalStreamChat({
        prompt: `请为以下内容生成简洁的摘要（150字以内）：
标题：${item.title}
内容：${item.content.substring(0, 1000)}`,
        signal: abortControllerRef.current.signal
      });

      // 持久化到本地
      onSummaryGenerated(summary);

      // NAS 双写
      await persistSummaryToNAS(item.id, summary);

    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('摘要生成失败:', error);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateSummary}
      className={`ai-summary-btn ${isGenerating ? 'generating' : ''}`}
      title="AI 自动摘要"
    >
      <span className="sparkles-icon">✨</span>
      {isGenerating ? '停止生成' : 'AI 摘要'}
    </button>
  );
};
