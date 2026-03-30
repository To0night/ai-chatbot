import { useKnowledgeBase } from './hooks/useKnowledgeBase'
import { UploadPanel } from './components/UploadPanel'
import { SourceCard } from './components/SourceCard'
import { useState, useRef, useEffect } from 'react'

export default function App() {
  const { docs, messages, uploading, asking, uploadDoc, ask, clear } = useKnowledgeBase()
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    ask(input)
    setInput('')
  }

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <UploadPanel docs={docs} uploading={uploading} onUpload={uploadDoc} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 顶栏 */}
        <div style={{
          padding: '12px 16px', borderBottom: '0.5px solid var(--color-border-tertiary)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{ fontWeight: 500 }}>知识库问答</span>
          <button onClick={clear} style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>清空</button>
        </div>

        {/* 消息列表 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--color-text-tertiary)', marginTop: '60px', fontSize: '14px' }}>
              上传文档后，开始提问
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '16px',
            }}>
              <div style={{ maxWidth: '80%' }}>
                <div style={{
                  padding: '10px 14px', fontSize: '14px', lineHeight: '1.7',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? '#378ADD' : 'var(--color-background-secondary)',
                  color: msg.role === 'user' ? '#fff' : 'var(--color-text-primary)',
                  border: msg.role === 'user' ? 'none' : '0.5px solid var(--color-border-tertiary)',
                }}>
                  {msg.content || (msg.streaming ? '▋' : '')}
                </div>
                {msg.role === 'assistant' && !msg.streaming && (
                  <SourceCard sources={msg.sources} />
                )}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* 输入框 */}
        <div style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '0.5px solid var(--color-border-tertiary)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="基于已上传的文档提问..."
            disabled={asking}
            style={{
              flex: 1, padding: '8px 12px', borderRadius: '12px', fontSize: '14px',
              border: '0.5px solid var(--color-border-secondary)',
              background: 'var(--color-background-primary)',
              color: 'var(--color-text-primary)', outline: 'none',
            }}
          />
          <button
            onClick={handleSend}
            disabled={asking || !input.trim()}
            style={{
              padding: '8px 16px', borderRadius: '12px', fontSize: '14px',
              background: asking ? 'var(--color-background-secondary)' : '#378ADD',
              color: asking ? 'var(--color-text-secondary)' : '#fff',
              border: 'none', cursor: asking ? 'not-allowed' : 'pointer',
            }}
          >
            {asking ? '...' : '提问'}
          </button>
        </div>
      </div>
    </div>
  )
}