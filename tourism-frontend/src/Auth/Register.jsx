// Register.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Vérifier si l'email existe déjà
    if (users.some((u) => u.email === email)) {
      alert("Cet email est déjà utilisé.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
    };

    localStorage.setItem("users", JSON.stringify([...users, newUser]));
    localStorage.setItem("token", "demo-token");
    localStorage.setItem("currentUser", JSON.stringify(newUser));

    navigate("/");
  };

  return (
    <div className="login-split">
      {/* LEFT SIDE: BRAND + LOGO + TITRE (même ligne) */}
      <div className="login-brand">
        <div className="brand-header">
          <img
            src={logo}
            alt="My Tunisia Guide Logo"
            className="login-logo-main"
            style={{ width: "60px", height: "auto", marginBottom: 0 }}
          />
          <h1 className="brand-title" style={{ marginBottom: 0 }}>
            My Tunisia Guide
          </h1>
        </div>

        <p className="brand-tagline">Explorez • Découvrez • Vivez la Tunisie</p>
        <p className="brand-description">
          Rejoignez une communauté de voyageurs passionnés et bénéficiez de recommandations
          personnalisées pour explorer les trésors de la Tunisie.
        </p>
        <div className="brand-features">
          <div className="feature-item">✨ Guide IA personnalisé</div>
          <div className="feature-item">🗺️ Itinéraires sur mesure</div>
          <div className="feature-item">📌 Recommandations locales authentiques</div>
        </div>
      </div>

      {/* RIGHT SIDE: REGISTER CARD */}
      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-header">
            <img
              src={logo}
              alt="Logo"
              width="60"
              height="60"
              style={{ marginBottom: "0.75rem" }}
            />
            <h2>Créer un compte</h2>
            <p className="login-sub">Rejoignez l'aventure tunisienne</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Nom complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-btn">S'inscrire</button>
          </form>

          <p className="signup-link">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}