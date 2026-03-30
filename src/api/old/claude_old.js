// DeepSeek API（OpenAI 兼容格式）
// sendMessage：普通流式对话
// runAgent：Agent 循环，支持工具调用

import { tools, executeTool } from './tools'

const API_URL = 'https://api.deepseek.com/chat/completions'
const HEADERS = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${import.meta.env.VITE_DEEPSEEK_API_KEY}`,
}

// ——— 普通对话（流式）———
export async function sendMessage(history, onChunk) {
  const messages = [
    { role: 'system', content: '你是一个友好的 AI 助手，用中文回答用户。' },
    ...history,
  ]

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({ model: 'deepseek-chat', max_tokens: 1024, stream: true, messages }),
  })

  if (!response.ok) {
    const errBody = await response.text()
    throw new Error(`API 错误: ${response.status} — ${errBody}`)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let fullText = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    const lines = decoder.decode(value).split('\n')
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6)
      if (data === '[DONE]') continue
      try {
        const text = JSON.parse(data).choices?.[0]?.delta?.content
        if (text) { fullText += text; onChunk(fullText) }
      } catch { /* ignore */ }
    }
  }
  return fullText
}

const AGENT_SYSTEM = `你是一个智能助手，可以使用工具搜索互联网获取最新信息。
当用户的问题需要实时信息时，主动使用 web_search 工具。
用中文回答用户。`

export async function runAgent(history, onEvent) {
  // DeepSeek 的 system 放在 messages 第一条
  let messages = [
    { role: 'system', content: AGENT_SYSTEM },
    ...history,
  ]

  for (let i = 0; i < 5; i++) {
    onEvent({ type: 'thinking' })

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        model: 'deepseek-chat',
        max_tokens: 1024,
        tools,
        messages,
      }),
    })

    if (!response.ok) {
      const errBody = await response.text()
      onEvent({ type: 'error', text: `API 错误: ${response.status} — ${errBody}` })
      return
    }

    const data = await response.json()
    const choice = data.choices[0]
    const assistantMsg = choice.message

    // ⭐ 把 assistant 回复加入历史
    messages.push(assistantMsg)

    if (choice.finish_reason === 'stop') {
      onEvent({ type: 'done', text: assistantMsg.content || '' })
      return
    }

    if (choice.finish_reason === 'tool_calls') {
      const toolCalls = assistantMsg.tool_calls || []

      const toolResults = await Promise.all(
        toolCalls.map(async (tc) => {
          onEvent({ type: 'tool_call', name: tc.function.name, input: tc.function.arguments })

          try {
            const result = await executeTool(tc.function.name, tc.function.arguments)
            onEvent({ type: 'tool_result', name: tc.function.name, result })
            return { role: 'tool', tool_call_id: tc.id, content: result }
          } catch (err) {
            return { role: 'tool', tool_call_id: tc.id, content: `工具执行失败: ${err.message}` }
          }
        })
      )

      // ⭐ DeepSeek 格式：每条工具结果是独立的 role:'tool' 消息
      messages.push(...toolResults)
      continue
    }
  }

  onEvent({ type: 'error', text: '超过最大循环次数' })
}
