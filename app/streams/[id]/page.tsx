"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { getToken, getUser, isLoggedIn } from "@/lib/auth"

export default function StreamDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [type, setType] = useState("all")
  const [stream, setStream] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [gifts, setGifts] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [guestName, setGuestName] = useState("")
  const [joined, setJoined] = useState(false)
  const [viewerId, setViewerId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [likeCount, setLikeCount] = useState(0)
  const [showGifts, setShowGifts] = useState(false)
  const [myBalance, setMyBalance] = useState(0)
  const [message, setMessage] = useState("")

  const loggedIn = isLoggedIn()
  const user = getUser()
  const token = getToken()

  useEffect(() => {
    fetchStream()
    fetchComments()
    fetchLikeCount()
    fetchGifts()
    if (loggedIn) fetchMyBalance()

    const interval = setInterval(() => {
      fetchStream()
      fetchLikeCount()
    }, 3000)
    return () => clearInterval(interval)
  }, [id])

  const fetchStream = async () => {
    try {
      const res = await fetch(`http://localhost:8080/api/streams/${id}`)
      const data = await res.json()
      setStream(data)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    const res = await fetch(
      `http://localhost:8080/api/streams/${id}/comments?page=0&size=50`
    )
    const data = await res.json()
    setComments(data.content || [])
  }

  const fetchLikeCount = async () => {
    const res = await fetch(
      `http://localhost:8080/api/streams/${id}/likes/count`
    )
    const count = await res.json()
    setLikeCount(count)
  }

  const fetchGifts = async () => {
    const res = await fetch(`http://localhost:8080/api/gifts`)
    const data = await res.json()
    setGifts(Array.isArray(data) ? data : [])
  }

  const fetchStreamTransactions = async () => {
    const res = await fetch(
      `http://localhost:8080/api/streams/${id}/gifts?page=0&size=20`
    )
    const data = await res.json()
    setTransactions(data.content || [])
  }

  const fetchMyBalance = async () => {
    const res = await fetch("http://localhost:8080/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    setMyBalance(data.coinBalance || 0)
  }

  const showMsg = (msg: string) => {
    setMessage(msg)
    setTimeout(() => setMessage(""), 3000)
  }

  const handleJoin = async () => {
    if (loggedIn) {
      const res = await fetch(`http://localhost:8080/api/streams/${id}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setJoined(true)
        showMsg("You joined the stream!")
      }
    } else {
      const name = guestName || "Guest"
      const res = await fetch(
        `http://localhost:8080/api/streams/${id}/join/guest?guestName=${name}`,
        { method: "POST" }
      )
      if (res.ok) {
        const data = await res.json()
        setViewerId(data.viewerId)
        setJoined(true)
        showMsg("Joined as " + name)
      }
    }
    fetchStream()
  }

  const handleLeave = async () => {
    if (loggedIn) {
      await fetch(`http://localhost:8080/api/streams/${id}/leave`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
    } else if (viewerId) {
      await fetch(
        `http://localhost:8080/api/streams/${id}/leave/guest?viewerId=${viewerId}`,
        { method: "POST" }
      )
    }
    setJoined(false)
    fetchStream()
  }

  const handleLike = async () => {
    if (!loggedIn) {
      router.push("/login")
      return
    }
    const res = await fetch(`http://localhost:8080/api/streams/${id}/likes`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await res.json()
    showMsg(data.message || "Liked!")
    fetchLikeCount()
  }

  const handleComment = async (e: any) => {
    e.preventDefault()
    if (!loggedIn) {
      router.push("/login")
      return
    }
    if (!newComment.trim()) return
    await fetch(`http://localhost:8080/api/streams/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: newComment }),
    })
    setNewComment("")
    fetchComments()
  }

  const handleDeleteComment = async (commentId: number) => {
    await fetch(
      `http://localhost:8080/api/streams/${id}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    fetchComments()
  }

  const handleSendGift = async (
    giftId: number,
    giftName: string,
    coinValue: number
  ) => {
    if (!loggedIn) {
      router.push("/login")
      return
    }
    if (myBalance < coinValue) {
      showMsg(
        "Not enough coins! You have " +
          myBalance +
          " coins but need " +
          coinValue
      )
      return
    }
    const res = await fetch(`http://localhost:8080/api/streams/${id}/gifts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ giftId }),
    })
    const data = await res.json()
    if (res.ok) {
      showMsg("Sent " + giftName + "! (-" + coinValue + " coins)")
      fetchMyBalance()
      fetchStreamTransactions()
    } else {
      showMsg(data.message || "Failed to send gift")
    }
  }

  if (loading)
    return (
      <div>
        <Navbar />
        <div style={styles.loading}>Loading stream...</div>
      </div>
    )
  if (!stream)
    return (
      <div>
        <Navbar />
        <div style={styles.loading}>Stream not found</div>
      </div>
    )

  return (
    <div>
      <Navbar />

      {message && <div style={styles.toast}>{message}</div>}

      <div style={styles.container}>
        <div style={styles.layout}>
          {/* LEFT — Player + Info */}
          <div style={styles.left}>
            {/* Player */}
            <div style={styles.player}>
              {stream.thumbnailUrl ? (
                <img
                  src={`http://localhost:8080${stream.thumbnailUrl}`}
                  alt={stream.title}
                  style={styles.playerImg}
                />
              ) : (
                <div style={styles.playerPlaceholder}>
                  <span style={{ fontSize: 64 }}>🎥</span>
                  {stream.status === "LIVE" && (
                    <p
                      style={{
                        color: "#ef4444",
                        marginTop: 12,
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      LIVE NOW
                    </p>
                  )}
                </div>
              )}
              {stream.status === "LIVE" && (
                <div style={styles.liveBadge}>LIVE</div>
              )}
            </div>

            {/* Stream Info */}
            <div style={styles.infoBox}>
              <div style={styles.infoTop}>
                <div>
                  <h1 style={styles.title}>{stream.title}</h1>
                  <p style={styles.host}>@{stream.hostUsername}</p>
                </div>
                <span style={styles.statusBadge(stream.status)}>
                  {stream.status}
                </span>
              </div>

              {stream.description && (
                <p style={styles.desc}>{stream.description}</p>
              )}

              {/* Stats Row */}
              <div style={styles.statsRow}>
                <span style={styles.stat}>👁 {stream.viewerCount} viewers</span>
                <span style={styles.stat}>❤️ {likeCount} likes</span>
                {loggedIn && (
                  <span style={styles.coinStat}>🪙 {myBalance} coins</span>
                )}
              </div>

              {/* Action Buttons */}
              <div style={styles.actions}>
                {stream.status === "LIVE" && (
                  <>
                    <button onClick={handleLike} style={styles.likeBtn}>
                      ❤️ Like
                    </button>

                    <button
                      onClick={() => {
                        setShowGifts(!showGifts)
                        fetchStreamTransactions()
                      }}
                      style={styles.giftBtn}
                    >
                      🎁 Send Gift
                    </button>

                    {!joined ? (
                      <div style={styles.joinRow}>
                        {!loggedIn && (
                          <input
                            placeholder="Your name"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            style={styles.guestInput}
                          />
                        )}
                        <button onClick={handleJoin} style={styles.joinBtn}>
                          Join Stream
                        </button>
                      </div>
                    ) : (
                      <button onClick={handleLeave} style={styles.leaveBtn}>
                        Leave
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Gift Panel */}
              {showGifts && (
                <div style={styles.giftPanel}>
                  <p style={styles.giftTitle}>
                    Choose a Gift
                    {loggedIn && (
                      <span style={styles.balance}>
                        {" "}
                        | Your balance: 🪙 {myBalance}
                      </span>
                    )}
                  </p>
                  <div style={styles.giftGrid}>
                    {gifts.map((gift) => (
                      <button
                        key={gift.giftId}
                        onClick={() =>
                          handleSendGift(
                            gift.giftId,
                            gift.giftName,
                            gift.coinValue
                          )
                        }
                        style={styles.giftCard(myBalance >= gift.coinValue)}
                        disabled={!loggedIn || myBalance < gift.coinValue}
                      >
                        <div style={styles.giftEmoji}>
                          {getGiftEmoji(gift.giftName)}
                        </div>
                        <div style={styles.giftName}>{gift.giftName}</div>
                        <div style={styles.giftCost}>🪙 {gift.coinValue}</div>
                      </button>
                    ))}
                  </div>

                  {!loggedIn && (
                    <p style={styles.loginNote}>
                      <a href="/login" style={{ color: "#a855f7" }}>
                        Login
                      </a>{" "}
                      to send gifts
                    </p>
                  )}

                  {/* Recent gifts on this stream */}
                  {transactions.length > 0 && (
                    <div style={styles.recentGifts}>
                      <p style={styles.recentTitle}>Recent Gifts</p>
                      {transactions.slice(0, 5).map((tx) => (
                        <div key={tx.transactionId} style={styles.txRow}>
                          <span>{getGiftEmoji(tx.giftName)}</span>
                          <span style={{ fontSize: 13 }}>
                            <b>{tx.senderUsername}</b> sent {tx.giftName}
                          </span>
                          <span style={{ color: "#f59e0b", fontSize: 12 }}>
                            🪙 {tx.coinsSpent}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Comments */}
          <div style={styles.right}>
            <h2 style={styles.commentsTitle}>💬 Live Chat</h2>

            {loggedIn ? (
              <form onSubmit={handleComment} style={styles.commentForm}>
                <input
                  placeholder="Say something..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={styles.commentInput}
                />
                <button type="submit" style={styles.commentBtn}>
                  Send
                </button>
              </form>
            ) : (
              <p style={styles.loginNote}>
                <a href="/login" style={{ color: "#a855f7" }}>
                  Login
                </a>{" "}
                to chat
              </p>
            )}

            <div style={styles.commentsList}>
              {comments.length === 0 ? (
                <p style={styles.noComments}>No messages yet</p>
              ) : (
                [...comments].reverse().map((comment) => (
                  <div key={comment.commentId} style={styles.comment}>
                    <div style={styles.commentAvatar}>
                      {comment.username?.[0]?.toUpperCase()}
                    </div>
                    <div style={styles.commentBody}>
                      <div style={styles.commentMeta}>
                        <span style={styles.commentUser}>
                          @{comment.username}
                        </span>
                        {user?.username === comment.username && (
                          <button
                            onClick={() =>
                              handleDeleteComment(comment.commentId)
                            }
                            style={styles.delBtn}
                          >
                            ×
                          </button>
                        )}
                      </div>
                      <p style={styles.commentText}>{comment.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getGiftEmoji(name: string): string {
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

const styles: any = {
  container: { maxWidth: 1300, margin: "0 auto", padding: "24px 16px" },
  layout: {
    display: "flex",
    gap: 24,
    alignItems: "flex-start",
    flexWrap: "wrap" as const,
  },
  left: { flex: 2, minWidth: 320 },
  right: {
    flex: 1,
    minWidth: 280,
    background: "#111",
    border: "1px solid #222",
    borderRadius: 16,
    padding: 20,
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column" as const,
  },

  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
    color: "#888",
  },

  toast: {
    position: "fixed" as const,
    top: 80,
    left: "50%",
    transform: "translateX(-50%)",
    background: "#a855f7",
    color: "white",
    padding: "10px 24px",
    borderRadius: 20,
    fontSize: 14,
    fontWeight: 600,
    zIndex: 999,
    whiteSpace: "nowrap" as const,
  },

  player: {
    position: "relative" as const,
    width: "100%",
    aspectRatio: "16/9",
    background: "#0a0a0a",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  playerImg: { width: "100%", height: "100%", objectFit: "cover" as const },
  playerPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg,#1a0a2e,#0a0a1a)",
  },
  liveBadge: {
    position: "absolute" as const,
    top: 12,
    left: 12,
    background: "#ef4444",
    color: "white",
    padding: "4px 10px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
  },

  infoBox: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 16,
    padding: 20,
  },
  infoTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  host: { color: "#a855f7", fontSize: 13 },
  statusBadge: (s: string) => ({
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    background:
      s === "LIVE"
        ? "#ef444422"
        : s === "SCHEDULED"
          ? "#f59e0b22"
          : "#33333322",
    color: s === "LIVE" ? "#ef4444" : s === "SCHEDULED" ? "#f59e0b" : "#888",
  }),
  desc: { color: "#888", fontSize: 14, marginBottom: 16 },
  statsRow: {
    display: "flex",
    gap: 16,
    marginBottom: 16,
    flexWrap: "wrap" as const,
  },
  stat: { color: "#888", fontSize: 14 },
  coinStat: { color: "#f59e0b", fontSize: 14, fontWeight: 600 },
  actions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap" as const,
    marginBottom: 16,
  },

  likeBtn: {
    padding: "8px 18px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontSize: 14,
  },
  giftBtn: {
    padding: "8px 18px",
    background: "linear-gradient(90deg,#f59e0b,#ef4444)",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
  joinRow: { display: "flex", gap: 8 },
  guestInput: {
    padding: "8px 12px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 8,
    color: "white",
    fontSize: 13,
    outline: "none",
  },
  joinBtn: {
    padding: "8px 18px",
    background: "linear-gradient(90deg,#a855f7,#ec4899)",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontSize: 14,
  },
  leaveBtn: {
    padding: "8px 18px",
    background: "#1a1a1a",
    border: "1px solid #ef4444",
    borderRadius: 8,
    color: "#ef4444",
    cursor: "pointer",
    fontSize: 14,
  },

  giftPanel: {
    background: "#0a0a0a",
    border: "1px solid #333",
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  giftTitle: { fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#ccc" },
  balance: { color: "#f59e0b" },
  giftGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(90px,1fr))",
    gap: 8,
    marginBottom: 12,
  },
  giftCard: (canAfford: boolean) => ({
    background: canAfford ? "#1a1a1a" : "#0f0f0f",
    border: `1px solid ${canAfford ? "#333" : "#222"}`,
    borderRadius: 10,
    padding: "10px 8px",
    cursor: canAfford ? "pointer" : "not-allowed",
    textAlign: "center" as const,
    opacity: canAfford ? 1 : 0.5,
    color: "white",
  }),
  giftEmoji: { fontSize: 24, marginBottom: 4 },
  giftName: { fontSize: 11, color: "#ccc", marginBottom: 2 },
  giftCost: { fontSize: 12, color: "#f59e0b", fontWeight: 600 },
  loginNote: { color: "#666", fontSize: 13, marginTop: 8 },

  recentGifts: { borderTop: "1px solid #222", paddingTop: 12, marginTop: 8 },
  recentTitle: { color: "#888", fontSize: 12, marginBottom: 8 },
  txRow: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: "4px 0",
    fontSize: 13,
    color: "#ccc",
  },

  commentsTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 12,
    flexShrink: 0,
  },
  commentForm: { display: "flex", gap: 8, marginBottom: 16, flexShrink: 0 },
  commentInput: {
    flex: 1,
    padding: "8px 12px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 8,
    color: "white",
    fontSize: 13,
    outline: "none",
  },
  commentBtn: {
    padding: "8px 14px",
    background: "linear-gradient(90deg,#a855f7,#ec4899)",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  },
  commentsList: {
    flex: 1,
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: 10,
  },
  noComments: {
    color: "#555",
    fontSize: 13,
    textAlign: "center" as const,
    padding: 20,
  },
  comment: { display: "flex", gap: 8 },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    flexShrink: 0,
    background: "linear-gradient(135deg,#a855f7,#ec4899)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 12,
  },
  commentBody: { flex: 1 },
  commentMeta: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  commentUser: { color: "#a855f7", fontSize: 12, fontWeight: 600 },
  commentText: {
    fontSize: 13,
    color: "#ddd",
    lineHeight: 1.4,
    wordBreak: "break-word" as const,
  },
  delBtn: {
    background: "transparent",
    border: "none",
    color: "#555",
    cursor: "pointer",
    fontSize: 16,
    lineHeight: 1,
  },
}
