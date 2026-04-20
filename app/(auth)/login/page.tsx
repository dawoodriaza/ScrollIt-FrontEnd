"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { saveToken, saveUser } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (res.ok) {
        saveToken(data.accessToken)
        saveUser(data.user)
        router.push("/streams")
      } else {
        setError(data.message || "Invalid email or password")
      }
    } catch (err) {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🎥</span>
          <span style={styles.logoText}>LiveStream</span>
        </div>

        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          <div style={{ textAlign: "right", marginBottom: 16 }}>
            <Link href="/forgot-password" style={styles.link}>
              Forgot password?
            </Link>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link href="/register" style={styles.link}>
            Sign up
          </Link>
        </p>

        <div style={styles.divider}>
          <span style={styles.dividerText}>or</span>
        </div>

        <Link href="/streams">
          <button style={styles.guestButton}>👀 Continue as Guest</button>
        </Link>
      </div>
    </div>
  )
}

const styles: any = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 100%)",
    padding: 16,
  },
  card: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 16,
    padding: 40,
    width: "100%",
    maxWidth: 400,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
    justifyContent: "center",
  },
  logoIcon: { fontSize: 28 },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
    fontSize: 14,
  },
  error: {
    background: "#2a0a0a",
    border: "1px solid #f87171",
    color: "#f87171",
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#ccc",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 8,
    color: "white",
    fontSize: 14,
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
    border: "none",
    borderRadius: 8,
    color: "white",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
  guestButton: {
    width: "100%",
    padding: "12px",
    background: "transparent",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#aaa",
    fontSize: 14,
    cursor: "pointer",
  },
  footer: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
    color: "#888",
  },
  link: {
    color: "#a855f7",
    textDecoration: "none",
    fontSize: 14,
  },
  divider: {
    display: "flex",
    alignItems: "center",
    margin: "20px 0",
    gap: 12,
  },
  dividerText: {
    color: "#555",
    fontSize: 13,
    display: "block",
    textAlign: "center",
    width: "100%",
  },
}
