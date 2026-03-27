import { useState, useRef, useEffect } from 'react'

export function InputBar({ onSend, loading }) {
  const [text, setText] = useState('')
  const textareaRef = useRef(null)

  // 自动调整高度
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [text])

  const handleSend = () => {
    if (!text.trim()) return
    onSend(text)
    setText('')
  }

  const handleKeyDown = (e) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div style={{ display: 'flex', gap: '8px', padding: '12px', borderTop: '0.5px solid var(--color-border-tertiary)', alignItems: 'flex-end' }}>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入消息... (Enter 发送，Shift+Enter 换行)"
        rows={3}
        disabled={loading}
        style={{
          flex: 1, resize: 'none', borderRadius: '12px',
          padding: '8px 12px', fontSize: '14px',
          border: '0.5px solid var(--color-border-secondary)',
          background: 'var(--color-background-primary)',
          color: 'var(--color-text-primary)',
          outline: 'none',
          lineHeight: '1.5',
          maxHeight: '160px',
          overflowY: 'auto',
        }}
      />
      <button
        onClick={handleSend}
        disabled={loading || !text.trim()}
        style={{
          padding: '8px 16px', borderRadius: '12px', fontSize: '14px',
          background: loading ? 'var(--color-background-secondary)' : '#378ADD',
          color: loading ? 'var(--color-text-secondary)' : '#fff',
          border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? '...' : '发送'}
      </button>
    </div>
  )
}
