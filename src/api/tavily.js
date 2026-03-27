// Tavily 搜索 API
// 用最后一条用户消息作为搜索词，返回格式化的搜索结果

const API_URL = 'https://api.tavily.com/search'

export async function sendMessage(messages, onChunk) {
  // 取最后一条用户消息作为搜索词
  const query = [...messages].reverse().find(m => m.role === 'user')?.content || ''

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: import.meta.env.VITE_TAVILY_API_KEY,
      query,
      search_depth: 'basic',
      max_results: 5,
      include_answer: true,
    }),
  })

  if (!response.ok) {
    const errBody = await response.text()
    throw new Error(`Tavily 错误: ${response.status} — ${errBody}`)
  }

  const data = await response.json()

  // 格式化结果
  let result = ''
  if (data.answer) {
    result += `**摘要**\n${data.answer}\n\n`
  }
  if (data.results?.length) {
    result += `**相关结果**\n`
    data.results.forEach((item, i) => {
      result += `\n${i + 1}. **${item.title}**\n${item.content}\n来源：${item.url}\n`
    })
  }

  // 模拟流式输出，逐字推送
  let current = ''
  for (const char of result) {
    current += char
    onChunk(current)
    // 每 8 个字符 yield 一次，避免阻塞
    if (current.length % 8 === 0) {
      await new Promise(r => setTimeout(r, 0))
    }
  }

  return result
}
