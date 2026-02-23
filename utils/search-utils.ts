// utils/search-utils.ts
interface SearchResult {
  item: KnowledgeItem;
  score: number;
  highlights: {
    title: string[];
    content: string[];
    tags: string[];
    summary: string[];
  };
}

export const fuzzySearch = (
  query: string,
  data: KnowledgeItem[],
  weights = { title: 5, summary: 3, content: 1, tags: 4 },
): SearchResult[] => {
  const tokens = query.toLowerCase().split(/\s+/).filter(token => token.length > 1);

  if (tokens.length === 0) return [];

  return data
    .map(item => {
      let totalScore = 0;
      const highlights = {
        title: [] as string[],
        content: [] as string[],
        tags: [] as string[],
        summary: [] as string[],
      };

      // 标题匹配
      const titleScore = calculateTokenScore(item.title, tokens, weights.title);

      totalScore += titleScore.score;
      highlights.title = titleScore.matches;

      // 摘要匹配
      if (item.summary) {
        const summaryScore = calculateTokenScore(item.summary, tokens, weights.summary);

        totalScore += summaryScore.score;
        highlights.summary = summaryScore.matches;
      }

      // 内容匹配
      const contentScore = calculateTokenScore(item.content, tokens, weights.content);

      totalScore += contentScore.score;
      highlights.content = contentScore.matches;

      // 标签匹配
      if (item.tags) {
        const tagScore = calculateTokenScore(item.tags.join(' '), tokens, weights.tags);

        totalScore += tagScore.score;
        highlights.tags = tagScore.matches;
      }

      return { item, score: totalScore, highlights };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score);
};

const calculateTokenScore = (text: string, tokens: string[], weight: number) => {
  let score = 0;
  const matches: string[] = [];
  const lowerText = text.toLowerCase();

  tokens.forEach(token => {
    const regex = new RegExp(token, 'gi');
    const matchCount = (lowerText.match(regex) || []).length;

    if (matchCount > 0) {
      score += matchCount * weight;
      matches.push(token);
    }
  });

  return { score, matches };
};
