import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import PetCard, { PetPhoto } from '../components/PetCard'
import { ErrorBox, Icon, Modal, Notice, Spinner, StatusBadge } from '../components/ui'
import { useApi } from '../hooks'
import { formatTanggalPanjang, formatUmur, waLink } from '../utils'

const TAB = [['pengajuan', 'Pengajuan Saya'], ['favorit', 'Hewan Favorit'], ['riwayat', 'Riwayat Adopsi']]
const STATUS = ['Diajukan', 'Diproses', 'Disetujui', 'Ditolak', 'Dibatalkan']

function Statistik({ judul, angka, ket, ikon, aktif, ketUngu }) {
  return (
    <div className={`flex items-center justify-between rounded-[24px] bg-white p-6 ring-1 ${aktif ? 'shadow-md ring-brand-200' : 'shadow-sm ring-slate-100'}`}>
      <div>
        <div className={`text-sm ${aktif ? 'font-semibold text-brand-700' : 'text-slate-600'}`}>{judul}</div>
        <div className="my-1 text-4xl font-extrabold text-slate-900">{angka}</div>
        <div className={`text-xs ${ketUngu ? 'font-medium text-brand-700' : 'text-slate-500'}`}>{ket}</div>
      </div>
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600">
        <Icon name={ikon} />
      </span>
    </div>
  )
}

function KartuPengajuan({ p, onBatal, onLihat }) {
  const h = p.hewan
  return (
    <article className={`space-y-3 rounded-[24px] bg-white p-5 shadow-sm ring-1 ring-slate-100 ${p.status === 'Dibatalkan' ? 'opacity-60 grayscale' : ''}`}>
      <div className="flex flex-wrap items-center gap-4">
        <Link to={`/hewan/${h.id}`} aria-label={`Lihat ${h.nama}`}>
          <PetPhoto src={h.foto_utama} alt={`Foto ${h.nama}`} className="h-16 w-16 rounded-2xl" />
        </Link>
        <div className="min-w-[200px] flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link to={`/hewan/${h.id}`} className="text-xl font-bold text-slate-900 hover:text-brand-700">{h.nama}</Link>
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-slate-600">{h.jenis} • {formatUmur(h.umur_bulan)}</span>
          </div>
          <p className="flex items-center gap-1 text-sm text-slate-600"><Icon name="location_on" className="!text-base" /> {h.shelter.nama}</p>
          <p className="text-xs text-slate-500">#{p.kode} · Diajukan pada {formatTanggalPanjang(p.created_at)}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={p.status} />
          {p.status === 'Diajukan' && (
            <button onClick={() => onBatal(p)} className="rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
              Batalkan Pengajuan
            </button>
          )}
          {['Diajukan', 'Diproses'].includes(p.status) && (
            <button onClick={() => onLihat(p)} className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100">
              Lihat Formulir
            </button>
          )}
          {p.status === 'Disetujui' && (
            <a href={waLink(h.shelter.telepon)} target="_blank" rel="noreferrer" className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700">
              Hubungi Shelter
            </a>
          )}
        </div>
      </div>

      {p.status === 'Disetujui' && (
        <div className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2.5 text-sm text-brand-800">
          <Icon name="celebration" className="!text-xl" /> Selamat! Silakan hubungi shelter untuk serah terima.
        </div>
      )}
      {p.status === 'Ditolak' && (
        <div className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <Icon name="error" className="!text-xl" />
          <span><b>Alasan penolakan:</b> {p.alasan_penolakan}</span>
        </div>
      )}
    </article>
  )
}

