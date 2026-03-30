// RAG 的最后一步：把相关 chunks 拼进 prompt，让 Claude 基于你的文档回答

export async function answerWithContext(question, chunks, onChunk) {
  // 拼装上下文
  const context = chunks.map((chunk, i) =>
    `【来源 ${i + 1}：${chunk.metadata.source}】\n${chunk.content}`
  ).join('\n\n---\n\n')

  const systemPrompt = `你是一个知识库问答助手。请严格根据以下提供的文档内容回答用户的问题。

要求：
1. 只使用文档中明确提到的信息
2. 如果文档中没有相关信息，直接说"文档中没有这方面的内容"
3. 回答时注明信息来自哪个来源（用【来源X】标注）
4. 用中文回答

以下是相关文档片段：
${context}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: question }],
    }),
  })

  // 流式读取（和 Level 1 一样）
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const chunk = decoder.decode(value)
    for (const line of chunk.split('\n')) {
      if (!line.startsWith('data: ')) continue
      try {
        const parsed = JSON.parse(line.slice(6))
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          fullText += parsed.delta.text
          onChunk?.(fullText)
        }
      } catch {}
    }
  }

  return fullText
}