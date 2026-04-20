import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })

    const data = await response.json()
    console.log("Response from backend:", data)
    return NextResponse.json(data, { status: response.status })
  } catch (error: any) {
    console.log("Error during login:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
