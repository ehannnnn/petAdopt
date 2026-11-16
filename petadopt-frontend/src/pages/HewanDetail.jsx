import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { PetPhoto } from '../components/PetCard'
import { ErrorBox, Icon, Spinner } from '../components/ui'
import { useApi } from '../hooks'
import { formatTanggal, formatUmur, waLink } from '../utils'

const STATUS = {
  Tersedia: { pill: 'bg-brand-100 text-brand-700', titik: 'bg-brand-600' },
  'Dalam Proses': { pill: 'bg-amber-100 text-amber-700', titik: 'bg-amber-500' },
  Teradopsi: { pill: 'bg-emerald-100 text-emerald-700', titik: 'bg-emerald-500' },
}

const CATATAN = {
  'Dalam Proses': 'Hewan ini sedang dalam proses adopsi dan belum dapat diajukan.',
  Teradopsi: 'Hewan ini sudah menemukan rumah barunya dan tidak dapat diajukan lagi.',
}

// Satu kotak informasi (jenis, umur, dan seterusnya)
function Info({ ikon, label, nilai }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-brand-50 p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
        <Icon name={ikon} className="!text-xl" />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] text-slate-500">{label}</div>
        <div className="truncate text-sm font-bold text-slate-900">{nilai}</div>
      </div>
    </div>
  )
}

function Judul({ children }) {
  return (
    <h2 className="flex items-center gap-2.5 text-xl font-bold text-slate-900">
      <span className="h-6 w-1.5 rounded-full bg-brand-600" /> {children}
    </h2>
  )
}

