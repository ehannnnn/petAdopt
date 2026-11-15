import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import PetCard from '../components/PetCard'
import { ErrorBox, Icon, Pagination, Spinner } from '../components/ui'
import { useApi } from '../hooks'
import { JENIS, STATUS_HEWAN, UMUR } from '../utils'

// Gambar dari export Stitch. Kalau gagal dimuat, diganti latar ungu dengan ikon.
const HERO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcyiTjvAvhzO4TL0GfsYEjcQ_ffsRWbfwrpV2Zh6_FJgtNkqXspZI8PuZThchRBf-NKUzbwNvfMT0O5LMXSYtt2GKP09C220BP_je6d5_sMaf-N-4ddVTFemQswI527IhSig_P4QY1SW0fr55QLRCTtUXcdI4mJGk1j11UNqIyfgaZR1yJrUMFbTL5xGKQROvSMc0QclLIvgT6S1RBpxBv0wo8r2ys93DKa-rTre0'

const FILTER = ['q', 'jenis', 'umur', 'kota', 'status']
const LABEL = { q: 'Kata Kunci', jenis: 'Jenis', umur: 'Usia', kota: 'Lokasi', status: 'Status' }
const namaUmur = (v) => UMUR.find(([k]) => k === v)?.[1] ?? v

// Semua filter disimpan di alamat URL (?jenis=Kucing&page=2), jadi bisa dibagikan dan tombol Kembali tetap bekerja.
function useKatalog() {
  const [params, setParams] = useSearchParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const filter = Object.fromEntries(FILTER.map((k) => [k, params.get(k) || '']))
  const hasil = useApi('hewan', { ...filter, page: params.get('page') || '1' })
  const meta = useApi('meta') // daftar kota dan jumlah hewan

  const terapkan = (baru) => {
    const sp = new URLSearchParams()
    Object.entries(baru).forEach(([k, v]) => v && sp.set(k, v)) // filter baru selalu mulai dari halaman 1
    setParams(sp)
  }

  const keHalaman = (p) => {
    const sp = new URLSearchParams(params)
    sp.set('page', p)
    setParams(sp)
    document.getElementById('katalog-hewan')?.scrollIntoView?.()
  }

  const favorit = async (hewan) => {
    if (!user) return navigate('/masuk', { state: { from: location.pathname + location.search } })
    const aktif = !hewan.is_favorit
    // Ubah tampilan dulu supaya terasa cepat, lalu kirim ke server
    hasil.setData({ ...hasil.data, data: hasil.data.data.map((h) => (h.id === hewan.id ? { ...h, is_favorit: aktif } : h)) })
    try {
      await api(`favorit/${hewan.id}`, { method: aktif ? 'POST' : 'DELETE' })
    } catch {
      hasil.reload() // gagal: kembalikan ke kondisi sebenarnya
    }
  }

  return {
    filter, hasil, meta, terapkan, keHalaman,
    favorit: user?.role === 'admin_shelter' ? undefined : favorit, // shelter tidak punya favorit
    kota: meta.data?.kota || [],
    aktif: Object.entries(filter).filter(([, v]) => v),
  }
}

// Daftar kartu + paginasi, atau tampilan "tidak ditemukan"
function Hasil({ k }) {
  const { data, loading, error, reload } = k.hasil
  if (error) return <ErrorBox error={error} onRetry={reload} />
  if (!data) return <Spinner />

  if (data.data.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[24px] bg-white px-6 py-16 text-center shadow-sm ring-1 ring-slate-100">
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-brand-50" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-brand-50" />
        <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-brand-50">
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-100 text-brand-600">
            <Icon name="search_off" className="!text-5xl" />
          </span>
        </div>
        <h3 className="relative mt-6 text-2xl font-bold text-slate-900">Hewan tidak ditemukan</h3>
        <p className="relative mx-auto mt-2 max-w-md text-sm text-slate-600">
          Coba ubah kata kunci atau sesuaikan filter Anda. Kami belum menemukan satwa di shelter wilayah tersebut yang sesuai dengan kriteria yang dipilih.
        </p>
        <button onClick={() => k.terapkan({})} className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700">
          <Icon name="restart_alt" className="!text-xl" /> Reset Filter
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}>
        {data.data.map((h) => <PetCard key={h.id} hewan={h} onFavorit={k.favorit} />)}
      </div>
      <Pagination meta={data.meta} onPage={k.keHalaman} satuan="hewan" />
    </div>
  )
}

