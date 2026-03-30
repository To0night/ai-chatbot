export function UploadPanel({ docs, uploading, onUpload }) {
  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) onUpload(file)
  }

  return (
    <div style={{
      width: '260px', borderRight: '0.5px solid var(--color-border-tertiary)',
      padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
    }}>
      <div style={{ fontWeight: 500, fontSize: '14px' }}>知识库</div>

      <label style={{
        display: 'block', padding: '10px', textAlign: 'center',
        border: '0.5px dashed var(--color-border-secondary)',
        borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer',
        fontSize: '13px', color: 'var(--color-text-secondary)',
      }}>
        {uploading ? '处理中...' : '+ 上传文档'}
        <input
          type="file" accept=".txt,.md" onChange={handleFile}
          disabled={uploading} style={{ display: 'none' }}
        />
      </label>

      {docs.map((doc, i) => (
        <div key={i} style={{
          padding: '8px 10px', background: 'var(--color-background-secondary)',
          borderRadius: '6px', fontSize: '13px',
        }}>
          <div style={{ fontWeight: 500, marginBottom: '2px' }}>{doc.name}</div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>
            {doc.chunks} 个片段
          </div>
        </div>
      ))}

      {docs.length === 0 && !uploading && (
        <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
          上传 .txt 或 .md 文件<br />开始构建知识库
        </div>
      )}
    </div>
  )
}