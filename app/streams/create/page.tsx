/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/Navbar"
import { getToken, isLoggedIn } from "@/lib/auth"

export default function CreateStreamPage() {
  const router = useRouter()
  const [form, setForm] = useState({ title: "", description: "" })
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
    setLoading(true)
    setError("")

    try {
      const token = getToken()

      // Step 1: Create stream with JSON
      const res = await fetch("http://localhost:8080/api/streams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Failed to create stream")
        return
      }

      const streamId = data.streamId

      // Step 2: Upload thumbnail if selected
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
    } catch (err) {
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
          <h1 style={styles.title}>🎥 Create a Stream</h1>
          <p style={styles.subtitle}>Set up your live stream</p>

          {error && <div style={styles.error}>{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Thumbnail Upload */}
            <div style={styles.thumbnailUpload}>
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                style={{ display: "none" }}
                id="thumbnail"
              />
              <label htmlFor="thumbnail" style={styles.thumbnailLabel}>
                {preview ? (
                  <img
                    src={preview}
                    alt="preview"
                    style={styles.previewImage}
                  />
                ) : (
                  <div style={styles.uploadPlaceholder}>
                    <span style={{ fontSize: 32 }}>📷</span>
                    <p style={{ marginTop: 8, color: "#888", fontSize: 13 }}>
                      Click to upload thumbnail
                    </p>
                  </div>
                )}
              </label>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Stream Title *</label>
              <input
                placeholder="What's your stream about?"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                style={styles.input}
                required
                maxLength={100}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Description</label>
              <textarea
                placeholder="Tell viewers what to expect..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                style={styles.textarea}
                rows={4}
                maxLength={500}
              />
            </div>

            <div style={styles.buttonRow}>
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
  container: {
    maxWidth: 600,
    margin: "0 auto",
    padding: "32px 16px",
  },
  card: {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 16,
    padding: 32,
  },
  title: { fontSize: 22, fontWeight: 700, marginBottom: 8 },
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
  thumbnailUpload: { marginBottom: 24 },
  thumbnailLabel: {
    display: "block",
    width: "100%",
    aspectRatio: "16/9",
    border: "2px dashed #333",
    borderRadius: 12,
    overflow: "hidden",
    cursor: "pointer",
  },
  uploadPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#1a1a1a",
    minHeight: 160,
  },
  previewImage: { width: "100%", height: "100%", objectFit: "cover" },
  field: { marginBottom: 20 },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 500,
    color: "#ccc",
    marginBottom: 8,
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
  textarea: {
    width: "100%",
    padding: "10px 14px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: 8,
    color: "white",
    fontSize: 14,
    outline: "none",
    resize: "vertical",
  },
  buttonRow: {
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
    background: "linear-gradient(90deg, #a855f7, #ec4899)",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
  },
}
