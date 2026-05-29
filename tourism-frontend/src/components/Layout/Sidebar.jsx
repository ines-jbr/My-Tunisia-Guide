import { useEffect, useState } from 'react';
import logo from '../../assets/logo.png';   // adaptez le chemin si nécessaire

export default function Sidebar({ setMessages, createNewChat }) {
  const [chatHistory, setChatHistory] = useState([]);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = () => {
    const chats = JSON.parse(localStorage.getItem('chatHistory')) || [];
    setChatHistory(chats);
  };

  const openChat = (chat) => {
    setMessages(chat.messages);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          {/* Remplacement du globe par l'image logo */}
          <img src={logo} alt="My Tunisia Guide" className="sidebar-logo-img" />
        </div>
        <div className="sidebar-logo-text">
          <span>MY TUNISIA GUIDE</span>
        </div>
      </div>

      <button className="new-chat-btn" onClick={createNewChat}>
        + Nouveau chat
      </button>

      <p className="sidebar-section-label">Historique</p>

      <div className="history-container">
        {chatHistory.length === 0 && (
          <div className="empty-history">Aucun chat</div>
        )}
        {chatHistory.map((chat) => (
          <button key={chat.id} className="sidebar-item" onClick={() => openChat(chat)}>
            💬 {chat.title}
          </button>
        ))}
      </div>

      <div className="sidebar-bottom">
        <div className="sidebar-status"></div>
      </div>
    </aside>
  );
}