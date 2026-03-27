import { useState, useCallback } from 'react'
import { sendMessage, runAgent } from '../api/claude'

export function useChat(mode = 'chat') {
  const [messages, setMessages] = useState([])
  const [history, setHistory]   = useState([])
  const [status, setStatus]     = useState(null) // 'thinking' | 'searching' | null

  const send = useCallback(async (text) => {
    if (!text.trim() || status) return

    const userMsg = { role: 'user', content: text }
    const newHistory = [...history, userMsg]

    setMessages(prev => [...prev, { role: 'user', content: text }])
    setHistory(newHistory)
    setMessages(prev => [...prev, { role: 'assistant', content: '', status: 'thinking', toolCalls: [] }])

    if (mode === 'chat') {
      // 普通流式对话
      setStatus('thinking')
      try {
        const fullText = await sendMessage(newHistory, (chunk) => {
          setMessages(prev => {
            const next = [...prev]
            next[next.length - 1] = { role: 'assistant', content: chunk, status: 'thinking', toolCalls: [] }
            return next
          })
        })
        setHistory(prev => [...prev, { role: 'assistant', content: fullText }])
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: fullText, status: null, toolCalls: [] }
          return next
        })
      } catch (err) {
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: `出错了: ${err.message}`, status: null, toolCalls: [] }
          return next
        })
      } finally {
        setStatus(null)
      }
      return
    }

    // Agent 模式
    const toolCallsLog = []
    await runAgent(newHistory, (event) => {
      if (event.type === 'thinking') {
        setStatus('thinking')
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: '', status: 'thinking', toolCalls: [] }
          return next
        })
      }

      if (event.type === 'tool_call') {
        setStatus('searching')
        toolCallsLog.push({ name: event.name, input: event.input, result: null })
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: '', status: 'searching', toolCalls: [...toolCallsLog] }
          return next
        })
      }

      if (event.type === 'tool_result') {
        const last = toolCallsLog[toolCallsLog.length - 1]
        if (last) last.result = event.result
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: '', status: 'searching', toolCalls: [...toolCallsLog] }
          return next
        })
      }

      if (event.type === 'done') {
        setStatus(null)
        setHistory(prev => [...prev, { role: 'assistant', content: event.text }])
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: event.text, status: null, toolCalls: toolCallsLog }
          return next
        })
      }

      if (event.type === 'error') {
        setStatus(null)
        setMessages(prev => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: `出错了: ${event.text}`, status: null, toolCalls: [] }
          return next
        })
      }
    })

    console.log(history, 'history')

    setStatus(null)
  }, [history, status, mode])

  const clear = useCallback(() => {
    setMessages([])
    setHistory([])
    setStatus(null)
  }, [])

  return { messages, status, send, clear }
}
