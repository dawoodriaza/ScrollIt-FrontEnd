/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getUser, logout, isLoggedIn } from "@/lib/auth"
import { useEffect, useState } from "react"

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setUser(getUser())
    setLoggedIn(isLoggedIn())
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        {/* Logo */}
        <Link href="/streams" style={styles.logo}>
          <span style={styles.logoIcon}>🎥</span>
          <span style={styles.logoText}>LiveStream</span>
        </Link>

        {/* Search */}
        <input
          placeholder="Search streams..."
          style={styles.search}
          onKeyDown={(e: any) => {
            if (e.key === "Enter") {
              router.push(`/streams?search=${e.target.value}`)
            }
          }}
        />

        {/* Right side */}
        <div style={styles.right}>
          {loggedIn ? (
            <>
              <Link href="/streams/create" style={styles.createBtn}>
                + Go Live
              </Link>
              <Link href="/profile" style={styles.avatar}>
                {user?.username?.[0]?.toUpperCase() || "U"}
              </Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" style={styles.loginBtn}>
                Login
              </Link>
              <Link href="/register" style={styles.registerBtn}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

const styles: any = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "rgba(10,10,10,0.95)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid #222",
    padding: "0 24px",
    height: 60,
    display: "flex",
    alignItems: "center",
  },
  inner: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    width: "100%",
    maxWidth: 1400,
    margin: "0 auto",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    textDecoration: "none",
    flexShrink: 0,
  },
  logoIcon: { fontSize: 22 },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  search: {
    flex: 1,
    maxWidth: 400,
    padding: "8px 16px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 20,
    color: "white",
    fontSize: 14,
    outline: "none",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginLeft: "auto",
    flexShrink: 0,
  },
  createBtn: {
    padding: "7px 16px",
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
    borderRadius: 20,
    color: "white",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #a855f7, #ec4899)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 14,
    textDecoration: "none",
    cursor: "pointer",
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid #333",
    color: "#888",
    padding: "6px 12px",
    borderRadius: 8,
    fontSize: 13,
    cursor: "pointer",
  },
  loginBtn: {
    color: "#ccc",
    textDecoration: "none",
    fontSize: 14,
    padding: "7px 14px",
  },
  registerBtn: {
    padding: "7px 16px",
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
    borderRadius: 20,
    color: "white",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
  },
}
