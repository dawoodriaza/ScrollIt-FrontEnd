export const saveToken = (token: string) => {
  localStorage.setItem("token", token)
}

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export const saveUser = (user: any) => {
  localStorage.setItem("user", JSON.stringify(user))
}

export const getUser = (): any => {
  if (typeof window === "undefined") return null
  const user = localStorage.getItem("user")
  return user ? JSON.parse(user) : null
}

export const logout = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export const isLoggedIn = (): boolean => {
  return !!getToken()
}