function Pilihan({ label, ikon, nilai, onChange, semua, opsi }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-600">
        <Icon name={ikon} className="!text-base text-slate-500" /> {label}
      </span>
      <span className="relative block">
        <select value={nilai} onChange={(e) => onChange(e.target.value)} className="h-11 w-full appearance-none rounded-full border-0 bg-brand-50 px-4 pr-10 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-brand-500">
          <option value="">{semua}</option>
          {opsi.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <Icon name="expand_more" className="pointer-events-none absolute right-3 top-1/2 !text-xl -translate-y-1/2 text-slate-500" />
      </span>
    </label>
  )
}

// Filter berbentuk kartu dengan tombol Terapkan (halaman Beranda)
function FilterKartu({ k }) {
  const kunci = JSON.stringify(k.filter)
  const [draft, setDraft] = useState(k.filter)
  useEffect(() => setDraft(JSON.parse(kunci)), [kunci]) // ikuti perubahan URL (misalnya tombol Kembali)
  const ubah = (nama) => (v) => setDraft({ ...draft, [nama]: v })

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); k.terapkan(draft) }}
      className="space-y-4 rounded-[24px] bg-white p-6 shadow-[0_4px_20px_-2px_rgba(127,86,217,0.08)] ring-1 ring-slate-100"
    >
      <div className="relative">
        <Icon name="search" className="absolute left-4 top-1/2 !text-xl -translate-y-1/2 text-slate-500" />
        <input
          value={draft.q}
          onChange={(e) => ubah('q')(e.target.value)}
          placeholder="Cari nama, jenis, atau kata kunci hewan..."
          className="h-12 w-full rounded-full border-0 bg-brand-50 pl-12 pr-4 text-sm outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Pilihan label="Jenis Hewan" ikon="pets" nilai={draft.jenis} onChange={ubah('jenis')} semua="Semua Jenis" opsi={JENIS.map((j) => [j, j])} />
        <Pilihan label="Rentang Umur" ikon="calendar_month" nilai={draft.umur} onChange={ubah('umur')} semua="Semua Umur" opsi={UMUR} />
        <Pilihan label="Lokasi Shelter" ikon="location_on" nilai={draft.kota} onChange={ubah('kota')} semua="Semua Kota" opsi={k.kota.map((c) => [c, c])} />
        <Pilihan label="Status Adopsi" ikon="verified" nilai={draft.status} onChange={ubah('status')} semua="Semua Status" opsi={STATUS_HEWAN.map((s) => [s, s])} />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => k.terapkan({})} className="rounded-full bg-brand-50 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-brand-100">Reset</button>
        <button type="submit" className="rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700">Terapkan</button>
      </div>
    </form>
  )
}

// Pilihan satu baris yang langsung berlaku tanpa tombol (halaman Katalog)
function PilihanBaris({ ikon, label, nilai, onChange, semua, opsi }) {
  return (
    <span className={`relative flex h-12 items-center rounded-full ${nilai ? 'bg-brand-100 text-brand-800' : 'bg-brand-50 text-slate-700'}`}>
      <Icon name={ikon} className="pointer-events-none absolute left-4 !text-xl" />
      <select aria-label={label} value={nilai} onChange={(e) => onChange(e.target.value)} className="h-full w-full appearance-none rounded-full bg-transparent pl-11 pr-9 text-sm outline-none focus:ring-2 focus:ring-brand-500">
        <option value="">{semua}</option>
        {opsi.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <Icon name="expand_more" className="pointer-events-none absolute right-3 !text-xl" />
    </span>
  )
}

function FilterBaris({ k }) {
  const [q, setQ] = useState(k.filter.q)
  useEffect(() => setQ(k.filter.q), [k.filter.q]) // ikuti perubahan dari luar (hapus chip, Reset)
  useEffect(() => {
    // Pencarian berlaku setelah pengguna berhenti mengetik sebentar
    const t = setTimeout(() => { if (q !== k.filter.q) k.terapkan({ ...k.filter, q }) }, 400)
    return () => clearTimeout(t)
  }, [q]) // eslint-disable-line react-hooks/exhaustive-deps
  const set = (nama) => (v) => k.terapkan({ ...k.filter, [nama]: v })

  return (
    <div className="space-y-4 rounded-[24px] bg-white p-6 shadow-[0_4px_20px_-2px_rgba(127,86,217,0.08)] ring-1 ring-slate-100">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <span className="relative block">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 !text-xl -translate-y-1/2 text-slate-500" />
          <input aria-label="Cari hewan" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari nama, jenis, atau kata kunci" className="h-12 w-full rounded-full bg-brand-50 pl-11 pr-4 text-sm outline-none placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500" />
        </span>
        <PilihanBaris ikon="pets" label="Jenis" nilai={k.filter.jenis} onChange={set('jenis')} semua="Semua Jenis" opsi={JENIS.map((j) => [j, j])} />
        <PilihanBaris ikon="location_on" label="Lokasi" nilai={k.filter.kota} onChange={set('kota')} semua="Semua Kota" opsi={k.kota.map((c) => [c, c])} />
        <PilihanBaris ikon="calendar_month" label="Usia" nilai={k.filter.umur} onChange={set('umur')} semua="Semua Usia" opsi={UMUR} />
        <PilihanBaris ikon="verified" label="Status" nilai={k.filter.status} onChange={set('status')} semua="Semua Status" opsi={STATUS_HEWAN.map((s) => [s, s])} />
      </div>

      {k.aktif.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500">Filter Terpasang:</span>
          {k.aktif.map(([nama, nilai]) => (
            <button key={nama} onClick={() => k.terapkan({ ...k.filter, [nama]: '' })} aria-label={`Hapus filter ${LABEL[nama]}`} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 font-medium text-brand-800 hover:bg-brand-100">
              {LABEL[nama]}: <b>{nama === 'umur' ? namaUmur(nilai) : nama === 'q' ? `“${nilai}”` : nilai}</b> <Icon name="close" className="!text-sm" />
            </button>
          ))}
          <button onClick={() => k.terapkan({})} className="ml-auto inline-flex items-center gap-1 font-semibold text-brand-700 hover:underline">
            <Icon name="restart_alt" className="!text-base" /> Hapus Semua
          </button>
        </div>
      )}
    </div>
  )
}