export default function HewanDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { data, loading, error, reload, setData } = useApi(`hewan/${id}`)
  const [foto, setFoto] = useState(0)

  useEffect(() => setFoto(0), [id]) // pindah ke hewan lain: mulai dari foto pertama

  if (loading && !data) return <Spinner />

  if (error?.status === 404) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-brand-600">
          <Icon name="search_off" className="!text-4xl" />
        </span>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Hewan tidak ditemukan</h1>
        <p className="mt-2 text-slate-600">Data hewan ini mungkin sudah dihapus oleh shelter.</p>
        <Link to="/katalog" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">
          Kembali ke Katalog
        </Link>
      </div>
    )
  }
  if (error) return <div className="mx-auto max-w-3xl p-8"><ErrorBox error={error} onRetry={reload} /></div>

  const h = data.data
  const st = STATUS[h.status]
  const shelter = user?.role === 'admin_shelter'
  const bisaAjukan = h.status === 'Tersedia'
  const tujuanAjukan = `/hewan/${h.id}/ajukan`
  const ringkas = h.deskripsi.split(/\n|\. /)[0] // kalimat pertama sebagai ringkasan di bawah nama

  const favorit = async () => {
    if (!user) return navigate('/masuk', { state: { from: location.pathname } })
    const aktif = !h.is_favorit
    setData({ data: { ...h, is_favorit: aktif } }) // ubah tampilan dulu, lalu kirim ke server
    try {
      await api(`favorit/${h.id}`, { method: aktif ? 'POST' : 'DELETE' })
    } catch {
      reload()
    }
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link to="/" className="flex items-center gap-1 hover:text-brand-700"><Icon name="home" className="!text-base" /> Beranda</Link>
        <Icon name="chevron_right" className="!text-base" />
        <Link to="/katalog" className="hover:text-brand-700">Katalog</Link>
        <Icon name="chevron_right" className="!text-base" />
        <span className="font-semibold text-slate-900">{h.nama}</span>
      </nav>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Kolom kiri: galeri, tentang, riwayat medis */}
        <div className="space-y-6">
          <div className="rounded-[28px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
            <div className="relative">
              <PetPhoto src={h.foto[foto]?.url} alt={`Foto ${h.nama}`} className="aspect-[4/3] w-full rounded-[22px]" />
              <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                <Icon name="verified" className="!text-base text-brand-600" /> Terverifikasi Shelter
              </span>
            </div>
            {h.foto.length > 1 && (
              <div className="mt-3 grid grid-cols-4 gap-3">
                {h.foto.slice(0, 8).map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => setFoto(i)}
                    aria-label={`Lihat foto ${i + 1}`}
                    className={`overflow-hidden rounded-2xl border-2 transition ${i === foto ? 'border-brand-600' : 'border-transparent opacity-80 hover:opacity-100'}`}
                  >
                    <PetPhoto src={f.url} alt={`Foto ${h.nama} ${i + 1}`} className="aspect-square w-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <section className="space-y-3 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <Judul>Tentang {h.nama}</Judul>
            <p className="whitespace-pre-line leading-relaxed text-slate-600">{h.deskripsi}</p>
          </section>

          <section className="space-y-5 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <Judul>Riwayat Medis</Judul>
            {h.riwayat_medis.length === 0 ? (
              <p className="text-sm text-slate-500">Belum ada catatan riwayat medis.</p>
            ) : (
              <ol className="relative space-y-3 pl-9">
                <span className="absolute bottom-4 left-[11px] top-4 w-0.5 bg-brand-100" />
                {h.riwayat_medis.map((r) => (
                  <li key={r.id} className="relative">
                    <span className="absolute -left-9 top-5 flex h-6 w-6 items-center justify-center rounded-full bg-brand-100">
                      <span className="h-3 w-3 rounded-full bg-brand-600" />
                    </span>
                    <div className="rounded-2xl bg-brand-50 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">{r.judul}</span>
                        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-medium text-brand-700">{formatTanggal(r.tanggal)}</span>
                      </div>
                      {r.keterangan && <p className="mt-1 text-sm text-slate-600">{r.keterangan}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* Kolom kanan: ringkasan, aksi, dan shelter */}
        <div className="space-y-6">
          <div className="space-y-5 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${st.pill}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${st.titik}`} /> {h.status}
              </span>
              <span className="text-xs text-slate-500">ID: #{h.kode}</span>
            </div>

            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">{h.nama}</h1>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">{ringkas}</p>
            </div>

            <div className="space-y-3 rounded-3xl bg-brand-50/60 p-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Info ikon="pets" label="Jenis" nilai={h.jenis} />
                <Info ikon="cake" label="Umur" nilai={formatUmur(h.umur_bulan)} />
                <Info ikon={h.jenis_kelamin === 'Betina' ? 'female' : 'male'} label="Jenis Kelamin" nilai={h.jenis_kelamin} />
                <Info ikon="verified_user" label="Kondisi" nilai={h.kondisi_kesehatan.split(',')[0].trim()} />
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm text-slate-700">
                <Icon name="vaccines" className="!text-xl text-brand-600" /> {h.kondisi_kesehatan}
              </div>
            </div>

            {shelter ? (
              <p className="rounded-2xl bg-brand-50 p-3 text-sm text-slate-600">Akun shelter tidak dapat mengajukan adopsi.</p>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-3">
                  {bisaAjukan ? (
                    <Link
                      to={user ? tujuanAjukan : '/masuk'}
                      state={user ? undefined : { from: tujuanAjukan }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-600 py-3.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700"
                    >
                      Ajukan Adopsi <Icon name="arrow_forward" className="!text-xl" />
                    </Link>
                  ) : (
                    <button disabled className="flex-1 cursor-not-allowed rounded-full bg-slate-200 py-3.5 text-sm font-semibold text-slate-400">
                      Ajukan Adopsi
                    </button>
                  )}
                  <button
                    onClick={favorit}
                    aria-pressed={h.is_favorit}
                    aria-label={h.is_favorit ? 'Hapus dari favorit' : 'Simpan ke favorit'}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition hover:bg-brand-100"
                  >
                    <Icon name="favorite" fill={h.is_favorit} />
                  </button>
                </div>
                {!user && bisaAjukan && (
                  <p className="text-center text-xs text-slate-500">
                    <Link to="/masuk" state={{ from: location.pathname }} className="font-semibold text-brand-700">Masuk</Link> untuk mengajukan adopsi
                  </p>
                )}
                {!bisaAjukan && <p className="text-sm text-slate-600">{CATATAN[h.status]}</p>}
              </div>
            )}

            <div className="flex items-start gap-2 rounded-2xl bg-brand-50 p-3 text-xs text-slate-600">
              <Icon name="info" className="!text-lg text-brand-600" />
              Proses adopsi memerlukan pengisian formulir pengajuan agar shelter dapat menilai kecocokan rumah dan hewan peliharaan.
            </div>
          </div>

          <div className="space-y-4 rounded-[28px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600"><Icon name="home_work" /></span>
              <div>
                <div className="text-xs text-slate-500">Dikelola oleh</div>
                <div className="text-lg font-bold text-slate-900">{h.shelter.nama}</div>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex gap-2"><Icon name="location_city" className="!text-lg text-slate-400" /> Kota {h.shelter.kota}</li>
              <li className="flex gap-2"><Icon name="location_on" className="!text-lg text-slate-400" /> {h.shelter.alamat}</li>
              <li className="flex gap-2"><Icon name="call" className="!text-lg text-slate-400" /> {h.shelter.telepon}</li>
            </ul>
            <a href={waLink(h.shelter.telepon)} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 rounded-full bg-brand-100 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-200">
              <Icon name="chat" className="!text-xl" /> Hubungi Shelter
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}