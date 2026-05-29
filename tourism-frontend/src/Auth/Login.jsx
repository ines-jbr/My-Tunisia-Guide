// Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";   // Assurez-vous que le chemin est correct

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      alert("Invalid credentials");
      return;
    }

    localStorage.setItem("token", "demo-token");
    localStorage.setItem("currentUser", JSON.stringify(user));

    navigate("/");
  };

  return (
    <div className="login-split">
      {/* LEFT SIDE: BRAND + SUBTITLE */}
      <div className="login-brand">
        {/* Logo plus grand */}
        
        <img src={logo} alt="My Tunisia Guide Logo" className="login-logo-main" /> 
        <h1 className="brand-title">My Tunisia Guide</h1>
        <p className="brand-tagline">Explorez • Découvrez • Vivez la Tunisie</p>
        <p className="brand-description">
          Votre compagnon de voyage intelligent pour explorer les trésors de la Tunisie, 
          des ruines antiques de Carthage aux médinas animées, en passant par les plages 
          paradisiaques et les paysages infinis du désert du Sahara.
        </p>
        <div className="brand-features">
          <div className="feature-item">✨ Guide IA personnalisé</div>
          <div className="feature-item">🗺️ Itinéraires sur mesure</div>
          <div className="feature-item">📌 Recommandations locales authentiques</div>
        </div>
      </div>

      {/* RIGHT SIDE: LOGIN CARD */}
      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-header">
            {/* Logo à la place du globe */}
            <img src={logo} alt="Logo" width="60" height="60" style={{ marginBottom: "0.75rem" }} />
            <h2>Bienvenue à nouveau</h2>   {/* Nouveau texte en français */}
            <p className="login-sub">Connectez-vous à votre espace</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn">Se connecter</button>
          </form>

          <p className="signup-link">
            Pas encore de compte ? <Link to="/register">Créer un compte</Link>
          </p>
        </div>
      </div>
    </div>
  );
}