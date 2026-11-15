import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'
import { Avatar, Icon, Logo } from './ui'

const navCls = ({ isActive }) =>
  `rounded-full px-4 py-1.5 text-label-md transition ${isActive ? 'bg-secondary-container text-[#53389E]' : 'text-on-surface-variant hover:text-primary-container'}`

// Kerangka halaman publik: navbar di atas, isi halaman di tengah (<Outlet />), footer di bawah
export default function PublicLayout() {
  const { user, logout } = useAuth()
  const [menu, setMenu] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => setMenu(false), [pathname]) // tutup menu pengguna saat pindah halaman

  const keluar = async () => {
    await logout()
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-[#EAECF0] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 md:px-8">
          <Link to="/"><Logo /></Link>

          <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto md:order-none md:w-auto">
            <NavLink to="/" end className={navCls}>Beranda</NavLink>
            <NavLink to="/katalog" className={navCls}>Katalog</NavLink>
            {user?.role === 'adopter' && <NavLink to="/dashboard" className={navCls}>Dashboard Saya</NavLink>}
            {user?.role === 'admin_shelter' && <NavLink to="/shelter" className={navCls}>Dashboard Shelter</NavLink>}
          </nav>

          {!user ? (
            <div className="flex items-center gap-2">
              <Link to="/masuk" className="btn-ghost btn btn-sm">Masuk</Link>
              <Link to="/daftar" className="btn-primary btn btn-sm">Daftar</Link>
            </div>
          ) : (
            <div className="relative">
              <button onClick={() => setMenu((m) => !m)} className="flex items-center gap-2 rounded-full border border-[#EAECF0] py-1 pl-1 pr-3 hover:border-primary-container">
                <Avatar name={user.name} size="h-8 w-8" />
                <span className="hidden text-label-md sm:block">{user.name}</span>
                <Icon name="expand_more" className="!text-xl" />
              </button>
              {menu && (
                <div className="card absolute right-0 mt-2 w-52 overflow-hidden p-2">
                  {user.role === 'adopter' && (
                    <Link to="/profil" className="flex items-center gap-2 rounded-xl px-3 py-2 text-body-sm hover:bg-[#F9F5FF]">
                      <Icon name="account_circle" className="!text-xl" /> Profil Saya
                    </Link>
                  )}
                  <button onClick={keluar} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-body-sm text-error hover:bg-error-container/40">
                    <Icon name="logout" className="!text-xl" /> Keluar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="border-t border-[#EAECF0] bg-[#F9F5FF]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-6 text-body-sm text-on-surface-variant md:px-8">
          <Logo className="!text-body-md" />
          <Link to="/panduan" className="font-semibold text-primary-container hover:underline">Panduan Adopsi &amp; FAQ</Link>
          <span>© 2026 PetAdopt. Seluruh hak cipta dilindungi undang-undang.</span>
        </div>
      </footer>
    </div>
  )
}