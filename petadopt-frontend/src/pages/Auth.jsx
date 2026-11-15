import { useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api, fieldError } from '../api'
import { useAuth } from '../auth'
import { ErrorBox, Field, Icon, InputIcon, Notice, PasswordInput } from '../components/ui'
import { homeFor } from '../utils'

// Gambar ilustrasi dari export Stitch. Kalau gagal dimuat, diganti ikon cakar.
const ILUSTRASI = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUh3I_2lQjWVaWsDcQVL4U0n-R_Pa2QGlPlFlUqfNOOZ70I5gU2VilZom5-ph6p0S4YLaodQuPK9Lx0GcHsXb8xFQiAD4bY4Ek3gXEPTQJ2UVqp0Eup24-A-dSIyd0TbgdVVR8Qa-DX0WKeWMrK99qZUZW2Fr_XHOOmLwU0-MLuh5_scFPZAH932JaEt4oyjzpMQ8BrmTmaC-KIwNAi8CiZtRDcRr_u9Z4FmBpyk0'

function Ilustrasi({ src, alt }) {
  const [gagal, setGagal] = useState(false)
  return (
    <div className="relative h-64 w-64 overflow-hidden rounded-[24px] bg-white/10 shadow-2xl ring-4 ring-white/20 backdrop-blur-sm">
      {gagal ? (
        <div className="flex h-full w-full items-center justify-center text-white/80">
          <Icon name="pets" className="!text-7xl" fill />
        </div>
      ) : (
        <img src={src} alt={alt} referrerPolicy="no-referrer" onError={() => setGagal(true)} className="h-full w-full object-cover" />
      )}
    </div>
  )
}

function LogoAuth() {
  return (
    <Link to="/" className="group flex items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white shadow-md shadow-brand-500/20 transition-transform duration-200 group-hover:scale-105">
        <Icon name="pets" fill className="!text-2xl" />
      </span>
      <span className="text-2xl font-bold tracking-tight text-slate-900">
        Pet<span className="text-brand-600">Adopt</span>
      </span>
    </Link>
  )
}

// Rangka dasar semua halaman autentikasi: header, isi di tengah, footer
function Bingkai({ children }) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-[#F8F9FD] text-slate-800 antialiased">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
        <LogoAuth />
        <Link to="/katalog" className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-brand-600">
          Lanjut melihat katalog <Icon name="chevron_right" className="!text-xl" />
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-6">{children}</main>
      <footer className="py-6 text-center text-xs text-slate-400">© 2026 PetAdopt. Seluruh hak cipta dilindungi undang-undang.</footer>
    </div>
  )
}

