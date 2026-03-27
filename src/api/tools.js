// =============================================
// 第一部分：工具定义（告诉 Claude 有哪些工具可以用）
// 这个 JSON 结构是固定格式，Claude 会根据它来决定调用参数
// =============================================
// OpenAI / DeepSeek 兼容格式
export const tools = [
  {
    type: 'function',
    function: {
      name: 'web_search',
      description: '搜索互联网获取最新信息。当问题涉及当前事件、实时数据、或你不确定的事实时使用。',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索关键词，用英文效果更好',
          },
        },
        required: ['query'],
      },
    },
  },
]

// =============================================
// 第二部分：工具执行函数（真正去调用搜索 API）
// Claude 返回 tool_use 之后，你负责执行并把结果还给它
// =============================================
export async function executeTool(name, input) {
  // DeepSeek 返回的 arguments 是 JSON 字符串，需要解析
  const args = typeof input === 'string' ? JSON.parse(input) : input
  if (name === 'web_search') {
    return await webSearch(args.query)
  }
  throw new Error(`未知工具: ${name}`)
}

async function webSearch(query) {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: import.meta.env.VITE_TAVILY_API_KEY,
      query,
      max_results: 5,
      search_depth: 'basic',
    }),
  })

  if (!response.ok) {
    const errBody = await response.text()
    throw new Error(`Tavily 错误: ${response.status} — ${errBody}`)
  }

  const data = await response.json()

  if (!Array.isArray(data.results) || data.results.length === 0) {
    return `搜索"${query}"未找到相关结果。`
  }

  const results = data.results.map((r, i) =>
    `[${i + 1}] ${r.title}\n${r.url}\n${r.content}`
  ).join('\n\n')

  return `搜索"${query}"的结果：\n\n${results}`
}
