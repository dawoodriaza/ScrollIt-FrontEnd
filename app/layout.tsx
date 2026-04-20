import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "LiveStream Platform",
  description: "Watch and stream live content",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "Inter, sans-serif",
          backgroundColor: "#0a0a0a",
          color: "white",
        }}
      >
        {children}
      </body>
    </html>
  )
}
