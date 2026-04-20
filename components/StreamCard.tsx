/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
import Link from "next/link"

interface StreamCardProps {
  stream: {
    streamId: number
    title: string
    description: string
    viewerCount: number
    likeCount: number
    status: string
    thumbnailUrl?: string
    hostUsername: string
    startedAt: string
  }
}

export default function StreamCard({ stream }: StreamCardProps) {
  const isLive = stream.status === "LIVE"

  return (
    <Link href={`/streams/${stream.streamId}`} style={styles.card}>
      {/* Thumbnail */}
      <div style={styles.thumbnail}>
        {stream.thumbnailUrl ? (
          <img
            src={`http://localhost:8080${stream.thumbnailUrl}`}
            alt={stream.title}
            style={styles.image}
          />
        ) : (
          <div style={styles.placeholder}>
            <span style={{ fontSize: 40 }}>🎥</span>
          </div>
        )}

        {/* Live badge */}
        {isLive && (
          <div style={styles.liveBadge}>
            <span style={styles.liveDot} />
            LIVE
          </div>
        )}

        {/* Viewer count */}
        <div style={styles.viewers}>👁 {stream.viewerCount}</div>
      </div>

      {/* Info */}
      <div style={styles.info}>
        <p style={styles.host}>@{stream.hostUsername}</p>
        <h3 style={styles.title}>{stream.title}</h3>
        {stream.description && (
          <p style={styles.description}>{stream.description}</p>
        )}
        <div style={styles.stats}>
          <span>❤️ {stream.likeCount}</span>
          <span style={styles.statusBadge(stream.status)}>{stream.status}</span>
        </div>
      </div>
    </Link>
  )
}

const styles: any = {
  card: {
    display: "block",
    background: "#111",
    border: "1px solid #222",
    borderRadius: 12,
    overflow: "hidden",
    textDecoration: "none",
    color: "white",
    transition: "transform 0.2s, border-color 0.2s",
    cursor: "pointer",
    breakInside: "avoid",
    marginBottom: 16,
  },
  thumbnail: {
    position: "relative",
    width: "100%",
    aspectRatio: "16/9",
    background: "#1a1a1a",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1a0a2e, #0a0a1a)",
  },
  liveBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    background: "#ef4444",
    color: "white",
    padding: "3px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "white",
    animation: "pulse 1s infinite",
  },
  viewers: {
    position: "absolute",
    bottom: 8,
    right: 8,
    background: "rgba(0,0,0,0.7)",
    color: "white",
    padding: "3px 8px",
    borderRadius: 4,
    fontSize: 12,
  },
  info: {
    padding: "12px 14px",
  },
  host: {
    color: "#a855f7",
    fontSize: 12,
    fontWeight: 600,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 4,
    lineHeight: 1.4,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  description: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  stats: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: 12,
    color: "#888",
  },
  statusBadge: (status: string) => ({
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
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
}
