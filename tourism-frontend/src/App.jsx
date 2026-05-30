import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ChatWindow from "./components/Chat/ChatWindow";
import MapPanel from "./components/Map/MapPanel";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";
import Login from "./Auth/Login";
import Register from "./Auth/Register";
import { useChat } from "./hooks/useChat";

/* =========================
   APP LAYOUT (CHAT + MAP)
   ========================= */
function MainLayout() {
  const [geoResults, setGeoResults] = useState(null)


  const {
    messages,
    loading,
    error,
    sendMessage,
    setMessages,
    createNewChat,
    openChat,
    deleteChat,
    currentChatId
  } = useChat(setGeoResults)

  const handleCreateNewChat = () => {
    createNewChat()
    setGeoResults(null)  // ← réinitialise la carte
  }

  const handleOpenChat = (chat) => {
    openChat(chat)
    setGeoResults(null)  // ← reset carte à l'ouverture
  }

  return (
    <div className="app-shell">
      <Sidebar
        openChat={handleOpenChat}
        createNewChat={handleCreateNewChat}
        deleteChat={deleteChat}
        currentChatId={currentChatId}
      />

      <div className="main-area">
        <Header />
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <ChatWindow
            messages={messages}
            loading={loading}
            error={error}
            sendMessage={sendMessage}
            onGeoResults={setGeoResults}
          />
          <MapPanel geoResults={geoResults} />
        </div>
      </div>
    </div>
  )
}

/* =========================
   AUTH LAYOUT
   ========================= */
function AuthLayout({ children }) {
  return <div className="auth-page">{children}</div>
}

/* =========================
   PROTECTED ROUTE
   ========================= */
function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem("token")
  return isAuth ? children : <Navigate to="/login" />
}

/* =========================
   APP
   ========================= */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
        <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}