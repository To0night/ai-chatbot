import { useEffect, useRef, useState } from 'react'
import { useChat } from '../hooks/useChat'
import { MessageBubble } from './MessageBubble'
import { InputBar } from './InputBar'

const MODES = [
  { value: 'chat',  label: 'DeepSeek 对话' },
  { value: 'agent', label: 'DeepSeek Agent（联网搜索）' },
]

export function ChatWindow() {
  const [mode, setMode] = useState('chat')
  const chat  = useChat('chat')
  const agent = useChat('agent')
  const { messages, status, send, clear } = mode === 'chat' ? chat : agent
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleModeChange = (e) => {
    setMode(e.target.value)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', width: '95vw', maxWidth: '95vw', margin: '0 auto',
      background: 'var(--color-background-primary)',
    }}>
      {/* 顶栏 */}
      <div style={{
        padding: '14px 20px', borderBottom: '0.5px solid var(--color-border-tertiary)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--color-background-primary)',
      }}>
        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-text-primary)' }}>
          AI 聊天机器人
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={mode}
            onChange={handleModeChange}
            style={{
              fontSize: '13px', padding: '4px 8px', borderRadius: '8px',
              border: '0.5px solid var(--color-border-secondary)',
              background: 'var(--color-background-secondary)',
              color: 'var(--color-text-primary)',
              cursor: 'pointer', outline: 'none',
            }}
          >
            {MODES.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <button onClick={clear} style={{
            fontSize: '13px', color: 'var(--color-text-secondary)',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px 8px', borderRadius: '6px',
          }}>
            清空对话
          </button>
        </div>
      </div>

      {/* 消息列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', marginTop: '40px', fontSize: '14px' }}>
            {mode === 'agent' ? '可提问实时信息，Agent 会自动联网搜索' : '发送一条消息开始对话'}
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 输入框 */}
      <InputBar onSend={send} loading={!!status} />
    </div>
  )
}
