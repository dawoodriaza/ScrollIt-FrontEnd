"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { getToken, isLoggedIn } from "@/lib/auth"

export default function CreateStreamPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!isLoggedIn()) router.push("/login")
  }, [])

  const handleThumbnailChange = (e: any) => {
    const file = e.target.files[0]
    if (file) {
      setThumbnail(file)
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!title.trim()) {
      setError("Title is required")
      return
    }
    setLoading(true)
    setError("")

    try {
      const token = getToken()

    
      const res = await fetch("http://localhost:8080/api/streams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Failed to create stream")
        setLoading(false)
        return
      }

      const streamId = data.streamId


      if (thumbnail && streamId) {
        const formData = new FormData()
        formData.append("file", thumbnail)
        await fetch(`http://localhost:8080/api/streams/${streamId}/thumbnail`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
      }

      router.push(`/streams/${streamId}`)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Create Stream</h1>
          <p style={styles.subtitle}>Go live and connect with your audience</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Thumbnail */}
            <div style={styles.field}>
              <label style={styles.label}>Thumbnail (optional)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleThumbnailChange}
                style={{ display: "none" }}
                id="thumbnail"
              />
              <label htmlFor="thumbnail" style={styles.thumbLabel}>
                {preview ? (
                  <img src={preview} alt="preview" style={styles.preview} />
                ) : (
                  <div style={styles.thumbPlaceholder}>
                    <span style={{ fontSize: 36 }}>📷</span>
                    <p style={{ color: "#888", fontSize: 13, marginTop: 8 }}>
                      Click to upload thumbnail
                    </p>
                    <p style={{ color: "#555", fontSize: 11, marginTop: 4 }}>
                      JPEG, PNG, GIF, WEBP — max 10MB
                    </p>
                  </div>
                )}
              </label>
              {thumbnail && (
                <p style={{ color: "#4ade80", fontSize: 12, marginTop: 6 }}>
                  Selected: {thumbnail.name}
                </p>
              )}
            </div>

            {/* Title */}
            <div style={styles.field}>
              <label style={styles.label}>Stream Title *</label>
              <input
                placeholder="What are you streaming today?"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={styles.input}
                maxLength={100}
                required
              />
            </div>

            {/* Description */}
            <div style={styles.field}>
              <label style={styles.label}>Description (optional)</label>
              <textarea
                placeholder="Tell viewers what to expect..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={styles.textarea}
                rows={4}
                maxLength={500}
              />
              <p style={styles.charCount}>{description.length}/500</p>
            </div>

            {/* Buttons */}
            <div style={styles.btnRow}>
              <button
                type="button"
                onClick={() => router.back()}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button type="submit" style={styles.submitBtn} disabled={loading}>
                {loading ? "Creating..." : "Create Stream"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const styles: any = {
  container: { maxWidth: 580, margin: "0 auto", padding: "32px 16px" },
  card: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 16,
    padding: 32,
  },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 6 },
  subtitle: { color: "#888", fontSize: 14, marginBottom: 24 },
  error: {
    background: "#2a0a0a",
    border: "1px solid #f87171",
    color: "#f87171",
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },
  field: { marginBottom: 20 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#ccc",
    marginBottom: 8,
  },
  thumbLabel: {
    display: "block",
    width: "100%",
    border: "2px dashed #333",
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
    minHeight: 160,
  },
  thumbPlaceholder: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    background: "#1a1a1a",
    minHeight: 160,
    padding: 20,
  },
  preview: { width: "100%", aspectRatio: "16/9", objectFit: "cover" as const },
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
  textarea: {
    width: "100%",
    padding: "10px 14px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 8,
    color: "white",
    fontSize: 14,
    outline: "none",
    resize: "vertical" as const,
  },
  charCount: {
    color: "#555",
    fontSize: 11,
    textAlign: "right" as const,
    marginTop: 4,
  },
  btnRow: {
    display: "flex",
    gap: 12,
    justifyContent: "flex-end",
    marginTop: 8,
  },
  cancelBtn: {
    padding: "10px 24px",
    background: "transparent",
    border: "1px solid #333",
    borderRadius: 8,
    color: "#888",
    cursor: "pointer",
    fontSize: 14,
  },
  submitBtn: {
    padding: "10px 24px",
    background: "linear-gradient(90deg,#a855f7,#ec4899)",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
}
