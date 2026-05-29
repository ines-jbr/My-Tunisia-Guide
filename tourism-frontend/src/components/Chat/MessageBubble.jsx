import ReactMarkdown from 'react-markdown'
import Badge from '../UI/Badge'

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  // Nettoyer le texte avant affichage
  const cleanText = (text) => {
    if (!text) return ''

    return text
      // Supprimer les guillemets JSON restants
      .replace(/^["']|["']$/g, '')
      // Nettoyer les échappements JSON
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
      // Convertir les listes avec tirets
      .replace(/^\s*[-–]\s*/gm, '- ')
      // Nettoyer les flèches ->
      .replace(/->/g, '→')
      // Supprimer les guillemets autour des noms
      .replace(/"([^"]+)"/g, '**$1**')
      // Nettoyer lignes vides multiples
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  return (
    <div className={`bubble-row bubble-row--${isUser ? 'user' : 'bot'}`}>
      {!isUser && (
        <div className="bot-avatar">
          <span style={{ fontSize: '0.8rem' }}>🤖</span>
        </div>
      )}
      <div className={`bubble bubble--${isUser ? 'user' : 'bot'}`}>
        {isUser ? (
          <p className="bubble-text">{message.text}</p>
        ) : (
          <div className="bubble-text markdown-content">
            <ReactMarkdown
              components={{
                // Paragraphes
                p: ({ children }) => (
                  <p style={{ margin: '0.3rem 0', lineHeight: 1.6 }}>
                    {children}
                  </p>
                ),
                // Listes
                ul: ({ children }) => (
                  <ul style={{
                    margin: '0.4rem 0',
                    paddingLeft: '1.2rem',
                    listStyle: 'disc'
                  }}>
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li style={{ margin: '0.2rem 0', lineHeight: 1.5 }}>
                    {children}
                  </li>
                ),
                // Texte gras
                strong: ({ children }) => (
                  <strong style={{ color: '#60A5FA', fontWeight: 600 }}>
                    {children}
                  </strong>
                ),
                // Titres
                h1: ({ children }) => (
                  <h1 style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    margin: '0.5rem 0 0.3rem',
                    color: '#E2E8F0'
                  }}>
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    margin: '0.5rem 0 0.3rem',
                    color: '#E2E8F0'
                  }}>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    margin: '0.4rem 0 0.2rem',
                    color: '#CBD5E1'
                  }}>
                    {children}
                  </h3>
                ),
              }}
            >
              {cleanText(message.text)}
            </ReactMarkdown>
          </div>
        )}
        <div className="bubble-footer">
          {!isUser && message.source && (
            <Badge source={message.source} />
          )}
          <span className="bubble-time">{message.time}</span>
        </div>
      </div>
    </div>
  )
}