// Kartu dua kolom: panel ungu di kiri, form di kanan (Masuk dan Daftar)
export function Shell({ badge, judul, teks, tag = 'Shelter & Hewan Terverifikasi', tagIkon = 'check_circle', children }) {
  return (
    <Bingkai>
      <div className="grid min-h-[600px] w-full max-w-5xl grid-cols-1 overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-xl shadow-brand-900/5 lg:grid-cols-12">
        {/* Panel kiri (disembunyikan di layar kecil supaya form langsung terlihat) */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 p-12 text-white lg:col-span-5 lg:flex">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-brand-900/30 blur-2xl" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white/95 backdrop-blur-md">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              {badge}
            </div>
            <h1 className="text-4xl font-extrabold leading-snug tracking-tight">{judul}</h1>
            <p className="text-sm leading-relaxed text-brand-100">{teks}</p>
          </div>

          <div className="relative z-10 my-8 flex items-center justify-center">
            <Ilustrasi src={ILUSTRASI} alt="Ilustrasi hewan peliharaan PetAdopt" />
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-2 text-xs text-brand-100">
            <span className="flex items-center gap-1.5">
              <Icon name={tagIkon} fill className="!text-base text-brand-300" /> {tag}
            </span>
            <span className="font-medium text-white">#AdopsiBukanBeli</span>
          </div>
        </div>

        {/* Kolom kanan: isi form */}
        <div className="flex flex-col justify-center bg-white p-8 sm:p-10 lg:col-span-7 lg:p-14">
          <div className="mx-auto w-full max-w-md space-y-7">{children}</div>
        </div>
      </div>
    </Bingkai>
  )
}

// Kartu tunggal di tengah (Lupa Kata Sandi dan Atur Ulang Kata Sandi)
function ShellKartu({ judul, teks, children }) {
  return (
    <Bingkai>
      <div className="w-full max-w-md space-y-7 rounded-[24px] border border-slate-100 bg-white p-8 shadow-xl shadow-brand-900/5 sm:p-10">
        <div className="space-y-3 text-center">
          <div className="flex justify-center"><LogoAuth /></div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{judul}</h1>
          <p className="text-sm leading-relaxed text-slate-500">{teks}</p>
        </div>
        {children}
      </div>
    </Bingkai>
  )
}

// Pengelola isian form: nilai, status mengirim, dan error dari server
export function useForm(initial) {
  const [v, setV] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const bind = (k) => ({ value: v[k], onChange: (e) => setV({ ...v, [k]: e.target.value }) })
  return { v, setV, busy, setBusy, error, setError, bind }
}

// Error yang bukan milik satu kolom (misalnya server sibuk), ditampilkan di bagian atas form
const galatUmum = (e) => (e && !Object.keys(e.errors || {}).length ? e : null)

// Isian berikon + label + pesan error untuk kolom bernama `name`
function Kolom({ label, name, icon, f, ...props }) {
  return (
    <Field label={label} name={name} error={f.error}>
      <InputIcon icon={icon}>
        <input required className="input-auth" {...props} {...f.bind(name)} />
      </InputIcon>
    </Field>
  )
}

function TombolUtama({ busy, disabled, teks, ikon }) {
  return (
    <button
      disabled={busy || disabled}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700 disabled:opacity-60"
    >
      {busy ? 'Memproses...' : <>{teks} <Icon name={ikon} className="!text-lg" /></>}
    </button>
  )
}

function KembaliMasuk() {
  return (
    <Link to="/masuk" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700">
      <Icon name="arrow_back" className="!text-lg" /> Kembali ke Masuk
    </Link>
  )
}

function LanjutKatalog() {
  return (
    <Link to="/katalog" className="inline-flex items-center gap-1 text-xs text-slate-400 transition-colors hover:text-brand-600">
      <Icon name="arrow_back" className="!text-sm" /> Lanjut melihat katalog
    </Link>
  )
}

export function Masuk() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation() // berisi asal halaman kalau pengguna dialihkan ke sini
  const f = useForm({ email: '', password: '' })

  const submit = async (e) => {
    e.preventDefault()
    f.setBusy(true)
    f.setError(null)
    try {
      const user = await login(f.v)
      navigate(state?.from && user.role === 'adopter' ? state.from : homeFor(user), { replace: true })
    } catch (err) {
      f.setError(err)
      f.setBusy(false)
    }
  }

  return (
    <Shell
      badge="Komunitas Adopsi Terpercaya"
      judul="Menghubungkan Hati, Menyediakan Rumah"
      teks="Masuk untuk melanjutkan proses adopsi, memantau pengajuan, dan membantu sahabat berbulu menemukan keluarga tercinta."
    >
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Masuk ke Akun</h2>
        <p className="text-sm text-slate-500">Silakan masukkan alamat email dan kata sandi Anda untuk masuk ke sistem PetAdopt.</p>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <ErrorBox error={galatUmum(f.error)} />

        <Kolom label="Email" name="email" icon="mail" type="email" autoComplete="email" placeholder="nama@email.com" f={f} />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Kata Sandi</label>
            <Link to="/lupa-sandi" className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline">Lupa kata sandi?</Link>
          </div>
          <PasswordInput variant="auth" id="password" required autoComplete="current-password" placeholder="Masukkan kata sandi Anda" {...f.bind('password')} />
          {fieldError(f.error, 'password') && <span className="block text-xs text-error">{fieldError(f.error, 'password')}</span>}
        </div>

        <TombolUtama busy={f.busy} teks="Masuk" ikon="arrow_forward" />
      </form>

      <div className="space-y-3 border-t border-slate-100 pt-5 text-center">
        <p className="text-sm text-slate-500">
          Belum punya akun? <Link to="/daftar" state={state} className="font-semibold text-brand-600 hover:text-brand-700">Daftar</Link>
        </p>
        <LanjutKatalog />
      </div>
    </Shell>
  )
}

// Teks panel kiri berubah mengikuti tab yang dipilih
const PANEL = {
  adopter: {
    badge: 'Komunitas Adopsi Terpercaya',
    judul: 'Mulai Kisah Baru Bersama Sahabat Setia',
    teks: 'Daftar untuk mengajukan adopsi, memantau proses verifikasi, atau mengelola shelter hewan peliharaan Anda.',
    tag: 'Shelter & Hewan Terverifikasi',
    tagIkon: 'verified',
  },
  admin_shelter: {
    badge: 'Mitra Shelter Resmi',
    judul: 'Buka Pintu Kebaikan untuk Sahabat Berbulu',
    teks: 'Daftarkan shelter Anda untuk menjangkau ribuan calon adopter terpercaya di seluruh Indonesia.',
    tag: 'Verifikasi Shelter Terpercaya',
    tagIkon: 'security',
  },
}

