import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ChatWindow from "./components/Chat/ChatWindow";
import MapPanel from "./components/Map/MapPanel";
import Sidebar from "./components/Layout/Sidebar";
import Header from "./components/Layout/Header";

import Login from "./Auth/Login";
import Register from "./Auth/Register";

/* =========================
   APP LAYOUT (CHAT + MAP)
   ========================= */
function MainLayout() {
  const [geoResults, setGeoResults] = useState(null);

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="main-area">
        <Header />

        <div style={{ display: "flex", flex: 1 }}>
          <ChatWindow onGeoResults={setGeoResults} />
          <MapPanel geoResults={geoResults} />
        </div>
      </div>
    </div>
  );
}

/* =========================
   AUTH LAYOUT (FULLSCREEN)
   ========================= */
function AuthLayout({ children }) {
  return <div className="auth-page">{children}</div>;
}

/* =========================
   ROUTES
   ========================= */
function ProtectedRoute({ children }) {
  const isAuth = localStorage.getItem("token");
  return isAuth ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* AUTH */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <Login />
            </AuthLayout>
          }
        />

        <Route
          path="/register"
          element={
            <AuthLayout>
              <Register />
            </AuthLayout>
          }
        />

        {/* APP */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}