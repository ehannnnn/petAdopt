import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth'
import { homeFor } from '../utils'

// Halaman yang hanya boleh dibuka oleh satu peran. Belum login diarahkan ke halaman masuk
// (asal halaman disimpan di state.from supaya bisa kembali setelah login).
export function RequireRole({ role, children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/masuk" state={{ from: location.pathname }} replace />
  if (user.role !== role) return <Navigate to={homeFor(user)} replace />
  return children
}

// Halaman untuk tamu (Masuk, Daftar). Yang sudah login diarahkan ke tujuannya, dengan aturan
// yang sama seperti setelah login supaya tidak ada dua tujuan yang berebut.
export function GuestOnly({ children }) {
  const { user } = useAuth()
  const { state } = useLocation()
  if (user) {
    const tujuan = state?.from && user.role === 'adopter' ? state.from : homeFor(user)
    return <Navigate to={tujuan} replace />
  }
  return children
}