// components/HighlightedText.tsx
interface HighlightedTextProps {
  text: string;
  highlights: string[];
}

export const HighlightedText: React.FC<HighlightedTextProps> = ({
  text,
  highlights
}) => {
  if (highlights.length === 0) return <>{text}</>;

  let processedText = text;
  const highlightMap = new Map();

  // 避免重复高亮和嵌套问题
  highlights.forEach(highlight => {
    const regex = new RegExp(`(${highlight})`, 'gi');
    processedText = processedText.replace(regex, (match) => {
      const key = `@@HIGHLIGHT_${match}@@`;
      highlightMap.set(key, match);
      return key;
    });
  });

  // 分割文本并应用高亮
  const parts = processedText.split(/@@HIGHLIGHT_([^@]+)@@/);

  return (
    <>
      {parts.map((part, index) => {
        if (index % 2 === 1) {
          return <mark key={index} style={{backgroundColor: '#1890ff', color: 'white'}}>{part}</mark>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
};
