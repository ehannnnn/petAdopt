import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from './api'

const AuthContext = createContext(null)

// Dipakai di komponen mana pun: const { user, login, logout } = useAuth()
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!getToken()) // true kalau ada token yang perlu dicek dulu

  useEffect(() => {
    // Saat halaman dibuka ulang, tanyakan ke Laravel siapa pemilik token tersimpan
    if (getToken()) {
      api('me')
        .then(setUser)
        .catch(() => setToken(null))
        .finally(() => setLoading(false))
    }
    // Dipicu api.js ketika Laravel menjawab 401
    const onLogout = () => setUser(null)
    window.addEventListener('petadopt:logout', onLogout)
    return () => window.removeEventListener('petadopt:logout', onLogout)
  }, [])

  // Simpan token dan data pengguna dari respons login/register
  const start = ({ token, user }) => {
    setToken(token)
    setUser(user)
    return user
  }

  const value = {
    user,
    loading,
    setUser,
    login: (body) => api('login', { method: 'POST', body }).then(start),
    register: (body) => api('register', { method: 'POST', body }).then(start),
    logout: async () => {
      try {
        await api('logout', { method: 'POST' })
      } finally {
        setToken(null)
        setUser(null)
      }
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}