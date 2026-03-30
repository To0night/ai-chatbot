import { getEmbedding, getEmbeddings } from './embedding'
import { vectorStore } from './vectorStore'

// =============================================
// 文档处理：切分 → Embedding → 存入向量库
// =============================================

// 把长文档切成小块（chunk）
// 策略：按段落切，每块不超过 500 字，相邻块有 50 字重叠（避免语义断层）
function splitIntoChunks(text, chunkSize = 500, overlap = 50) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 20)
  const chunks = []
  let current = ''

  for (const para of paragraphs) {
    if ((current + para).length > chunkSize && current.length > 0) {
      chunks.push(current.trim())
      // 保留末尾 overlap 字作为下一块的开头
      current = current.slice(-overlap) + '\n\n' + para
    } else {
      current += (current ? '\n\n' : '') + para
    }
  }

  if (current.trim()) chunks.push(current.trim())
  return chunks
}

// 上传并处理文档
export async function processDocument(file, onProgress) {
  // 1. 读取文件内容
  const text = await readFile(file)
  onProgress?.({ stage: 'reading', message: '读取文件...' })

  // 2. 切分成 chunks
  const chunks = splitIntoChunks(text)
  onProgress?.({ stage: 'chunking', message: `切分为 ${chunks.length} 个片段` })

  // 3. 批量获取 Embedding
  onProgress?.({ stage: 'embedding', message: '生成向量中（可能需要几秒）...' })
  const embeddings = await getEmbeddings(chunks)

  // 4. 存入向量库
  chunks.forEach((chunk, i) => {
    vectorStore.add(
      `${file.name}-chunk-${i}`,
      chunk,
      embeddings[i],
      { source: file.name, chunkIndex: i }
    )
  })

  onProgress?.({ stage: 'done', message: `${file.name} 处理完成，共 ${chunks.length} 个片段` })
  return chunks.length
}

// =============================================
// RAG 检索：问题 → 向量 → 搜索相关 chunks
// =============================================
export async function retrieveRelevantChunks(question) {
  // 1. 把问题也变成向量
  const questionEmbedding = await getEmbedding(question)

  // 2. 在向量库里搜索最相关的 chunks
  const results = vectorStore.search(questionEmbedding, 5)

  return results
}

// 读取文件为文本
function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsText(file, 'utf-8')
  })
}