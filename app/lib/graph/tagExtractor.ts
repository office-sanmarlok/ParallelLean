// Markdown内容からタグを抽出する関数
export function extractTagsFromContent(content: string): string[] {
  const tags: Set<string> = new Set()
  
  // ハッシュタグ形式（#tag）の抽出
  const hashtagRegex = /#(\w+)/g
  const hashtagMatches = content.match(hashtagRegex) || []
  hashtagMatches.forEach(match => {
    tags.add(match.substring(1).toLowerCase())
  })
  
  // 頻出単語の抽出（簡易的な実装）
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3) // 3文字以上の単語
  
  // 単語の出現回数をカウント
  const wordCount = new Map<string, number>()
  words.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1)
  })
  
  // 出現回数が3回以上の単語をタグとして追加
  wordCount.forEach((count, word) => {
    if (count >= 3 && !isCommonWord(word)) {
      tags.add(word)
    }
  })
  
  return Array.from(tags).slice(0, 5) // 最大5つのタグ
}

// 一般的な単語を除外
function isCommonWord(word: string): boolean {
  const commonWords = [
    'this', 'that', 'these', 'those', 'have', 'with', 'from', 'into',
    'will', 'would', 'could', 'should', 'been', 'being', 'about',
    'after', 'before', 'during', 'through', 'under', 'over'
  ]
  return commonWords.includes(word)
}