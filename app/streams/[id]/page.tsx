"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { getToken, getUser, isLoggedIn } from "@/lib/auth"

export default function StreamDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [stream, setStream] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [gifts, setGifts] = useState<any[]>([])
  const [newComment, setNewComment] = useState("")
  const [guestName, setGuestName] = useState("")
  const [joined, setJoined] = useState(false)
  const [viewerId, setViewerId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [likeCount, setLikeCount] = useState(0)
  const loggedIn = isLoggedIn()
  const user = getUser()
  const token = getToken()

  useEffect(() => {
    fetchStream()
    fetchComments()
    fetchLikeCount()
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

  const handleJoin = async () => {
    if (loggedIn) {
      const res = await fetch(`http://localhost:8080/api/streams/${id}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setJoined(true)
    } else {
      const name = guestName || "Guest"
      const res = await fetch(
        `http://localhost:8080/api/streams/${id}/join/guest?guestName=${name}`,
        {
          method: "POST",
        }
      )
      if (res.ok) {
        const data = await res.json()
        setViewerId(data.viewerId)
        setJoined(true)
      }
    }
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
        {
          method: "POST",
        }
      )
    }
    setJoined(false)
  }

  const handleLike = async () => {
    if (!loggedIn) {
      router.push("/login")
      return
    }
    await fetch(`http://localhost:8080/api/streams/${id}/likes`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
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

  if (loading) {
    return (
      <div>
        <Navbar />
        <div style={styles.loading}>Loading stream...</div>
      </div>
    )
  }

  if (!stream) {
    return (
      <div>
        <Navbar />
        <div style={styles.loading}>Stream not found</div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.main}>
          {/* Stream Player Area */}
          <div style={styles.playerSection}>
            <div style={styles.player}>
              {stream.thumbnailUrl ? (
                <img
                  src={`http://localhost:8080${stream.thumbnailUrl}`}
                  alt={stream.title}
                  style={styles.thumbnail}
                />
              ) : (
                <div style={styles.playerPlaceholder}>
                  <span style={{ fontSize: 64 }}>🎥</span>
                  {stream.status === "LIVE" && (
                    <p
                      style={{
                        color: "#ef4444",
                        marginTop: 16,
                        fontWeight: 700,
                      }}
                    >
                      ● LIVE
                    </p>
                  )}
                </div>
              )}

              {/* Status overlay */}
              {stream.status === "LIVE" && (
                <div style={styles.liveOverlay}>● LIVE</div>
              )}
            </div>

            {/* Stream Info */}
            <div style={styles.streamInfo}>
              <div style={styles.streamMeta}>
                <div>
                  <h1 style={styles.streamTitle}>{stream.title}</h1>
                  <p style={styles.hostName}>@{stream.hostUsername}</p>
                </div>
                <span style={styles.statusBadge(stream.status)}>
                  {stream.status}
                </span>
              </div>

              {stream.description && (
                <p style={styles.description}>{stream.description}</p>
              )}

              {/* Stats & Actions */}
              <div style={styles.actions}>
                <div style={styles.stats}>
                  <span>👁 {stream.viewerCount} viewers</span>
                  <span>❤️ {likeCount} likes</span>
                </div>

                <div style={styles.buttons}>
                  <button onClick={handleLike} style={styles.likeBtn}>
                    ❤️ Like
                  </button>

                  {!joined ? (
                    <div style={styles.joinArea}>
                      {!loggedIn && (
                        <input
                          placeholder="Your name (optional)"
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
                      Leave Stream
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Comments Section */}
          <div style={styles.commentsSection}>
            <h2 style={styles.sectionTitle}>💬 Comments</h2>

            {loggedIn && (
              <form onSubmit={handleComment} style={styles.commentForm}>
                <input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={styles.commentInput}
                />
                <button type="submit" style={styles.commentBtn}>
                  Post
                </button>
              </form>
            )}

            {!loggedIn && (
              <p style={styles.loginPrompt}>
                <a href="/login" style={{ color: "#a855f7" }}>
                  Login
                </a>{" "}
                to comment
              </p>
            )}

            <div style={styles.commentsList}>
              {comments.length === 0 ? (
                <p style={styles.noComments}>No comments yet. Be the first!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.commentId} style={styles.comment}>
                    <div style={styles.commentAvatar}>
                      {comment.username?.[0]?.toUpperCase()}
                    </div>
                    <div style={styles.commentContent}>
                      <div style={styles.commentHeader}>
                        <span style={styles.commentUser}>
                          @{comment.username}
                        </span>
                        <span style={styles.commentTime}>
                          {new Date(comment.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p style={styles.commentText}>{comment.message}</p>
                    </div>
                    {user?.username === comment.username && (
                      <button
                        onClick={() => handleDeleteComment(comment.commentId)}
                        style={styles.deleteBtn}
                      >
                        🗑
                      </button>
                    )}
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

const styles: any = {
  container: { maxWidth: 900, margin: "0 auto", padding: "24px 16px" },
  main: { display: "flex", flexDirection: "column", gap: 24 },
  loading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 400,
    color: "#888",
  },
  playerSection: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 16,
    overflow: "hidden",
  },
  player: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    background: "#0a0a0a",
  },
  thumbnail: { width: "100%", height: "100%", objectFit: "cover" },
  playerPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a0a2e, #0a0a1a)",
  },
  liveOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
    background: "#ef4444",
    color: "white",
    padding: "4px 10px",
    borderRadius: 4,
    fontSize: 12,
    fontWeight: 700,
  },
  streamInfo: { padding: 20 },
  streamMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  streamTitle: { fontSize: 20, fontWeight: 700, marginBottom: 4 },
  hostName: { color: "#a855f7", fontSize: 13 },
  statusBadge: (status: string) => ({
    padding: "4px 12px",
    borderRadius: 20,
    fontSize: 12,
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
  description: { color: "#888", fontSize: 14, marginBottom: 16 },
  actions: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  stats: { display: "flex", gap: 16, color: "#888", fontSize: 14 },
  buttons: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  likeBtn: {
    padding: "8px 18px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontSize: 14,
  },
  joinArea: { display: "flex", gap: 8 },
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
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
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
  commentsSection: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 16,
    padding: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: 700, marginBottom: 16 },
  commentForm: { display: "flex", gap: 10, marginBottom: 20 },
  commentInput: {
    flex: 1,
    padding: "10px 14px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 8,
    color: "white",
    fontSize: 14,
    outline: "none",
  },
  commentBtn: {
    padding: "10px 20px",
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontWeight: 600,
  },
  loginPrompt: { color: "#888", fontSize: 14, marginBottom: 16 },
  commentsList: { display: "flex", flexDirection: "column", gap: 12 },
  noComments: { color: "#555", fontSize: 14, textAlign: "center", padding: 20 },
  comment: { display: "flex", gap: 10, alignItems: "flex-start" },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    flexShrink: 0,
    background: "linear-gradient(135deg, #a855f7, #ec4899)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 13,
  },
  commentContent: { flex: 1 },
  commentHeader: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    marginBottom: 2,
  },
  commentUser: { color: "#a855f7", fontSize: 13, fontWeight: 600 },
  commentTime: { color: "#555", fontSize: 11 },
  commentText: { fontSize: 14, color: "#ddd", lineHeight: 1.5 },
  deleteBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 14,
    color: "#555",
  },
}
