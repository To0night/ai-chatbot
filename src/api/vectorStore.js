// 这是整个 RAG 的核心数学
// 余弦相似度：两个向量夹角的余弦值，越接近 1 表示越相似
function cosineSimilarity(a, b) {
  // 点积
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0)
  // 向量长度
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0))
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0))
  return dot / (normA * normB)
}

// 内存向量库
// 生产环境可以换成 Pinecone / Chroma / Weaviate
class VectorStore {
  constructor() {
    this.documents = [] // [{ id, content, embedding, metadata }]
  }

  // 添加文档（上传时调用）
  add(id, content, embedding, metadata = {}) {
    this.documents.push({ id, content, embedding, metadata })
  }

  // 语义搜索：找最相关的 topK 个 chunk
  search(queryEmbedding, topK = 5) {
    if (this.documents.length === 0) return []

    // 计算查询向量和每个文档的相似度
    const scored = this.documents.map(doc => ({
      ...doc,
      score: cosineSimilarity(queryEmbedding, doc.embedding),
    }))

    // 按相似度降序排列，取前 topK 个
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .filter(d => d.score > 0.3) // 过滤掉相关性太低的
  }

  // 清空（重新上传时用）
  clear() {
    this.documents = []
  }

  get size() {
    return this.documents.length
  }
}

// 单例：整个应用共用一个向量库
export const vectorStore = new VectorStore()