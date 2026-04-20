"use client"
import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch(
        "http://localhost:8080/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      )

      const data = await res.json()
      setSuccess(data.message)
    } catch {
      setError("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span>🎥</span>
          <span style={styles.logoText}>LiveStream</span>
        </div>

        <h2 style={styles.title}>Forgot Password?</h2>
        <p style={styles.subtitle}>
          Enter your email and we'll send a reset link
        </p>

        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={handleSubmit}>
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
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p style={styles.footer}>
          <Link href="/login" style={styles.link}>
            ← Back to Login
          </Link>
        </p>
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
    fontSize: 24,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  title: {
    fontSize: 22,
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
  success: {
    background: "#0a2a0a",
    border: "1px solid #4ade80",
    color: "#4ade80",
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  field: { marginBottom: 16 },
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
  },
  footer: { textAlign: "center", marginTop: 20, fontSize: 14, color: "#888" },
  link: { color: "#a855f7" },
}
