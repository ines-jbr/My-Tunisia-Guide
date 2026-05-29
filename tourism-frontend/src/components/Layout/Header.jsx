import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const handleLogout = () => {
    // 1. supprimer session
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");

    // 2. fermer menu
    setShowMenu(false);

    // 3. redirection login
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-title-group">
        <div className="header-avatar">
          <span style={{ fontSize: "0.85rem" }}>🤖</span>
        </div>

        <div>
          <p className="header-name">📍 My Tunisia Guide</p>
          <p className="header-sub">
            Explorez • Découvrez • Vivez la Tunisie
          </p>
        </div>
      </div>

      <div className="header-badges">
        <div className="user-menu">

          <span
            className="badge badge--user"
            onClick={() => setShowMenu(!showMenu)}
          >
            👤 {currentUser?.name || "User"} ▼
          </span>

          {showMenu && (
            <div className="dropdown-menu">
              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}