import { Link, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth'
import PublicLayout from './components/PublicLayout'
import { GuestOnly, RequireRole } from './components/RouteGuards'
import { Spinner } from './components/ui'
import { AturUlangSandi, Daftar, LupaSandi, Masuk } from './pages/Auth'
import { Beranda, KatalogPage } from './pages/Katalog'
import HewanDetail from './pages/HewanDetail'
import FormPengajuan from './pages/FormPengajuan'
import DashboardAdopter from './pages/DashboardAdopter'
import ProfilSaya from './pages/ProfilSaya'

// Halaman sementara, akan diganti di tahap berikutnya
function Sementara({ judul }) {
  const { user } = useAuth()
  return (
    <div className="mx-auto max-w-[1280px] p-8">
      <h1 className="text-headline-lg">{judul}</h1>
      {user ? (
        <p className="mt-2 text-body-md text-on-surface-variant">
          Berhasil masuk sebagai <b>{user.name}</b> ({user.role}).
        </p>
      ) : (
        <p className="mt-2 text-body-md text-on-surface-variant">
          Halaman ini menyusul di tahap berikutnya. <Link to="/masuk" className="font-semibold text-primary-container">Masuk</Link>
        </p>
      )}
    </div>
  )
}

export default function App() {
  const { loading } = useAuth()
  if (loading) return <Spinner /> // menunggu Laravel memeriksa token tersimpan

  return (
    <Routes>
      {/* Halaman autentikasi (layar penuh) */}
      <Route path="/masuk" element={<GuestOnly><Masuk /></GuestOnly>} />
      <Route path="/daftar" element={<GuestOnly><Daftar /></GuestOnly>} />
      <Route path="/lupa-sandi" element={<LupaSandi />} />
      <Route path="/atur-ulang-sandi" element={<AturUlangSandi />} />

      {/* Halaman dengan navbar dan footer */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Beranda />} />
        <Route path="/katalog" element={<KatalogPage />} />
        <Route path="/hewan/:id" element={<HewanDetail />} />
        <Route path="/hewan/:id/ajukan" element={<RequireRole role="adopter"><FormPengajuan /></RequireRole>} />
        <Route path="/dashboard" element={<RequireRole role="adopter"><DashboardAdopter /></RequireRole>} />
        <Route path="/profil" element={<RequireRole role="adopter"><ProfilSaya /></RequireRole>} />
        <Route path="/shelter" element={<RequireRole role="admin_shelter"><Sementara judul="Dashboard Shelter" /></RequireRole>} />
        <Route path="*" element={<Sementara judul="Halaman belum tersedia" />} />
      </Route>
    </Routes>
  )
}