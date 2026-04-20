"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import StreamCard from "@/components/StreamCard"
import { getToken, getUser, isLoggedIn, saveUser } from "@/lib/auth"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [streams, setStreams] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("streams")
  const [editUsername, setEditUsername] = useState("")
  const [editing, setEditing] = useState(false)
  const [profileFile, setProfileFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push("/login")
      return
    }
    fetchProfile()
    fetchMyStreams()
    fetchTransactions()
  }, [])

  const fetchProfile = async () => {
    const res = await fetch("http://localhost:8080/api/users/me", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    const data = await res.json()
    setUser(data)
    setEditUsername(data.username)
    setLoading(false)
  }

  const fetchMyStreams = async () => {
    const res = await fetch("http://localhost:8080/api/streams/my", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    const data = await res.json()
    setStreams(Array.isArray(data) ? data : [])
  }

  const fetchTransactions = async () => {
    const res = await fetch(
      "http://localhost:8080/api/gifts/my-transactions?page=0&size=20",
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      }
    )
    const data = await res.json()
    setTransactions(data.content || [])
  }

  const handleUpdateProfile = async () => {
    const res = await fetch("http://localhost:8080/api/users/me", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ username: editUsername }),
    })
    const data = await res.json()
    if (res.ok) {
      setUser(data)
      saveUser(data)
      setEditing(false)
      setMessage("Profile updated!")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleProfilePicture = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(
      "http://localhost:8080/api/users/me/profile-picture",
      {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
        body: formData,
      }
    )

    if (res.ok) {
      const data = await res.json()
      setUser(data)
      saveUser(data)
      setMessage("Profile picture updated!")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  const handleStartStream = async (streamId: number) => {
    await fetch(`http://localhost:8080/api/streams/${streamId}/start`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    fetchMyStreams()
  }

  const handleEndStream = async (streamId: number) => {
    await fetch(`http://localhost:8080/api/streams/${streamId}/end`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    fetchMyStreams()
  }

  const handleDeleteStream = async (streamId: number) => {
    if (!confirm("Delete this stream?")) return
    await fetch(`http://localhost:8080/api/streams/${streamId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    fetchMyStreams()
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.loading}>Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        {message && <div style={styles.message}>{message}</div>}

        {/* Profile Header */}
        <div style={styles.profileCard}>
          <div style={styles.avatarSection}>
            <div style={styles.avatarWrapper}>
              {user?.profilePicture ? (
                <img
                  src={`http://localhost:8080${user.profilePicture}`}
                  style={styles.avatarImg}
                  alt="profile"
                />
              ) : (
                <div style={styles.avatarPlaceholder}>
                  {user?.username?.[0]?.toUpperCase()}
                </div>
              )}
              <label htmlFor="profilePic" style={styles.editAvatarBtn}>
                📷
              </label>
              <input
                id="profilePic"
                type="file"
                accept="image/*"
                onChange={handleProfilePicture}
                style={{ display: "none" }}
              />
            </div>

            <div style={styles.userInfo}>
              {editing ? (
                <div style={styles.editRow}>
                  <input
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    style={styles.editInput}
                  />
                  <button onClick={handleUpdateProfile} style={styles.saveBtn}>
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    style={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div style={styles.nameRow}>
                  <h1 style={styles.username}>@{user?.username}</h1>
                  <button
                    onClick={() => setEditing(true)}
                    style={styles.editBtn}
                  >
                    ✏️ Edit
                  </button>
                </div>
              )}
              <p style={styles.email}>{user?.email}</p>
              <div style={styles.badges}>
                <span style={styles.roleBadge}>{user?.role}</span>
                <span style={styles.coinBadge}>
                  🪙 {user?.coinBalance} coins
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {["streams", "transactions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={styles.tab(activeTab === tab)}
            >
              {tab === "streams" ? "🎥 My Streams" : "🎁 Gift History"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "streams" && (
          <div>
            <div style={styles.streamHeader}>
              <h2 style={styles.sectionTitle}>My Streams</h2>
              <button
                onClick={() => router.push("/streams/create")}
                style={styles.createBtn}
              >
                + Create Stream
              </button>
            </div>

            {streams.length === 0 ? (
              <div style={styles.empty}>
                <span style={{ fontSize: 48 }}>🎥</span>
                <p style={{ color: "#888", marginTop: 12 }}>No streams yet</p>
                <button
                  onClick={() => router.push("/streams/create")}
                  style={{ ...styles.createBtn, marginTop: 16 }}
                >
                  Create your first stream
                </button>
              </div>
            ) : (
              streams.map((stream) => (
                <div key={stream.streamId} style={styles.streamRow}>
                  <div style={styles.streamRowInfo}>
                    <h3 style={styles.streamRowTitle}>{stream.title}</h3>
                    <div style={styles.streamRowMeta}>
                      <span style={styles.statusBadge(stream.status)}>
                        {stream.status}
                      </span>
                      <span style={{ color: "#888", fontSize: 13 }}>
                        👁 {stream.viewerCount}
                      </span>
                      <span style={{ color: "#888", fontSize: 13 }}>
                        ❤️ {stream.likeCount}
                      </span>
                    </div>
                  </div>
                  <div style={styles.streamRowActions}>
                    {stream.status === "SCHEDULED" && (
                      <button
                        onClick={() => handleStartStream(stream.streamId)}
                        style={styles.startBtn}
                      >
                        ▶ Go Live
                      </button>
                    )}
                    {stream.status === "LIVE" && (
                      <button
                        onClick={() => handleEndStream(stream.streamId)}
                        style={styles.endBtn}
                      >
                        ⏹ End
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteStream(stream.streamId)}
                      style={styles.deleteBtn}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "transactions" && (
          <div>
            <h2 style={styles.sectionTitle}>Gift History</h2>
            {transactions.length === 0 ? (
              <div style={styles.empty}>
                <span style={{ fontSize: 48 }}>🎁</span>
                <p style={{ color: "#888", marginTop: 12 }}>
                  No gifts sent yet
                </p>
              </div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.transactionId} style={styles.txRow}>
                  <span style={{ fontSize: 24 }}>🎁</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600 }}>
                      Sent{" "}
                      <span style={{ color: "#a855f7" }}>{tx.giftName}</span> to
                      stream #{tx.streamId}
                    </p>
                    <p style={{ fontSize: 12, color: "#888" }}>
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                    -{tx.coinsSpent} 🪙
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

const styles: any = {
  container: { maxWidth: 800, margin: "0 auto", padding: "32px 16px" },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
    color: "#888",
  },
  message: {
    background: "#0a2a0a",
    border: "1px solid #4ade80",
    color: "#4ade80",
    padding: "10px 16px",
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 14,
  },
  profileCard: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  avatarSection: { display: "flex", gap: 20, alignItems: "center" },
  avatarWrapper: { position: "relative", flexShrink: 0 },
  avatarImg: { width: 80, height: 80, borderRadius: "50%", objectFit: "cover" },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #a855f7, #ec4899)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 700,
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    background: "#222",
    border: "1px solid #333",
    borderRadius: "50%",
    width: 26,
    height: 26,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: 12,
  },
  userInfo: { flex: 1 },
  nameRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 4 },
  username: { fontSize: 20, fontWeight: 700 },
  email: { color: "#888", fontSize: 13, marginBottom: 8 },
  badges: { display: "flex", gap: 8 },
  roleBadge: {
    padding: "3px 10px",
    background: "#a855f722",
    color: "#a855f7",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  coinBadge: {
    padding: "3px 10px",
    background: "#f59e0b22",
    color: "#f59e0b",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  editRow: { display: "flex", gap: 8, alignItems: "center" },
  editInput: {
    padding: "6px 12px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 8,
    color: "white",
    fontSize: 16,
    outline: "none",
  },
  editBtn: {
    background: "transparent",
    border: "1px solid #333",
    color: "#888",
    padding: "4px 10px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 12,
  },
  saveBtn: {
    padding: "6px 14px",
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
    border: "none",
    borderRadius: 6,
    color: "white",
    cursor: "pointer",
    fontSize: 13,
  },
  cancelBtn: {
    padding: "6px 14px",
    background: "transparent",
    border: "1px solid #333",
    borderRadius: 6,
    color: "#888",
    cursor: "pointer",
    fontSize: 13,
  },
  tabs: {
    display: "flex",
    gap: 8,
    marginBottom: 24,
    borderBottom: "1px solid #222",
    paddingBottom: 0,
  },
  tab: (active: boolean) => ({
    padding: "10px 20px",
    background: "transparent",
    border: "none",
    borderBottom: active ? "2px solid #a855f7" : "2px solid transparent",
    color: active ? "#a855f7" : "#888",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: active ? 600 : 400,
  }),
  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16 },
  streamHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  createBtn: {
    padding: "8px 16px",
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "48px 0",
  },
  streamRow: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streamRowInfo: { flex: 1 },
  streamRowTitle: { fontSize: 15, fontWeight: 600, marginBottom: 6 },
  streamRowMeta: { display: "flex", gap: 10, alignItems: "center" },
  statusBadge: (status: string) => ({
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    background:
      status === "LIVE"
        ? "#ef444422"
        : status === "SCHEDULED"
          ? "#f59e0b22"
          : "#33333322",
    color:
      status === "LIVE"
        ? "#ef4444"
        : status === "SCHEDULED"
          ? "#f59e0b"
          : "#888",
  }),
  streamRowActions: { display: "flex", gap: 8, alignItems: "center" },
  startBtn: {
    padding: "6px 14px",
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
    border: "none",
    borderRadius: 6,
    color: "white",
    cursor: "pointer",
    fontSize: 12,
  },
  endBtn: {
    padding: "6px 14px",
    background: "#ef444422",
    border: "1px solid #ef4444",
    borderRadius: 6,
    color: "#ef4444",
    cursor: "pointer",
    fontSize: 12,
  },
  deleteBtn: {
    background: "transparent",
    border: "1px solid #333",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
    padding: "6px 10px",
    color: "#888",
  },
  txRow: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 12,
    padding: "14px 16px",
    marginBottom: 10,
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
}
