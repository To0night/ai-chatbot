export function SourceCard({ sources }) {
  if (!sources?.length) return null

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{ fontSize: '11px', color: 'var(--color-text-tertiary)', marginBottom: '4px' }}>
        参考来源
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {sources.map((s, i) => (
          <div key={i} style={{
            fontSize: '11px', padding: '3px 8px',
            background: 'var(--color-background-info)',
            color: 'var(--color-text-info)',
            borderRadius: '10px',
          }}>
            {s.metadata.source} · {(s.score * 100).toFixed(0)}% 相关
          </div>
        ))}
      </div>
    </div>
  )
}