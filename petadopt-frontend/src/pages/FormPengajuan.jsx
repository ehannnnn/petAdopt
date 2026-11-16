import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { PetPhoto } from '../components/PetCard'
import { ErrorBox, Field, Icon, Modal, Notice, Spinner } from '../components/ui'
import { useApi } from '../hooks'
import { formatUmur } from '../utils'

// Gaya isian formulir (lavender, tanpa garis tepi) sesuai desain
const kolom = 'w-full rounded-2xl border-0 bg-brand-50 px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500'
const MIN_ALASAN = 50 // BR: alasan minimal 50 karakter

function Judul({ ikon, children }) {
  return (
    <h2 className="flex items-center gap-3 text-lg font-bold text-slate-900">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600"><Icon name={ikon} className="!text-xl" /></span>
      {children}
    </h2>
  )
}

export default function FormPengajuan() {
  const { id } = useParams()
  const { user } = useAuth() // pasti ada, karena halaman ini dibungkus RequireRole
  const navigate = useNavigate()
  const { data, loading, error } = useApi(`hewan/${id}`)

  // Isian awal diambil dari profil, boleh diubah untuk pengajuan ini
  const [v, setV] = useState({ nama_lengkap: user.name, telepon: user.phone || '', alamat: user.alamat || '', alasan: '', komitmen: false })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState(null)
  const [tiket, setTiket] = useState(null) // terisi setelah pengajuan berhasil

  if (loading) return <Spinner />
  if (error?.status === 404) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Hewan tidak ditemukan</h1>
        <Link to="/katalog" className="mt-6 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Kembali ke Katalog</Link>
      </div>
    )
  }
  if (error) return <div className="mx-auto max-w-3xl p-8"><ErrorBox error={error} /></div>

  const h = data.data
  const bisaAjukan = h.status === 'Tersedia'
  const panjang = v.alasan.trim().length
  const siap = bisaAjukan && v.komitmen && panjang >= MIN_ALASAN
  const set = (k) => ({ value: v[k], onChange: (e) => setV({ ...v, [k]: e.target.value }) })
  const galatUmum = err && !Object.keys(err.errors).length ? err : null // misalnya "hewan tidak tersedia"

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    try {
      const r = await api('pengajuan', { method: 'POST', body: { ...v, hewan_id: h.id } })
      setTiket(r.data)
    } catch (e2) {
      setErr(e2)
    }
    setBusy(false)
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="flex items-center gap-1 hover:text-brand-700"><Icon name="home" className="!text-base" /> Beranda</Link>
        <Icon name="chevron_right" className="!text-base" />
        <Link to="/katalog" className="hover:text-brand-700">Katalog</Link>
        <Icon name="chevron_right" className="!text-base" />
        <Link to={`/hewan/${h.id}`} className="hover:text-brand-700">{h.nama}</Link>
        <Icon name="chevron_right" className="!text-base" />
        <span className="font-semibold text-brand-700">Ajukan Adopsi</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-slate-900">Formulir Pengajuan Adopsi</h1>
      <p className="mt-2 max-w-xl text-slate-600">Satu langkah lagi menuju momen kebersamaan dengan {h.nama}. Lengkapi formulir di bawah ini dengan sungguh-sungguh untuk ditinjau oleh pihak shelter pengasuh.</p>

      {!bisaAjukan && (
        <div className="mt-6">
          <Notice type="error">
            {h.nama} sedang tidak tersedia untuk diadopsi (status: {h.status}). <Link to="/katalog" className="font-semibold underline">Lihat hewan lain</Link>
          </Notice>
        </div>
      )}

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <form onSubmit={submit} className="space-y-6 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-100 md:p-8">
          <ErrorBox error={galatUmum} />

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Judul ikon="person">Data Diri</Judul>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs text-brand-700">
                <Icon name="verified_user" className="!text-sm" /> Terisi otomatis dari profil, dapat diubah jika perlu
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nama Lengkap" name="nama_lengkap" error={err} required>
                <input required className={`${kolom} h-12`} placeholder="Nama lengkap Anda" {...set('nama_lengkap')} />
              </Field>
              <Field label="Nomor Telepon / WhatsApp" name="telepon" error={err} required>
                <input required type="tel" className={`${kolom} h-12`} placeholder="Contoh: 081234567890" {...set('telepon')} />
              </Field>
            </div>
            <Field label="Alamat Lengkap" name="alamat" error={err} required>
              <textarea required rows={3} className={`${kolom} py-3`} placeholder="Alamat tempat tinggal saat ini" {...set('alamat')} />
            </Field>
          </section>

          <hr className="border-slate-100" />

          <section className="space-y-4">
            <Judul ikon="favorite">Alasan Mengadopsi</Judul>
            <Field label={`Mengapa Anda ingin mengadopsi ${h.nama}?`} name="alasan" error={err} required>
              <textarea
                required
                rows={6}
                maxLength={2000}
                className={`${kolom} py-3`}
                placeholder={`Ceritakan motivasi Anda mengadopsi ${h.nama}, pengalaman merawat hewan, atau rencana tempat tinggalnya...`}
                {...set('alasan')}
              />
            </Field>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500"><Icon name="info" className="!text-base" /> Minimal {MIN_ALASAN} karakter agar shelter mengenal niat baik Anda</span>
              <span className={panjang >= MIN_ALASAN ? 'font-semibold text-emerald-600' : 'text-slate-500'}>
                {panjang} / {MIN_ALASAN} karakter (min. {MIN_ALASAN} karakter)
              </span>
            </div>
          </section>

          <hr className="border-slate-100" />

          <div>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-brand-50 p-4">
              <input
                type="checkbox"
                className="mt-0.5 h-5 w-5 rounded accent-brand-600"
                checked={v.komitmen}
                onChange={(e) => setV({ ...v, komitmen: e.target.checked })}
              />
              <span className="text-sm text-slate-800">
                Saya berkomitmen merawat {h.nama} seumur hidupnya, termasuk kesehatan, makanan, dan tempat tinggal yang layak.
              </span>
            </label>
            {err?.errors?.komitmen && <p className="mt-1 text-xs text-error">Anda harus menyetujui pernyataan komitmen.</p>}
          </div>

          <div className="flex justify-end gap-3">
            <Link to={`/hewan/${h.id}`} className="rounded-full bg-brand-50 px-8 py-3 text-sm font-semibold text-slate-700 hover:bg-brand-100">Batal</Link>
            <button
              disabled={busy || !siap}
              className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? 'Mengirim...' : <>Kirim Pengajuan <Icon name="arrow_forward" className="!text-xl" /></>}
            </button>
          </div>
        </form>

        {/* Ringkasan hewan */}
        <aside className="space-y-4 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Ringkasan Hewan</h2>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${bisaAjukan ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" /> {h.status}
            </span>
          </div>
          <div className="relative">
            <PetPhoto src={h.foto[0]?.url} alt={`Foto ${h.nama}`} className="aspect-[4/3] w-full rounded-2xl" />
            <span className="absolute bottom-3 left-3 inline-flex max-w-[90%] items-center gap-1.5 rounded-full bg-slate-800/90 px-3 py-1 text-xs font-medium text-white">
              <Icon name="verified" className="!text-sm text-brand-300" /> <span className="truncate">{h.kondisi_kesehatan}</span>
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-2xl font-bold text-slate-900">{h.nama}</h3>
            <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">{h.ras || h.jenis}</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-700">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5"><Icon name="pets" className="!text-base text-brand-600" /> {h.jenis}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5"><Icon name="calendar_today" className="!text-base text-brand-600" /> {formatUmur(h.umur_bulan)}</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5"><Icon name={h.jenis_kelamin === 'Betina' ? 'female' : 'male'} className="!text-base text-brand-600" /> {h.jenis_kelamin}</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-600"><Icon name="location_on" className="!text-xl" /></span>
            <div>
              <div className="text-[11px] text-slate-500">Shelter Asal</div>
              <div className="text-sm font-bold text-slate-900">{h.shelter.nama}</div>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-2xl bg-brand-50 p-3 text-xs text-slate-700">
            <Icon name="info" className="!text-lg text-brand-600" />
            <span><b>Catatan:</b> Pengajuan dapat dibatalkan selama berstatus Diajukan melalui menu Dashboard Saya.</span>
          </div>
        </aside>
      </div>

      {/* Konfirmasi setelah pengajuan berhasil */}
      <Modal open={!!tiket} onClose={() => navigate('/dashboard')}>
        <div className="space-y-4 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <Icon name="check_circle" fill className="!text-4xl" />
          </span>
          <h2 className="text-2xl font-bold text-slate-900">Pengajuan Terkirim!</h2>
          <p className="text-sm text-slate-600">
            Terima kasih, {user.name.split(' ')[0]}! Formulir adopsi untuk <b className="text-slate-900">{h.nama}</b> berhasil diajukan ke {h.shelter.nama}.
          </p>
          <div className="space-y-2 rounded-2xl bg-brand-50 p-4 text-sm text-slate-700">
            <div className="flex items-center justify-between"><span>Nomor Tiket:</span><b className="text-slate-900">#{tiket?.kode}</b></div>
            <div className="flex items-center justify-between">
              <span>Status Saat Ini:</span>
              <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">{tiket?.status}</span>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} className="w-full rounded-full bg-brand-600 py-3 text-sm font-semibold text-white hover:bg-brand-700">
            Lihat di Dashboard Saya
          </button>
        </div>
      </Modal>
    </div>
  )
}