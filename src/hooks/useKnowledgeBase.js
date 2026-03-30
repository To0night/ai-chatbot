import { useState, useCallback } from 'react'
import { processDocument, retrieveRelevantChunks } from '../api/rag'
import { answerWithContext } from '../api/claude'
import { vectorStore } from '../api/vectorStore'

export function useKnowledgeBase() {
  const [docs, setDocs]           = useState([])   // 已上传的文档列表
  const [messages, setMessages]   = useState([])
  const [uploading, setUploading] = useState(false)
  const [asking, setAsking]       = useState(false)

  // 上传文档
  const uploadDoc = useCallback(async (file) => {
    setUploading(true)
    try {
      const chunkCount = await processDocument(file, ({ message }) => {
        // 可以在这里更新进度
        console.log(message)
      })
      setDocs(prev => [...prev, { name: file.name, chunks: chunkCount }])
    } finally {
      setUploading(false)
    }
  }, [])

  // 提问
  const ask = useCallback(async (question) => {
    if (!question.trim() || asking) return
    if (vectorStore.size === 0) {
      alert('请先上传文档！')
      return
    }

    setAsking(true)
    setMessages(prev => [...prev, { role: 'user', content: question }])

    // 1. 检索相关 chunks
    const chunks = await retrieveRelevantChunks(question)

    // 2. 占位消息
    setMessages(prev => [...prev, {
      role: 'assistant', content: '', streaming: true, sources: chunks
    }])

    // 3. 流式生成回答
    await answerWithContext(question, chunks, (text) => {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = {
          role: 'assistant', content: text, streaming: true, sources: chunks
        }
        return next
      })
    })

    setMessages(prev => {
      const next = [...prev]
      next[next.length - 1].streaming = false
      return next
    })

    setAsking(false)
  }, [asking])

  const clear = useCallback(() => {
    setMessages([])
    setDocs([])
    vectorStore.clear()
  }, [])

  return { docs, messages, uploading, asking, uploadDoc, ask, clear }
}