export default function DashboardAdopter() {
  const { user } = useAuth()
  const [params, setParams] = useSearchParams()
  const tab = TAB.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'pengajuan'

  const peng = useApi('pengajuan')
  const fav = useApi('favorit')
  const [filter, setFilter] = useState('')
  const [lihat, setLihat] = useState(null) // pengajuan yang formulirnya sedang dilihat
  const [batal, setBatal] = useState(null) // pengajuan yang akan dibatalkan
  const [busy, setBusy] = useState(false)
  const [galat, setGalat] = useState(null)

  const daftar = peng.data?.data ?? []
  const favorit = fav.data?.data ?? []
  const aktif = daftar.filter((p) => ['Diajukan', 'Diproses'].includes(p.status)).length
  const disetujui = daftar.filter((p) => p.status === 'Disetujui')
  const tampil = daftar.filter((p) => !filter || p.status === filter)

  const konfirmasiBatal = async () => {
    setBusy(true)
    setGalat(null)
    try {
      await api(`pengajuan/${batal.id}/batal`, { method: 'POST' })
      setBatal(null)
    } catch (e) {
      setGalat(e) // misalnya shelter sudah mulai memproses
    }
    setBusy(false)
    peng.reload() // status bisa sudah berubah di sisi shelter
  }

  const hapusFavorit = async (h) => {
    fav.setData({ ...fav.data, data: favorit.filter((x) => x.id !== h.id) }) // hilang dulu dari layar
    try {
      await api(`favorit/${h.id}`, { method: 'DELETE' })
    } catch {
      fav.reload() // gagal: kembalikan
    }
  }

  return (
    <div className="mx-auto max-w-[1100px] space-y-8 px-4 py-10 md:px-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Halo, {user.name} 👋</h1>
          <p className="mt-1 max-w-xl text-slate-600">Pantau seluruh progres adopsi, riwayat hewan favorit, dan status berkas resmi Anda di satu tempat.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold text-brand-700">
          <span className="h-2 w-2 rounded-full bg-brand-600" /> Akun Calon Adopter
        </span>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Statistik judul="Total Pengajuan" angka={daftar.length} ket={`${aktif} berkas sedang aktif`} ikon="description" aktif={tab === 'pengajuan'} ketUngu />
        <Statistik judul="Hewan Favorit" angka={favorit.length} ket="Tersimpan dalam pantauan" ikon="favorite" aktif={tab === 'favorit'} />
        <Statistik judul="Adopsi Berhasil" angka={disetujui.length} ket="Sahabat sejati di rumah" ikon="verified" aktif={tab === 'riwayat'} />
      </div>

      <div className="flex flex-wrap gap-2 rounded-full bg-brand-50 p-1.5 sm:w-fit">
        {TAB.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setParams({ tab: k })}
            className={`rounded-full px-6 py-2.5 text-sm font-semibold transition ${tab === k ? 'bg-brand-600 text-white shadow' : 'text-slate-700 hover:text-brand-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ---------- Tab: Pengajuan Saya ---------- */}
      {tab === 'pengajuan' && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Status:</span>
            {['', ...STATUS].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold ${filter === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-100 hover:bg-brand-50'}`}
              >
                {s || 'Semua'}
              </button>
            ))}
          </div>

          {peng.loading && !peng.data && <Spinner />}
          <ErrorBox error={peng.error} onRetry={peng.reload} />
          {peng.data && daftar.length === 0 && (
            <div className="rounded-[24px] bg-white p-12 text-center shadow-sm ring-1 ring-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Belum ada pengajuan</h3>
              <p className="mt-1 text-sm text-slate-600">Temukan hewan yang cocok di katalog, lalu ajukan adopsi.</p>
              <Link to="/katalog" className="mt-5 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Jelajahi Katalog</Link>
            </div>
          )}
          {daftar.length > 0 && tampil.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Tidak ada pengajuan berstatus {filter}.</p>}
          {tampil.map((p) => <KartuPengajuan key={p.id} p={p} onBatal={(x) => { setGalat(null); setBatal(x) }} onLihat={setLihat} />)}
        </section>
      )}

      {/* ---------- Tab: Hewan Favorit ---------- */}
      {tab === 'favorit' && (
        <section className="space-y-4">
          {fav.loading && !fav.data && <Spinner />}
          <ErrorBox error={fav.error} onRetry={fav.reload} />
          {fav.data && favorit.length === 0 && (
            <div className="rounded-[24px] bg-white p-12 text-center shadow-sm ring-1 ring-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Belum ada hewan favorit</h3>
              <p className="mt-1 text-sm text-slate-600">Tekan ikon hati pada kartu hewan untuk menyimpannya di sini.</p>
              <Link to="/katalog" className="mt-5 inline-flex rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Jelajahi Katalog</Link>
            </div>
          )}
          {favorit.length > 0 && (
            <>
              <p className="text-sm text-slate-600">Menampilkan {favorit.length} hewan favorit</p>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {favorit.map((h) => <PetCard key={h.id} hewan={h} chip={h.ras || h.jenis_kelamin} onFavorit={hapusFavorit} />)}
              </div>
            </>
          )}
        </section>
      )}

      {/* ---------- Tab: Riwayat Adopsi ---------- */}
      {tab === 'riwayat' && (
        <section className="space-y-3">
          <p className="text-sm text-slate-600">Riwayat berisi adopsi yang telah disetujui.</p>
          {peng.loading && !peng.data && <Spinner />}
          <div className="overflow-x-auto rounded-[24px] bg-white p-3 shadow-sm ring-1 ring-slate-100">
            {disetujui.length === 0 ? (
              <p className="p-10 text-center text-sm text-slate-500">Belum ada adopsi yang disetujui.</p>
            ) : (
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="bg-brand-50 text-slate-700">
                    {['Hewan', 'Jenis', 'Shelter', 'Tanggal Pengajuan', 'Tanggal Keputusan', 'Status'].map((t, i, a) => (
                      <th key={t} className={`px-4 py-3 font-semibold ${i === 0 ? 'rounded-l-2xl' : ''} ${i === a.length - 1 ? 'rounded-r-2xl' : ''}`}>{t}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {disetujui.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <PetPhoto src={p.hewan.foto_utama} alt={p.hewan.nama} className="h-10 w-10 rounded-xl" />
                          <b className="text-slate-900">{p.hewan.nama}</b>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-700">{p.hewan.jenis}{p.hewan.ras ? ` • ${p.hewan.ras}` : ''}</td>
                      <td className="px-4 py-4 text-slate-700">{p.hewan.shelter.nama}</td>
                      <td className="px-4 py-4 text-slate-700">{formatTanggalPanjang(p.created_at)}</td>
                      <td className="px-4 py-4 text-slate-700">{formatTanggalPanjang(p.diputuskan_at)}</td>
                      <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      )}

      {/* ---------- Modal: Batalkan Pengajuan ---------- */}
      <Modal open={!!batal} onClose={() => setBatal(null)}>
        {batal && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600"><Icon name="warning" /></span>
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wide text-red-600">Konfirmasi Pembatalan</div>
                  <h2 className="text-lg font-bold text-slate-900">Batalkan pengajuan untuk {batal.hewan.nama}?</h2>
                </div>
              </div>
              <button onClick={() => setBatal(null)} aria-label="Tutup" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-50 text-slate-600 hover:bg-brand-100">
                <Icon name="close" className="!text-xl" />
              </button>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs text-slate-700">
              <Icon name="pets" className="!text-sm text-brand-600" /> Pengajuan #{batal.kode} • {batal.hewan.nama}{batal.hewan.ras ? ` (${batal.hewan.ras})` : ''}
            </span>
            <div className="space-y-2 rounded-2xl bg-brand-50 p-4 text-sm text-slate-800">
              <p>Pengajuan hanya dapat dibatalkan selama berstatus Diajukan. Setelah dibatalkan, {batal.hewan.nama} kembali Tersedia.</p>
              <p className="flex items-center gap-1.5 text-xs text-slate-600"><Icon name="info" className="!text-base" /> Tindakan ini tidak dapat diurungkan kembali.</p>
            </div>
            <ErrorBox error={galat} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setBatal(null)} className="rounded-full bg-brand-50 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-brand-100">Kembali</button>
              <button onClick={konfirmasiBatal} disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-red-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60">
                <Icon name="delete" className="!text-xl" /> {busy ? 'Memproses...' : 'Ya, Batalkan'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- Modal: Lihat Formulir (tidak ada di desain, dibuat sederhana) ---------- */}
      <Modal open={!!lihat} onClose={() => setLihat(null)} width="max-w-lg">
        {lihat && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-bold text-slate-900">Formulir Pengajuan</h2>
              <StatusBadge status={lihat.status} />
            </div>
            <p className="text-xs text-slate-500">#{lihat.kode} · {lihat.hewan.nama} · Diajukan pada {formatTanggalPanjang(lihat.created_at)}</p>
            {[['Nama Lengkap', lihat.nama_lengkap], ['Nomor Telepon / WhatsApp', lihat.telepon], ['Alamat', lihat.alamat], ['Alasan Mengadopsi', lihat.alasan]].map(([k, v]) => (
              <div key={k}>
                <div className="text-xs text-slate-500">{k}</div>
                <div className="whitespace-pre-line text-sm text-slate-900">{v}</div>
              </div>
            ))}
            <Notice>Anda telah menyatakan komitmen merawat {lihat.hewan.nama} seumur hidupnya.</Notice>
            <button onClick={() => setLihat(null)} className="w-full rounded-full bg-brand-50 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100">Tutup</button>
          </div>
        )}
      </Modal>
    </div>
  )
}