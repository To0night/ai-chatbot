export function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
        <div style={{
          maxWidth: '75%', padding: '10px 14px',
          borderRadius: '18px 18px 4px 18px',
          background: '#378ADD', color: '#fff', fontSize: '14px', lineHeight: '1.6',
        }}>
          {message.content}
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '12px' }}>
      <div style={{ maxWidth: '85%' }}>

        {/* 工具调用日志 */}
        {message.toolCalls?.length > 0 && (
          <div style={{
            marginBottom: '8px', padding: '8px 12px',
            background: 'var(--color-background-secondary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '8px', fontSize: '12px',
            color: 'var(--color-text-secondary)',
          }}>
            {message.toolCalls.map((tc, i) => (
              <div key={i} style={{ marginBottom: i < message.toolCalls.length - 1 ? '6px' : 0 }}>
                <span style={{ color: 'var(--color-text-info)', fontWeight: 500 }}>
                  搜索：
                </span>
                {tc.input?.query}
                {tc.result && (
                  <span style={{ color: 'var(--color-text-success)', marginLeft: '6px' }}>
                    ✓ 已获取结果
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 主回复气泡 */}
        <div style={{
          padding: '10px 14px',
          borderRadius: '18px 18px 18px 4px',
          background: 'var(--color-background-secondary)',
          border: '0.5px solid var(--color-border-tertiary)',
          fontSize: '14px', lineHeight: '1.6',
          color: message.status ? 'var(--color-text-tertiary)' : 'var(--color-text-primary)',
        }}>
          {message.status === 'thinking' && '思考中...'}
          {message.status === 'searching' && '搜索中...'}
          {!message.status && (message.content || '▋')}
        </div>
      </div>
    </div>
  )
}
