import { useState, useCallback, useRef } from 'react'
import { sendChatMessage } from '../services/api'

const makeId = () => Date.now() + Math.random()
const now = () => new Date().toLocaleTimeString('fr-FR', {
  hour: '2-digit', minute: '2-digit'
})

const generateChatId = () => `chat_${Date.now()}`

// ← Clé unique par utilisateur
const getUserKey = () => {
  const user = JSON.parse(localStorage.getItem('currentUser'))
  return user ? `chatHistory_${user.email}` : 'chatHistory_guest'
}

export function useChat(onGeoResults) {
  const [messages, setMessages]           = useState([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [currentChatId, setCurrentChatId] = useState(generateChatId())
  const currentChatIdRef = useRef(currentChatId)

  // ── Charger historique utilisateur courant
  const loadHistory = () => {
    return JSON.parse(localStorage.getItem(getUserKey())) || []
  }

  // ── Sauvegarder conversation
  const saveChat = useCallback((chatId, allMessages, firstMessage) => {
    const history  = loadHistory()
    const existing = history.findIndex(c => c.id === chatId)

    const chatEntry = {
      id:       chatId,
      title:    firstMessage.length > 35
                ? firstMessage.substring(0, 35) + '...'
                : firstMessage,
      messages: allMessages,
      date:     new Date().toISOString(),
      preview:  allMessages[allMessages.length - 1]
                ?.text?.substring(0, 60) + '...'
    }

    if (existing >= 0)
      history[existing] = chatEntry
    else
      history.unshift(chatEntry)

    localStorage.setItem(
      getUserKey(),
      JSON.stringify(history.slice(0, 50))
    )
  }, [])

  // ── Nouveau chat
  const createNewChat = useCallback(() => {
    const newId = generateChatId()
    setCurrentChatId(newId)
    currentChatIdRef.current = newId
    setMessages([])
    setError(null)
  }, [])

  // ── Ouvrir chat existant
  const openChat = useCallback((chat) => {
    setCurrentChatId(chat.id)
    currentChatIdRef.current = chat.id
    setMessages(chat.messages)
    setError(null)
  }, [])

  // ── Supprimer chat
  const deleteChat = useCallback((chatId) => {
    const history = loadHistory().filter(c => c.id !== chatId)
    localStorage.setItem(getUserKey(), JSON.stringify(history))
    if (chatId === currentChatIdRef.current)
      createNewChat()
  }, [createNewChat])

  // ── Envoyer message
  const sendMessage = useCallback(async (text) => {
    if (!text.trim() || loading) return
    setError(null)

    const userMsg = { id: makeId(), role: 'user', text, time: now() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const data = await sendChatMessage(text)

      let responseText = data.text || 'Pas de réponse.'
      responseText = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim()

      try {
        const parsed = JSON.parse(responseText)
        if (parsed.text) responseText = parsed.text
      } catch {
        const match = responseText.match(
          /"text"\s*:\s*"([\s\S]*?)"(?:\s*,|\s*\})/
        )
        if (match)
          responseText = match[1]
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
      }

      responseText = responseText.replace(/\\n/g, '\n').trim()

      const botMsg = {
        id:     makeId(),
        role:   'assistant',
        text:   responseText,
        source: data.fromCache ? 'Cache ⚡' : 'Gemini 🧠',
        time:   now()
      }

      setMessages(prev => {
        const updated = [...prev, botMsg]
        const firstUserMsg = updated.find(m => m.role === 'user')
        saveChat(
          currentChatIdRef.current,
          updated,
          firstUserMsg?.text || text
        )
        return updated
      })

      if (data.geoJson && onGeoResults)
        onGeoResults(data.geoJson)

    } catch {
      setError('Impossible de contacter le serveur.')
    } finally {
      setLoading(false)
    }
  }, [loading, onGeoResults, saveChat])

  return {
    messages, loading, error,
    sendMessage, setMessages,
    createNewChat, openChat, deleteChat,
    currentChatId
  }
}