export function Daftar() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const { state } = useLocation()
  const [role, setRole] = useState('adopter')
  const f = useForm({
    name: '', email: '', phone: '', alamat: '', password: '', password_confirmation: '',
    shelter_nama: '', shelter_kota: '', shelter_alamat: '', shelter_deskripsi: '',
  })
  const shelter = role === 'admin_shelter'

  const pilihTab = (r) => {
    setRole(r)
    f.setError(null)
  }

  const submit = async (e) => {
    e.preventDefault()
    f.setBusy(true)
    f.setError(null)
    const v = f.v
    // Kirim hanya kolom yang relevan dengan peran yang dipilih
    const data = shelter
      ? { role, name: v.name, email: v.email, phone: v.phone, password: v.password, password_confirmation: v.password_confirmation,
          shelter_nama: v.shelter_nama, shelter_kota: v.shelter_kota, shelter_alamat: v.shelter_alamat, shelter_deskripsi: v.shelter_deskripsi }
      : { role, name: v.name, email: v.email, phone: v.phone, alamat: v.alamat, password: v.password, password_confirmation: v.password_confirmation }
    try {
      const user = await register(data)
      navigate(state?.from && user.role === 'adopter' ? state.from : homeFor(user), { replace: true })
    } catch (err) {
      f.setError(err)
      f.setBusy(false)
    }
  }

  return (
    <Shell {...PANEL[role]}>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">{shelter ? 'Daftar Akun Baru' : 'Buat Akun Baru'}</h2>
        <p className="text-sm text-slate-500">
          {shelter ? 'Lengkapi data shelter Anda untuk mulai mengelola adopsi.' : 'Silakan lengkapi data Anda untuk memulai proses adopsi di PetAdopt.'}
        </p>
      </div>

      <div className="flex rounded-full bg-brand-50 p-1">
        {[['adopter', 'Calon Adopter'], ['admin_shelter', 'Pengelola Shelter']].map(([r, label]) => (
          <button
            key={r}
            type="button"
            onClick={() => pilihTab(r)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${role === r ? 'bg-brand-600 text-white shadow' : 'text-slate-600 hover:text-brand-600'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {shelter && <Notice>Kelayakan shelter akan diperiksa sebelum Anda dapat mengunggah data hewan.</Notice>}

      <form onSubmit={submit} className="space-y-4">
        <ErrorBox error={galatUmum(f.error)} />

        <Kolom label={shelter ? 'Nama Pengelola' : 'Nama Lengkap'} name="name" icon="person" autoComplete="name"
          placeholder={shelter ? 'Nama lengkap pengelola' : 'Nama lengkap Anda'} f={f} />

        {shelter ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <Kolom label="Email" name="email" icon="mail" type="email" autoComplete="email" placeholder="email@shelter.id" f={f} />
              <Kolom label="Nomor Telepon / WhatsApp" name="phone" icon="call" type="tel" placeholder="08123456789" f={f} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Kolom label="Nama Shelter" name="shelter_nama" icon="home_work" placeholder="cth. Shelter Kasih Satwa" f={f} />
              <Kolom label="Kota" name="shelter_kota" icon="location_on" placeholder="Pilih atau tulis kota (cth. Bandung)" f={f} />
            </div>
            <Kolom label="Alamat Shelter" name="shelter_alamat" icon="map" placeholder="Alamat lengkap shelter" f={f} />
            <Field label="Deskripsi Singkat Shelter" name="shelter_deskripsi" error={f.error}>
              <textarea required rows={3} className="input-auth !rounded-2xl !pl-4" placeholder="Ceritakan visi, misi, atau fokus penampungan shelter Anda..." {...f.bind('shelter_deskripsi')} />
            </Field>
          </>
        ) : (
          <>
            <Kolom label="Email" name="email" icon="mail" type="email" autoComplete="email" placeholder="nama@email.com" f={f} />
            <Kolom label="Nomor Telepon / WhatsApp" name="phone" icon="call" type="tel" placeholder="08123456789" f={f} />
            <Kolom label="Alamat" name="alamat" icon="location_on" placeholder="Alamat tempat tinggal lengkap" f={f} />
          </>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kata Sandi" name="password" error={f.error}>
            <PasswordInput variant="auth" required minLength={8} autoComplete="new-password" placeholder="Min. 8 karakter" {...f.bind('password')} />
          </Field>
          <Field label={shelter ? 'Konfirmasi Kata Sandi' : 'Konfirmasi Sandi'} name="password_confirmation" error={f.error}>
            <PasswordInput variant="auth" icon={shelter ? 'lock_reset' : 'lock'} required autoComplete="new-password" placeholder="Ulangi kata sandi" {...f.bind('password_confirmation')} />
          </Field>
        </div>

        <TombolUtama busy={f.busy} teks="Daftar" ikon="arrow_forward" />
      </form>

      <div className="space-y-3 border-t border-slate-100 pt-5 text-center">
        <p className="text-sm text-slate-500">
          Sudah punya akun? <Link to="/masuk" state={state} className="font-semibold text-brand-600 hover:text-brand-700">Masuk</Link>
        </p>
        <LanjutKatalog />
      </div>
    </Shell>
  )
}

export function LupaSandi() {
  const f = useForm({ email: '' })
  const [terkirim, setTerkirim] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    f.setBusy(true)
    f.setError(null)
    setTerkirim(false)
    try {
      await api('forgot-password', { method: 'POST', body: f.v })
      setTerkirim(true)
    } catch (err) {
      f.setError(err)
    }
    f.setBusy(false)
  }

  return (
    <ShellKartu judul="Lupa Kata Sandi?" teks="Masukkan email akun Anda, kami akan mengirim tautan untuk mengatur ulang kata sandi.">
      <form onSubmit={submit} className="space-y-5">
        {terkirim && <Notice type="success">Tautan telah dikirim jika email terdaftar. Periksa kotak masuk atau spam Anda.</Notice>}
        <ErrorBox error={galatUmum(f.error)} />
        <Kolom label="Alamat Email" name="email" icon="mail" type="email" autoComplete="email" placeholder="nama@email.com" f={f} />
        <TombolUtama busy={f.busy} teks="Kirim Tautan" ikon="send" />
      </form>
      <KembaliMasuk />
    </ShellKartu>
  )
}

export function AturUlangSandi() {
  const [params] = useSearchParams() // tautan dari email: ?token=...&email=...
  const navigate = useNavigate()
  const token = params.get('token')
  const email = params.get('email')
  const f = useForm({ password: '', password_confirmation: '' })
  const [selesai, setSelesai] = useState(false)

  const tautanRusak = !token || !email
  const pesanTautan = fieldError(f.error, 'email') // dari Laravel: tautan tidak valid atau kedaluwarsa

  const submit = async (e) => {
    e.preventDefault()
    f.setBusy(true)
    f.setError(null)
    try {
      await api('reset-password', { method: 'POST', body: { ...f.v, token, email } })
      setSelesai(true)
      setTimeout(() => navigate('/masuk', { replace: true }), 1500)
    } catch (err) {
      f.setError(err)
      f.setBusy(false)
    }
  }

  return (
    <ShellKartu judul="Atur Ulang Kata Sandi" teks="Buat kata sandi baru yang kuat untuk melindungi akun PetAdopt Anda.">
      <form onSubmit={submit} className="space-y-5">
        {tautanRusak && <Notice type="error">Tautan tidak valid. Minta tautan baru lewat halaman Lupa Kata Sandi.</Notice>}
        {pesanTautan && <Notice type="error">{pesanTautan}</Notice>}
        {selesai && <Notice type="success">Kata sandi berhasil diperbarui. Mengalihkan ke halaman masuk...</Notice>}
        <ErrorBox error={galatUmum(f.error)} />

        <Field label="Kata Sandi Baru" name="password" error={f.error}>
          <PasswordInput variant="auth" required minLength={8} autoComplete="new-password" placeholder="Masukkan kata sandi baru" {...f.bind('password')} />
        </Field>
        <Field label="Konfirmasi Kata Sandi Baru" name="password_confirmation" error={f.error}>
          <PasswordInput variant="auth" icon="lock_reset" required autoComplete="new-password" placeholder="Ulangi kata sandi baru" {...f.bind('password_confirmation')} />
        </Field>
        <p className="flex items-center gap-1.5 text-xs text-slate-500">
          <Icon name="info" className="!text-base text-brand-600" /> Minimal 8 karakter
        </p>

        <TombolUtama busy={f.busy} disabled={selesai || tautanRusak} teks="Simpan Kata Sandi" ikon="check" />
      </form>
      <KembaliMasuk />
    </ShellKartu>
  )
}