// ---------- Halaman ----------

export function Beranda() {
  const k = useKatalog()
  const m = k.meta.data
  const [heroGagal, setHeroGagal] = useState(false)

  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-background">
        <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-12 md:px-8 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3.5 py-1.5 text-xs font-semibold text-brand-700">
              <Icon name="pets" fill className="!text-base" /> Program Adopsi Terverifikasi Se-Indonesia
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl">Temukan Sahabat Baru yang Siap Diadopsi</h1>
            <p className="max-w-lg text-lg text-slate-600">Beri kesempatan kedua bagi hewan peliharaan tersayang untuk menemukan rumah penuh kasih dan kehangatan sejati.</p>
            <div className="flex flex-wrap items-center gap-4">
              <a href="#katalog-hewan" className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-700">
                Jelajahi Hewan <Icon name="arrow_downward" className="!text-xl" />
              </a>
              <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                <span className="flex h-9 min-w-9 items-center justify-center rounded-full bg-brand-100 px-2 text-xs font-bold text-brand-700">{m ? m.jumlah_tersedia : '–'}</span>
                Hewan siap menemukan rumah
              </span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[28px] shadow-xl shadow-brand-900/10">
            {heroGagal ? (
              <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-brand-500 to-brand-800 text-white/80">
                <Icon name="pets" fill className="!text-8xl" />
              </div>
            ) : (
              <img src={HERO} alt="Anjing dan kucing ramah PetAdopt" referrerPolicy="no-referrer" onError={() => setHeroGagal(true)} className="aspect-[4/3] w-full object-cover" />
            )}
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl bg-white/95 p-3 shadow-lg backdrop-blur">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-brand-600"><Icon name="favorite" className="!text-2xl" /></span>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900">{m ? m.jumlah_teradopsi : '–'} Pasangan Bahagia</div>
                <div className="text-xs text-slate-600">Telah diadopsi melalui PetAdopt</div>
              </div>
              <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-700">Terverifikasi</span>
            </div>
          </div>
        </div>
      </section>

      <section id="katalog-hewan" className="mx-auto max-w-[1280px] scroll-mt-20 space-y-8 px-4 py-10 md:px-8">
        <FilterKartu k={k} />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Katalog Teman Berbulu</h2>
            <p className="text-sm text-slate-600">Menampilkan hewan yang siap memulai babak baru bersama Anda</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-xs font-medium text-slate-700">
            <Icon name="sort" className="!text-base" /> Urutan: Terbaru
          </span>
        </div>
        <Hasil k={k} />
      </section>
    </>
  )
}

export function KatalogPage() {
  const k = useKatalog()
  const m = k.meta.data

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 px-4 py-10 md:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
            <Icon name="pets" fill className="!text-sm" /> Eksplorasi Sahabat Baru
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Katalog Sahabat Satwa</h1>
          <p className="max-w-xl text-slate-600">Temukan calon sahabat sejati Anda yang siap diadopsi dengan penuh cinta di berbagai shelter terverifikasi.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-slate-700">
          <span className="h-2 w-2 rounded-full bg-brand-600" /> {m ? m.jumlah_tersedia : '–'} Hewan Butuh Rumah
        </span>
      </header>

      <FilterBaris k={k} />
      <div id="katalog-hewan" className="scroll-mt-20"><Hasil k={k} /></div>
    </div>
  )
}