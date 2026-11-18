import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { ErrorBox, Field, Icon, Notice, PasswordInput } from '../components/ui'
import { initials } from '../utils'

// Gaya isian formulir (lavender, tanpa garis tepi) sesuai desain
const kolom = 'w-full rounded-2xl border-0 bg-brand-50 px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500'

// Label dengan ikon kecil di depannya
const Label = ({ ikon, children }) => (
  <span className="inline-flex items-center gap-1.5"><Icon name={ikon} className="!text-base text-slate-500" /> {children}</span>
)

// Kartu dengan kepala berikon dan isi di bawahnya
function Kartu({ ikon, judul, sub, kanan, children }) {
  return (
    <section className="overflow-hidden rounded-[28px] bg-white shadow-sm ring-1 ring-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-brand-50/50 px-6 py-5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Icon name={ikon} className="!text-xl" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{judul}</h2>
            <p className="text-xs text-slate-500">{sub}</p>
          </div>
        </div>
        {kanan}
      </div>
      <div className="space-y-5 p-6">{children}</div>
    </section>
  )
}

// Error yang bukan milik satu kolom (misalnya server sibuk)
const galatUmum = (e) => (e && !Object.keys(e.errors || {}).length ? e : null)

function FormProfil() {
  const { user, setUser } = useAuth()
  const [v, setV] = useState({ name: user.name, phone: user.phone || '', alamat: user.alamat || '' })
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k) => ({ value: v[k], onChange: (e) => { setOk(false); setV({ ...v, [k]: e.target.value }) } })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    setOk(false)
    try {
      const r = await api('me', { method: 'PUT', body: v }) // email sengaja tidak dikirim
      setUser(r) // navbar dan halaman lain ikut memakai data terbaru
      setOk(true)
    } catch (e2) {
      setErr(e2)
    }
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {ok && <Notice type="success">Perubahan profil berhasil disimpan.</Notice>}
      <ErrorBox error={galatUmum(err)} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={<Label ikon="badge">Nama Lengkap</Label>} name="name" error={err}>
          <input required className={`${kolom} h-12`} {...set('name')} />
        </Field>
        <Field label={<Label ikon="mail">Email (Hanya Baca)</Label>}>
          <input disabled readOnly value={user.email} className={`${kolom} h-12 cursor-not-allowed text-slate-500`} />
        </Field>
      </div>

      <Field
        label={<Label ikon="call">Nomor Telepon</Label>}
        name="phone"
        error={err}
        hint="Digunakan untuk konfirmasi jadwal kunjungan shelter lewat WhatsApp."
      >
        <input required type="tel" className={`${kolom} h-12`} {...set('phone')} />
      </Field>

      <Field label={<Label ikon="home_pin">Alamat Lengkap</Label>} name="alamat" error={err}>
        <textarea rows={3} className={`${kolom} py-3`} {...set('alamat')} />
      </Field>

      <button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 disabled:opacity-60">
        <Icon name="check" className="!text-xl" /> {busy ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  )
}

function FormSandi() {
  const kosong = { current_password: '', password: '', password_confirmation: '' }
  const [v, setV] = useState(kosong)
  const [err, setErr] = useState(null)
  const [ok, setOk] = useState(false)
  const [busy, setBusy] = useState(false)
  const set = (k) => ({ value: v[k], onChange: (e) => { setOk(false); setV({ ...v, [k]: e.target.value }) } })

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    setOk(false)
    try {
      await api('me/password', { method: 'PUT', body: v })
      setV(kosong) // kosongkan isian setelah berhasil
      setOk(true)
    } catch (e2) {
      setErr(e2)
    }
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {ok && <Notice type="success">Kata sandi berhasil diperbarui.</Notice>}
      <ErrorBox error={galatUmum(err)} />

      <Field label={<Label ikon="key">Kata Sandi Saat Ini</Label>} name="current_password" error={err}>
        <PasswordInput required className={`${kolom} h-12`} autoComplete="current-password" placeholder="Masukkan kata sandi saat ini" {...set('current_password')} />
      </Field>
      <Field label={<Label ikon="vpn_key">Kata Sandi Baru</Label>} name="password" error={err}>
        <PasswordInput required minLength={8} className={`${kolom} h-12`} autoComplete="new-password" placeholder="Masukkan kata sandi baru" {...set('password')} />
      </Field>
      <Field label={<Label ikon="password">Konfirmasi Kata Sandi Baru</Label>} name="password_confirmation" error={err}>
        <PasswordInput required className={`${kolom} h-12`} autoComplete="new-password" placeholder="Ulangi kata sandi baru" {...set('password_confirmation')} />
      </Field>

      <button disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 disabled:opacity-60">
        <Icon name="security" className="!text-xl" /> {busy ? 'Memproses...' : 'Perbarui Kata Sandi'}
      </button>
    </form>
  )
}

export default function ProfilSaya() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const keluar = async () => {
    await logout()
    navigate('/')
  }

  const bergabung = new Date(user.created_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 md:px-8">
      <header className="space-y-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
          <Icon name="verified_user" className="!text-base" /> Akun Calon Adopter
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profil Saya</h1>
        <p className="text-slate-600">Kelola informasi pribadi dan keamanan akun PetAdopt Anda.</p>
      </header>

      <Kartu
        ikon="manage_accounts"
        judul="Informasi Profil"
        sub="Data kontak aktif untuk koordinasi serah terima satwa"
        kanan={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-100 px-3 py-1 text-xs font-medium text-brand-700">
            <Icon name="badge" className="!text-sm" /> ID: ADOPT-{String(user.id).padStart(4, '0')}
          </span>
        }
      >
        <div className="flex items-center gap-4 rounded-2xl bg-brand-50 p-4">
          <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-200 text-xl font-bold text-brand-700">
            {initials(user.name)}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white ring-2 ring-white">
              <Icon name="pets" fill className="!text-sm" />
            </span>
          </span>
          <div>
            <div className="text-lg font-bold text-slate-900">{user.name}</div>
            <div className="text-sm text-slate-600">Calon Adopter • Bergabung {bergabung}</div>
          </div>
        </div>
        <FormProfil />
      </Kartu>

      <Kartu ikon="lock_reset" judul="Ubah Kata Sandi" sub="Pastikan sandi baru memiliki minimal 8 karakter">
        <FormSandi />
      </Kartu>

      <button onClick={keluar} className="inline-flex items-center gap-2 rounded-full bg-red-100 px-6 py-3 text-sm font-semibold text-red-700 hover:bg-red-200">
        <Icon name="logout" className="!text-xl" /> Keluar dari Akun
      </button>
    </div>
  )
}