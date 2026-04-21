"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { getToken, getUser, isLoggedIn } from "@/lib/auth"

const BASE = "http://localhost:8080"

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState("stats")
  const [stats, setStats] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [streams, setStreams] = useState<any[]>([])
  const [gifts, setGifts] = useState<any[]>([])
  const [coinInputs, setCoinInputs] = useState<any>({})
  const [newGift, setNewGift] = useState({ giftName: "", coinValue: 0 })
  const [editGift, setEditGift] = useState<any>(null)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const user = getUser()
    if (!isLoggedIn() || user?.role !== "ADMIN") {
      router.push("/login")
      return
    }
    fetchStats()
  }, [])

  useEffect(() => {
    if (tab === "stats") fetchStats()
    if (tab === "users") fetchUsers()
    if (tab === "streams") fetchStreams()
    if (tab === "gifts") fetchGifts()
  }, [tab])

  const getHeaders = () => ({
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  })

  const showMsg = (msg: string) => {
    setMessage(msg)
    setError("")
    setTimeout(() => setMessage(""), 3000)
  }

  const showErr = (msg: string) => {
    setError(msg)
    setTimeout(() => setError(""), 4000)
  }

  const apiFetch = async (url: string, options: any = {}) => {
    try {
      const res = await fetch(`${BASE}${url}`, {
        ...options,
        headers: { ...getHeaders(), ...options.headers },
      })
      const data = await res.json()
      if (!res.ok) {
        showErr(data.message || `Error: ${res.status}`)
        return null
      }
      return data
    } catch (e) {
      showErr(
        "Cannot connect to backend. Make sure Spring Boot is running on port 8080."
      )
      return null
    }
  }

  const fetchStats = async () => {
    const data = await apiFetch("/api/admin/stats")
    if (data) setStats(data)
  }

  const fetchUsers = async () => {
    const data = await apiFetch("/api/admin/users?page=0&size=100")
    if (data) setUsers(data.content || [])
  }

  const fetchStreams = async () => {
    const data = await apiFetch("/api/admin/streams?page=0&size=100")
    if (data) setStreams(data.content || [])
  }

  const fetchGifts = async () => {
    const data = await apiFetch("/api/admin/gifts")
    if (data) setGifts(Array.isArray(data) ? data : [])
  }

  const addCoins = async (userId: number) => {
    const amount = coinInputs[userId]
    if (!amount || amount <= 0) {
      showErr("Enter a valid coin amount")
      return
    }
    const data = await apiFetch(
      `/api/admin/users/${userId}/coins?amount=${amount}`,
      { method: "POST" }
    )
    if (data) {
      showMsg(`Added ${amount} coins!`)
      fetchUsers()
    }
  }

  const softDelete = async (userId: number, username: string) => {
    if (!confirm(`Deactivate admin user @${username}?`)) return
    const data = await apiFetch(`/api/admin/users/${userId}/soft`, {
      method: "DELETE",
    })
    if (data) {
      showMsg(data.message)
      fetchUsers()
    }
  }

  const hardDelete = async (userId: number, username: string) => {
    if (!confirm(`PERMANENTLY delete @${username}? Cannot be undone.`)) return
    const data = await apiFetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    })
    if (data) {
      showMsg(data.message)
      fetchUsers()
    }
  }

  const forceEnd = async (streamId: number, title: string) => {
    if (!confirm(`Force end: "${title}"?`)) return
    const data = await apiFetch(`/api/admin/streams/${streamId}/force-end`, {
      method: "PUT",
    })
    if (data) {
      showMsg(data.message)
      fetchStreams()
    }
  }

  const forceDelete = async (streamId: number, title: string) => {
    if (!confirm(`Delete stream: "${title}"?`)) return
    const data = await apiFetch(`/api/admin/streams/${streamId}`, {
      method: "DELETE",
    })
    if (data) {
      showMsg(data.message)
      fetchStreams()
    }
  }

  const createGift = async () => {
    if (!newGift.giftName.trim() || newGift.coinValue <= 0) {
      showErr("Enter gift name and coin value greater than 0")
      return
    }
    const data = await apiFetch("/api/admin/gifts", {
      method: "POST",
      body: JSON.stringify(newGift),
    })
    if (data) {
      showMsg(`Gift "${data.giftName}" created!`)
      setNewGift({ giftName: "", coinValue: 0 })
      fetchGifts()
    }
  }

  const saveGift = async () => {
    if (!editGift) return
    const data = await apiFetch(`/api/admin/gifts/${editGift.giftId}`, {
      method: "PUT",
      body: JSON.stringify({
        giftName: editGift.giftName,
        coinValue: editGift.coinValue,
        active: editGift.active,
      }),
    })
    if (data) {
      showMsg("Gift updated!")
      setEditGift(null)
      fetchGifts()
    }
  }

  const deactivateGift = async (giftId: number, name: string) => {
    if (!confirm(`Deactivate gift "${name}"?`)) return
    const data = await apiFetch(`/api/admin/gifts/${giftId}`, {
      method: "DELETE",
    })
    if (data) {
      showMsg(data.message)
      fetchGifts()
    }
  }

  const getEmoji = (name: string) => {
    const map: any = {
      Rose: "🌹",
      Heart: "❤️",
      Crown: "👑",
      Rocket: "🚀",
      Diamond: "💎",
      Star: "⭐",
    }
    return map[name] || "🎁"
  }

  return (
    <div>
      <Navbar />

      {message && <div style={s.toast("#a855f7")}>{message}</div>}
      {error && <div style={s.toast("#ef4444")}>{error}</div>}

      <div style={s.page}>
        <h1 style={s.title}>Admin Dashboard</h1>

        <div style={s.tabs}>
          {["stats", "users", "streams", "gifts"].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={s.tab(tab === t)}>
              {t === "stats"
                ? "Stats"
                : t === "users"
                  ? "Users"
                  : t === "streams"
                    ? "Streams"
                    : "Gifts"}
            </button>
          ))}
        </div>

        {tab === "stats" && (
          <div>
            {!stats ? (
              <p style={{ color: "#888" }}>Loading stats...</p>
            ) : (
              <div style={s.grid3}>
                <div style={s.statCard}>
                  <div style={s.statNum}>{stats.totalUsers}</div>
                  <div style={s.statLbl}>Total Users</div>
                </div>
                <div style={s.statCard}>
                  <div style={s.statNum}>{stats.liveStreams}</div>
                  <div style={s.statLbl}>Live Now</div>
                </div>
                <div style={s.statCard}>
                  <div style={s.statNum}>{stats.totalStreams}</div>
                  <div style={s.statLbl}>Total Streams</div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "users" && (
          <div>
            <h2 style={s.sectionTitle}>All Users ({users.length})</h2>
            {users.length === 0 && (
              <p style={{ color: "#888" }}>Loading users...</p>
            )}
            {users.map((user) => (
              <div key={user.userId} style={s.row}>
                <div style={s.rowLeft}>
                  <span style={s.uname}>@{user.username}</span>
                  <span style={s.small}>{user.email}</span>
                  <span style={s.roleBadge(user.role)}>{user.role}</span>
                  <span style={s.coin}>🪙 {user.coinBalance}</span>
                  <span style={s.statusDot(user.userStatus)}>
                    {user.userStatus}
                  </span>
                </div>
                <div style={s.rowRight}>
                  <input
                    type="number"
                    placeholder="amount"
                    min="1"
                    value={coinInputs[user.userId] || ""}
                    onChange={(e) =>
                      setCoinInputs({
                        ...coinInputs,
                        [user.userId]: parseInt(e.target.value),
                      })
                    }
                    style={s.numInput}
                  />
                  <button
                    onClick={() => addCoins(user.userId)}
                    style={s.greenBtn}
                  >
                    + Coins
                  </button>
                  {user.role === "ADMIN" && user.userStatus === "ACTIVE" && (
                    <button
                      onClick={() => softDelete(user.userId, user.username)}
                      style={s.yellowBtn}
                    >
                      Deactivate
                    </button>
                  )}
                  {user.role === "USER" && (
                    <button
                      onClick={() => hardDelete(user.userId, user.username)}
                      style={s.redBtn}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "streams" && (
          <div>
            <h2 style={s.sectionTitle}>All Streams ({streams.length})</h2>
            {streams.length === 0 && (
              <p style={{ color: "#888" }}>Loading streams...</p>
            )}
            {streams.map((stream) => (
              <div key={stream.streamId} style={s.row}>
                <div style={s.rowLeft}>
                  {stream.thumbnailUrl && (
                    <img
                      src={`${BASE}${stream.thumbnailUrl}`}
                      style={s.thumb}
                      alt=""
                    />
                  )}
                  <span style={s.uname}>{stream.title}</span>
                  <span style={s.small}>@{stream.hostUsername}</span>
                  <span style={s.streamBadge(stream.status)}>
                    {stream.status}
                  </span>
                  <span style={s.small}>👁 {stream.viewerCount}</span>
                  <span style={s.small}>❤️ {stream.likeCount}</span>
                </div>
                <div style={s.rowRight}>
                  {stream.status === "LIVE" && (
                    <button
                      onClick={() => forceEnd(stream.streamId, stream.title)}
                      style={s.yellowBtn}
                    >
                      Force End
                    </button>
                  )}
                  <button
                    onClick={() => forceDelete(stream.streamId, stream.title)}
                    style={s.redBtn}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "gifts" && (
          <div>
            <h2 style={s.sectionTitle}>Manage Gifts</h2>

            <div style={s.formBox}>
              <p style={s.formTitle}>Create New Gift</p>
              <div style={s.formRow}>
                <input
                  placeholder="Gift name"
                  value={newGift.giftName}
                  onChange={(e) =>
                    setNewGift({ ...newGift, giftName: e.target.value })
                  }
                  style={s.input}
                />
                <input
                  type="number"
                  placeholder="Coin value"
                  min="1"
                  value={newGift.coinValue || ""}
                  onChange={(e) =>
                    setNewGift({
                      ...newGift,
                      coinValue: parseInt(e.target.value),
                    })
                  }
                  style={s.input}
                />
                <button onClick={createGift} style={s.purpleBtn}>
                  Create
                </button>
              </div>
            </div>

            {editGift && (
              <div style={s.editBox}>
                <p style={s.formTitle}>Editing: {editGift.giftName}</p>
                <div style={s.formRow}>
                  <input
                    value={editGift.giftName}
                    onChange={(e) =>
                      setEditGift({ ...editGift, giftName: e.target.value })
                    }
                    style={s.input}
                  />
                  <input
                    type="number"
                    min="1"
                    value={editGift.coinValue}
                    onChange={(e) =>
                      setEditGift({
                        ...editGift,
                        coinValue: parseInt(e.target.value),
                      })
                    }
                    style={s.input}
                  />
                  <select
                    value={editGift.active ? "true" : "false"}
                    onChange={(e) =>
                      setEditGift({
                        ...editGift,
                        active: e.target.value === "true",
                      })
                    }
                    style={s.select}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  <button onClick={saveGift} style={s.purpleBtn}>
                    Save
                  </button>
                  <button onClick={() => setEditGift(null)} style={s.grayBtn}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={s.giftGrid}>
              {gifts.map((gift) => (
                <div key={gift.giftId} style={s.giftCard(gift.active)}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>
                    {getEmoji(gift.giftName)}
                  </div>
                  <div
                    style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}
                  >
                    {gift.giftName}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#f59e0b",
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    🪙 {gift.coinValue}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "#888", marginBottom: 10 }}
                  >
                    {gift.active ? "Active" : "Inactive"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 6,
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => setEditGift(gift)}
                      style={s.purpleSmBtn}
                    >
                      Edit
                    </button>
                    {gift.active && (
                      <button
                        onClick={() =>
                          deactivateGift(gift.giftId, gift.giftName)
                        }
                        style={s.redSmBtn}
                      >
                        Off
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const s: any = {
  page: { maxWidth: 1100, margin: "0 auto", padding: "28px 16px" },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 24 },
  toast: (bg: string) => ({
    position: "fixed" as const,
    top: 70,
    left: "50%",
    transform: "translateX(-50%)",
    background: bg,
    color: "white",
    padding: "10px 28px",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
    zIndex: 999,
  }),
  tabs: {
    display: "flex",
    gap: 4,
    marginBottom: 28,
    borderBottom: "1px solid #222",
  },
  tab: (a: boolean) => ({
    padding: "10px 22px",
    background: "transparent",
    border: "none",
    borderBottom: a ? "2px solid #a855f7" : "2px solid transparent",
    color: a ? "#a855f7" : "#666",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: a ? 600 : 400,
    textTransform: "capitalize" as const,
  }),
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
    gap: 16,
  },
  statCard: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 14,
    padding: 28,
    textAlign: "center" as const,
  },
  statNum: { fontSize: 40, fontWeight: 800, color: "#a855f7", marginBottom: 8 },
  statLbl: { color: "#888", fontSize: 14 },
  sectionTitle: { fontSize: 17, fontWeight: 700, marginBottom: 14 },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#111",
    border: "1px solid #222",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 8,
    flexWrap: "wrap" as const,
    gap: 10,
  },
  rowLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap" as const,
  },
  rowRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap" as const,
  },
  thumb: {
    width: 48,
    height: 32,
    objectFit: "cover" as const,
    borderRadius: 4,
  },
  uname: { fontSize: 14, fontWeight: 600 },
  small: { fontSize: 12, color: "#888" },
  coin: { fontSize: 12, color: "#f59e0b", fontWeight: 600 },
  roleBadge: (r: string) => ({
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    background: r === "ADMIN" ? "#a855f722" : "#22222222",
    color: r === "ADMIN" ? "#a855f7" : "#888",
  }),
  statusDot: (st: string) => ({
    fontSize: 11,
    fontWeight: 600,
    color: st === "ACTIVE" ? "#4ade80" : "#ef4444",
  }),
  streamBadge: (st: string) => ({
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    background:
      st === "LIVE"
        ? "#ef444422"
        : st === "SCHEDULED"
          ? "#f59e0b22"
          : "#22222222",
    color: st === "LIVE" ? "#ef4444" : st === "SCHEDULED" ? "#f59e0b" : "#888",
  }),
  numInput: {
    width: 80,
    padding: "5px 8px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 6,
    color: "white",
    fontSize: 12,
    outline: "none",
  },
  greenBtn: {
    padding: "5px 12px",
    background: "#22c55e22",
    border: "1px solid #22c55e",
    borderRadius: 6,
    color: "#22c55e",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  yellowBtn: {
    padding: "5px 12px",
    background: "#f59e0b22",
    border: "1px solid #f59e0b",
    borderRadius: 6,
    color: "#f59e0b",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  redBtn: {
    padding: "5px 12px",
    background: "#ef444422",
    border: "1px solid #ef4444",
    borderRadius: 6,
    color: "#ef4444",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 600,
  },
  purpleBtn: {
    padding: "8px 18px",
    background: "linear-gradient(90deg,#a855f7,#ec4899)",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
  },
  grayBtn: {
    padding: "8px 14px",
    background: "transparent",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#888",
    cursor: "pointer",
    fontSize: 13,
  },
  formBox: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  editBox: {
    background: "#1a0a2e",
    border: "1px solid #a855f7",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  formTitle: { fontSize: 13, fontWeight: 600, color: "#ccc", marginBottom: 12 },
  formRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap" as const,
    alignItems: "center",
  },
  input: {
    flex: 1,
    minWidth: 140,
    padding: "8px 12px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 8,
    color: "white",
    fontSize: 13,
    outline: "none",
  },
  select: {
    padding: "8px 12px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 8,
    color: "white",
    fontSize: 13,
    outline: "none",
  },
  giftGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))",
    gap: 12,
    marginTop: 20,
  },
  giftCard: (active: boolean) => ({
    background: "#111",
    border: "1px solid #222",
    borderRadius: 12,
    padding: 16,
    textAlign: "center" as const,
    opacity: active ? 1 : 0.5,
  }),
  purpleSmBtn: {
    padding: "4px 10px",
    background: "#a855f722",
    border: "1px solid #a855f7",
    borderRadius: 6,
    color: "#a855f7",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
  },
  redSmBtn: {
    padding: "4px 10px",
    background: "#ef444422",
    border: "1px solid #ef4444",
    borderRadius: 6,
    color: "#ef4444",
    cursor: "pointer",
    fontSize: 11,
    fontWeight: 600,
  },
}
