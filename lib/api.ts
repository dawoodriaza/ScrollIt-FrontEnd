const BASE_URL = "http://localhost:8080"

export async function apiCall(
  endpoint: string,
  method: string = "GET",
  body?: any,
  token?: string
) {
  const headers: any = {
    "Content-Type": "application/json",
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const options: any = {
    method,
    headers,
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options)
  const data = await res.json()
  return { data, status: res.status, ok: res.ok }
}
