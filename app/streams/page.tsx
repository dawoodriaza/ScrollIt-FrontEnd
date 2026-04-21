"use client"
import { useEffect, useState } from "react"
import Navbar from "@/components/Navbar"
import StreamCard from "@/components/StreamCard"
import { useSearchParams } from "next/navigation"
export default function StreamsPage() {
  const [liveStreams, setLiveStreams] = useState<any[]>([])
  const [scheduledStreams, setScheduledStreams] = useState<any[]>([])
  const [endedStreams, setEndedStreams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const search = searchParams.get("search") || ""
  useEffect(() => {
    fetchAllStreams()

    const interval = setInterval(fetchAllStreams, 5000)
    return () => clearInterval(interval)
  }, [search])

  const fetchAllStreams = async () => {
    setLoading(true)

    try {
      const [liveRes, scheduledRes, endedRes] = await Promise.all([
        // fetch("http://localhost:8080/api/streams?page=0&size=20"),
        fetch("http://localhost:8080/api/streams/live?page=0&size=20"),
        fetch("http://localhost:8080/api/streams/scheduled?page=0&size=20"),
        fetch("http://localhost:8080/api/streams/ended?page=0&size=20"),
      ])

      const liveData = await liveRes.json()
      const scheduledData = await scheduledRes.json()
      const endedData = await endedRes.json()

      setLiveStreams(liveData?.content ?? [])
      setScheduledStreams(scheduledData?.content ?? [])
      setEndedStreams(endedData?.content ?? [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getKey = (stream: any) => stream.streamId || stream.id

  return (
    <div>
      <Navbar />

      {/* live */}
      <div style={styles.container}>
        <h1 style={styles.heading}>🟢 Live Streams</h1>

        {loading ? (
          <p>Loading...</p>
        ) : liveStreams.length === 0 ? (
          <p>No live streams</p>
        ) : (
          <div style={styles.grid}>
            {liveStreams.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}
      </div>

      {/* scheduled */}
      <div style={styles.container}>
        <h1 style={styles.heading}>🟡 Scheduled Streams</h1>

        {loading ? (
          <p>Loading...</p>
        ) : scheduledStreams.length === 0 ? (
          <p>No scheduled streams</p>
        ) : (
          <div style={styles.grid}>
            {scheduledStreams.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
            ))}
          </div>
        )}
      </div>

      {/* ended */}
      <div style={styles.container}>
        <h1 style={styles.heading}>🔴 Ended Streams</h1>

        {loading ? (
          <p>Loading...</p>
        ) : endedStreams.length === 0 ? (
          <p>No ended streams</p>
        ) : (
          <div style={styles.grid}>
            {endedStreams.map((stream) => (
              <StreamCard key={stream.id} stream={stream} />
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
    padding: "24px",
  },
  heading: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 16,
  },
  grid: {
    columns: "4 300px",
    gap: 16,
  },
}
