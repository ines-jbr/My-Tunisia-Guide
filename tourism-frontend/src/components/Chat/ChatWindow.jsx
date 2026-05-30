import { useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import ChatInput from './ChatInput'

function TypingIndicator() {
  return (
    <div className="typing-row">
      <div className="bot-avatar">
        <span style={{ fontSize: '0.8rem' }}>🤖</span>
      </div>
      <div className="typing-bubble">
        <span className="t-dot" />
        <span className="t-dot" />
        <span className="t-dot" />
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">🌍</div>
      <p className="empty-title">Bienvenue sur My Tunisia Guide</p>
      <p className="empty-sub">
        Posez une question sur les hôtels, restaurants,
        sites archéologiques ou événements culturels en Tunisie.
      </p>
    </div>
  )
}

function ErrorBanner({ message }) {
  return (
    <div style={{
      margin: '0 2rem',
      padding: '0.65rem 1rem',
      background: 'rgba(220,50,50,0.1)',
      border: '1px solid rgba(220,50,50,0.25)',
      borderRadius: '8px',
      color: '#E08080',
      fontSize: '0.82rem',
    }}>
      ⚠️ {message}
    </div>
  )
}

export default function ChatWindow({
  messages,
  loading,
  error,
  sendMessage,
  onGeoResults
}) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  return (
    <div className="chat-window">
      <div className="messages-area">
        {messages.length === 0 && !loading
          ? <EmptyState />
          : messages.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))
        }
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>
      {error && <ErrorBanner message={error} />}
      <ChatInput onSend={sendMessage} loading={loading} />
    </div>
  )
}