import { useEffect, useState } from 'react'
import logo from '../../assets/logo.png'

export default function Sidebar({ openChat, createNewChat, currentChatId }) {
  const [history, setHistory]   = useState([])
  const [hoveredId, setHoveredId] = useState(null)

  // Recharger l'historique à chaque changement
  useEffect(() => {
    loadHistory()
  }, [currentChatId])

  const getUserKey = () => {
    const user = JSON.parse(localStorage.getItem('currentUser'))
    return user ? `chatHistory_${user.email}` : 'chatHistory_guest'
  }
  const loadHistory = () => {
    const chats = JSON.parse(localStorage.getItem(getUserKey())) || []
    setHistory(chats)
  }

  const handleDelete = (e, chatId) => {
    e.stopPropagation()
    const updated = history.filter(c => c.id !== chatId)
    localStorage.setItem(getUserKey(), JSON.stringify(updated))
    setHistory(updated)
  }

  // Grouper par date
  const groupByDate = (chats) => {
    const today     = new Date().toDateString()
    const yesterday = new Date(Date.now() - 86400000).toDateString()

    const groups = {
      "Aujourd'hui": [],
      "Hier":        [],
      "Plus ancien": []
    }

    chats.forEach(chat => {
      const chatDate = new Date(chat.date).toDateString()
      if (chatDate === today)
        groups["Aujourd'hui"].push(chat)
      else if (chatDate === yesterday)
        groups["Hier"].push(chat)
      else
        groups["Plus ancien"].push(chat)
    })

    return groups
  }

  const groups = groupByDate(history)

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <img
            src={logo}
            alt="My Tunisia Guide"
            className="sidebar-logo-img"
          />
        </div>
        <div className="sidebar-logo-text">
          My <span>Tunisia</span> Guide
        </div>
      </div>

      {/* Nouveau chat */}
      <button className="new-chat-btn" onClick={createNewChat}>
        + Nouveau chat
      </button>

      {/* Historique groupé */}
      <div className="history-container">
        {history.length === 0 ? (
          <div className="empty-history">
            Aucune conversation
          </div>
        ) : (
          Object.entries(groups).map(([label, chats]) =>
            chats.length === 0 ? null : (
              <div key={label}>
                <p className="sidebar-section-label">{label}</p>
                {chats.map(chat => (
                  <div
                    key={chat.id}
                    className="history-item"
                    style={{
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'space-between',
                      padding:        '0.5rem 0.75rem',
                      borderRadius:   '8px',
                      cursor:         'pointer',
                      background:     chat.id === currentChatId
                                      ? 'var(--gold-glow)'
                                      : hoveredId === chat.id
                                      ? 'var(--surface2)'
                                      : 'transparent',
                      border:         chat.id === currentChatId
                                      ? '1px solid var(--gold-dim)'
                                      : '1px solid transparent',
                      marginBottom:   '2px',
                      transition:     'all 0.15s',
                    }}
                    onClick={() => openChat(chat)}
                    onMouseEnter={() => setHoveredId(chat.id)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Titre */}
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{
                        fontSize:     '0.82rem',
                        color:        chat.id === currentChatId
                                      ? 'var(--gold)'
                                      : 'var(--text)',
                        fontWeight:   chat.id === currentChatId
                                      ? 600 : 400,
                        whiteSpace:   'nowrap',
                        overflow:     'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        💬 {chat.title}
                      </div>
                      {chat.preview && (
                        <div style={{
                          fontSize:     '0.7rem',
                          color:        'var(--text-dim)',
                          whiteSpace:   'nowrap',
                          overflow:     'hidden',
                          textOverflow: 'ellipsis',
                          marginTop:    '2px'
                        }}>
                          {chat.preview}
                        </div>
                      )}
                    </div>

                    {/* Bouton supprimer */}
                    {hoveredId === chat.id && (
                      <button
                        onClick={(e) => handleDelete(e, chat.id)}
                        style={{
                          background:   'transparent',
                          border:       'none',
                          color:        'var(--text-dim)',
                          cursor:       'pointer',
                          padding:      '2px 6px',
                          borderRadius: '4px',
                          fontSize:     '0.8rem',
                          flexShrink:   0,
                          marginLeft:   '4px',
                        }}
                        title="Supprimer"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )
          )
        )}
      </div>

      {/* Status */}
      <div className="sidebar-bottom">
        <div className="sidebar-status">
          <div className="status-dot" />
          Backend connecté
        </div>
      </div>
    </aside>
  )
}