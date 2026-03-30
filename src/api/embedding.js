// 调用 OpenAI Embedding API，把一段文字变成一个向量数组
// 向量长度固定 1536，代表语义在 1536 维空间中的坐标
export async function getEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000), // 最多 8000 字符
    }),
  })
  const data = await response.json()
  return data.data[0].embedding // 返回 [0.02, -0.15, 0.83, ...] 共 1536 个数
}

// 批量获取 Embedding（上传文档时用）
export async function getEmbeddings(texts) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: texts.map(t => t.slice(0, 8000)),
    }),
  })
  const data = await response.json()
  return data.data.map(d => d.embedding)
}