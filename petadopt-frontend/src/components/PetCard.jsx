import { Link } from 'react-router-dom'
import { formatUmur } from '../utils'
import { Icon } from './ui'

const TITIK = { Tersedia: 'bg-brand-600', 'Dalam Proses': 'bg-slate-500', Teradopsi: 'bg-emerald-500' }

// Foto hewan. Kalau belum ada foto, tampil kotak dengan ikon cakar.
export function PetPhoto({ src, alt, className = '' }) {
  return src ? (
    <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" className={`object-cover ${className}`} />
  ) : (
    <div className={`flex items-center justify-center bg-brand-50 text-brand-300 ${className}`} role="img" aria-label={alt}>
      <Icon name="pets" fill className="!text-5xl" />
    </div>
  )
}

// Kartu hewan di katalog. onFavorit tidak diberikan -> tombol hati disembunyikan (akun shelter).
export default function PetCard({ hewan, onFavorit }) {
  return (
    <article className="flex flex-col rounded-[24px] bg-white p-3 shadow-[0_4px_20px_-2px_rgba(127,86,217,0.08)] ring-1 ring-slate-100 transition hover:shadow-[0_12px_28px_-4px_rgba(127,86,217,0.16)]">
      <div className="relative">
        <PetPhoto src={hewan.foto_utama} alt={`Foto ${hewan.nama}`} className="aspect-[4/3] w-full rounded-[18px]" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
          <span className={`h-1.5 w-1.5 rounded-full ${TITIK[hewan.status]}`} /> {hewan.status}
        </span>
        {onFavorit && (
          <button
            onClick={() => onFavorit(hewan)}
            aria-label={hewan.is_favorit ? `Hapus ${hewan.nama} dari favorit` : `Simpan ${hewan.nama} ke favorit`}
            aria-pressed={hewan.is_favorit}
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-brand-600 shadow-sm transition hover:scale-105"
          >
            <Icon name="favorite" fill={hewan.is_favorit} className="!text-xl" />
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-2 pb-2 pt-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-bold text-slate-900">{hewan.nama}</h3>
          <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">{hewan.jenis_kelamin}</span>
        </div>
        <p className="text-sm font-semibold text-brand-700">{hewan.jenis} • {formatUmur(hewan.umur_bulan)}</p>
        <p className="flex items-center gap-1 text-xs text-slate-500">
          <Icon name="location_on" className="!text-base" /> {hewan.shelter?.nama} • {hewan.shelter?.kota}
        </p>
        <Link to={`/hewan/${hewan.id}`} className="mt-2 flex items-center justify-center gap-1 rounded-full bg-brand-50 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-100">
          Lihat Detail <Icon name="chevron_right" className="!text-lg" />
        </Link>
      </div>
    </article>
  )
}