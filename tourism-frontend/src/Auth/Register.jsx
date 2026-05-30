import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Register() {
  const navigate = useNavigate()

  const [step, setStep]         = useState(1) // 1=formulaire, 2=code
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode]         = useState("")
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")

  // ── Étape 1 : Envoyer le code
  const handleSendCode = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(
        "/api/auth/send-code",
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ name, email })
        }
      )
      const data = await res.json()

      if (data.success) {
        setStep(2)
        setSuccess(
          `Code envoyé à ${email} ! Vérifiez votre boîte mail.`
        )
      } else {
        setError(data.message)
      }
    } catch {
      setError("Impossible de contacter le serveur.")
    } finally {
      setLoading(false)
    }
  }

  // ── Étape 2 : Vérifier le code et créer le compte
  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(
        "/api/auth/verify-code",
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ name, email, password, code })
        }
      )
      const data = await res.json()

      if (data.success) {
        // Créer le compte localement
        const users   = JSON.parse(
          localStorage.getItem("users")) || []
        const newUser = { id: Date.now(), name, email, password }
        localStorage.setItem(
          "users", JSON.stringify([...users, newUser]))
        localStorage.setItem("token", "demo-token")
        localStorage.setItem(
          "currentUser", JSON.stringify(newUser))
        navigate("/")
      } else {
        setError(data.message)
      }
    } catch {
      setError("Impossible de contacter le serveur.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-split">
      {/* LEFT SIDE */}
      <div className="login-brand">
        <div className="brand-header">
          <img
            src={logo}
            alt="My Tunisia Guide Logo"
            style={{ width: "60px", height: "auto" }}
          />
          <h1 className="brand-title">My Tunisia Guide</h1>
        </div>
        <p className="brand-tagline">
          Explorez • Découvrez • Vivez la Tunisie
        </p>
        <p className="brand-description">
          Rejoignez une communauté de voyageurs passionnés
          et bénéficiez de recommandations personnalisées
          pour explorer les trésors de la Tunisie.
        </p>
        <div className="brand-features">
          <div className="feature-item">✨ Guide IA personnalisé</div>
          <div className="feature-item">🗺️ Itinéraires sur mesure</div>
          <div className="feature-item">
            📌 Recommandations locales authentiques
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="login-card-wrapper">
        <div className="login-card">

          <div className="login-header">
            <img
              src={logo}
              alt="Logo"
              style={{ width: "80px", height: "auto",
                       marginBottom: "0.75rem" }}
            />
            <h2>
              {step === 1 ? "Créer un compte" : "Vérification"}
            </h2>
            <p className="login-sub">
              {step === 1
                ? "Rejoignez l'aventure tunisienne"
                : `Code envoyé à ${email}`}
            </p>
          </div>

          {/* Indicateur étapes */}
          <div style={{
            display:        "flex",
            justifyContent: "center",
            gap:            "8px",
            marginBottom:   "1.5rem"
          }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                width:        s === step ? "24px" : "8px",
                height:       "8px",
                borderRadius: "4px",
                background:   s === step
                              ? "var(--gold)"
                              : s < step
                              ? "var(--gold-dim)"
                              : "var(--border)",
                transition:   "all 0.3s"
              }} />
            ))}
          </div>

          {/* Messages */}
          {error && (
            <div style={{
              background:   "rgba(220,50,50,0.1)",
              border:       "1px solid rgba(220,50,50,0.3)",
              borderRadius: "8px",
              padding:      "0.7rem 1rem",
              color:        "#E08080",
              fontSize:     "0.82rem",
              marginBottom: "1rem"
            }}>
              ⚠️ {error}
            </div>
          )}

          {success && (
            <div style={{
              background:   "rgba(76,175,80,0.1)",
              border:       "1px solid rgba(76,175,80,0.3)",
              borderRadius: "8px",
              padding:      "0.7rem 1rem",
              color:        "#4CAF50",
              fontSize:     "0.82rem",
              marginBottom: "1rem"
            }}>
              ✅ {success}
            </div>
          )}

          {/* ÉTAPE 1 — Formulaire */}
          {step === 1 && (
            <form onSubmit={handleSendCode}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-group">
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading
                  ? "Envoi en cours..."
                  : "Envoyer le code →"}
              </button>
            </form>
          )}

          {/* ÉTAPE 2 — Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Code à 6 chiffres"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  maxLength={6}
                  style={{
                    textAlign:    "center",
                    fontSize:     "1.5rem",
                    letterSpacing: "8px",
                    fontWeight:   "700"
                  }}
                  required
                />
              </div>
              <button
                type="submit"
                className="login-btn"
                disabled={loading}
              >
                {loading
                  ? "Vérification..."
                  : "Vérifier et créer le compte ✅"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep(1)
                  setError("")
                  setSuccess("")
                }}
                style={{
                  width:        "100%",
                  marginTop:    "0.5rem",
                  background:   "transparent",
                  border:       "1px solid var(--border)",
                  borderRadius: "8px",
                  padding:      "0.7rem",
                  color:        "var(--text-soft)",
                  cursor:       "pointer",
                  fontSize:     "0.85rem"
                }}
              >
                ← Modifier mes informations
              </button>
            </form>
          )}

          <p className="signup-link">
            Déjà un compte ?{" "}
            <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  )
}