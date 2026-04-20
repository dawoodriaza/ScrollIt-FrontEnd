"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Navbar from "@/components/Navbar"
import StreamCard from "@/components/StreamCard"

export default function StreamsPage() {
  const [streams, setStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const search = searchParams.get("search") || ""

  useEffect(() => {
    fetchStreams()
  }, [search])

  const fetchStreams = async () => {
    setLoading(true)
    try {
      const url = search
        ? `http://localhost:8080/api/streams/search?keyword=${search}&page=0&size=20`
        : `http://localhost:8080/api/streams?page=0&size=20`

      const res = await fetch(url)
      const data = await res.json()
      setStreams(data.content || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.heading}>
            {search ? `Results for "${search}"` : "🔴 Live Streams"}
          </h1>
          <p style={styles.subheading}>
            {search ? "" : "Watch what's happening right now"}
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={styles.loading}>
            <div style={styles.spinner} />
            <p style={{ color: "#888", marginTop: 16 }}>Loading streams...</p>
          </div>
        ) : streams.length === 0 ? (
          <div style={styles.empty}>
            <span style={{ fontSize: 48 }}>🎥</span>
            <p style={{ color: "#888", marginTop: 16 }}>
              {search ? "No streams found" : "No live streams right now"}
            </p>
          </div>
        ) : (
          <div style={styles.grid}>
            {streams.map((stream) => (
              <StreamCard key={stream.streamId} stream={stream} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles: any = {
  container: {
    maxWidth: 1400,
    margin: "0 auto",
    padding: "32px 24px",
  },
  header: {
    marginBottom: 32,
  },
  heading: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 8,
  },
  subheading: {
    color: "#888",
    fontSize: 15,
  },
  grid: {
    columns: "4 300px",
    gap: 16,
  },
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  spinner: {
    width: 40,
    height: 40,
    border: "3px solid #333",
    borderTop: "3px solid #a855f7",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
    color: "#888",
  },
}
