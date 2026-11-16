import { useEffect, useState } from 'react'
import { ApiError, fieldError } from '../api'
import { initials } from '../utils'

// Ikon Google Material Symbols: <Icon name="pets" />
export function Icon({ name, className = '', fill = false }) {
  return <span className={`material-symbols-outlined ${fill ? 'fill' : ''} ${className}`}>{name}</span>
}

export function Logo({ className = '' }) {
  return (
    <span className={`flex items-center gap-2 text-headline-sm text-primary-container ${className}`}>
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-white">
        <Icon name="pets" className="!text-xl" fill />
      </span>
      PetAdopt
    </span>
  )
}

export function Avatar({ name, size = 'h-10 w-10' }) {
  return (
    <span className={`inline-flex ${size} shrink-0 items-center justify-center rounded-full bg-primary-container text-label-md text-white`}>
      {initials(name)}
    </span>
  )
}

export function Spinner({ label = 'Memuat...' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-on-surface-variant" role="status">
      <Icon name="progress_activity" className="animate-spin" /> {label}
    </div>
  )
}

export function ErrorBox({ error, onRetry }) {
  if (!error) return null
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-error-container p-4 text-body-sm text-on-error-container" role="alert">
      <span>{error.message}</span>
      {onRetry && <button onClick={onRetry} className="font-semibold underline">Coba lagi</button>}
    </div>
  )
}

export function Notice({ type = 'info', children }) {
  const style = {
    info: 'bg-[#F9F5FF] text-[#53389E]',
    success: 'bg-[#D1FADF] text-[#027A48]',
    error: 'bg-error-container text-on-error-container',
  }[type]
  const icon = { info: 'info', success: 'check_circle', error: 'error' }[type]
  return (
    <div className={`flex items-start gap-2 rounded-2xl p-3 text-body-sm ${style}`}>
      <Icon name={icon} className="!text-xl" />
      <div>{children}</div>
    </div>
  )
}

// Label + kolom isian + pesan error validasi dari server untuk kolom bernama `name`
export function Field({ label, name, error, hint, required, children }) {
  const msg = error instanceof ApiError ? fieldError(error, name) : error
  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-label-md text-on-surface">
          {label} {required && <span className="text-error">*</span>}
        </span>
      )}
      {children}
      {hint && !msg && <span className="mt-1 block text-label-sm text-on-surface-variant">{hint}</span>}
      {msg && <span className="mt-1 block text-label-sm text-error">{msg}</span>}
    </label>
  )
}

// Isian dengan ikon di sebelah kiri (dipakai pada halaman autentikasi)
export function InputIcon({ icon, children }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
        <Icon name={icon} className="!text-xl" />
      </span>
      {children}
    </div>
  )
}

// variant="auth": bentuk pil dengan ikon di kiri (halaman autentikasi); tanpa variant: isian biasa
export function PasswordInput({ variant, icon = 'lock', ...props }) {
  const [show, setShow] = useState(false)
  const auth = variant === 'auth'
  return (
    <div className="relative">
      {auth && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
          <Icon name={icon} className="!text-xl" />
        </span>
      )}
      <input {...props} type={show ? 'text' : 'password'} className={auth ? 'input-auth pr-12' : 'input pr-12'} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600"
        aria-label={show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
      >
        <Icon name={show ? 'visibility_off' : 'visibility'} className="!text-xl" />
      </button>
    </div>
  )
}

// Daftar nomor halaman ringkas: 1 2 … 8
function nomorHalaman(sekarang, akhir) {
  if (akhir <= 7) return Array.from({ length: akhir }, (_, i) => i + 1)
  const set = new Set([1, 2, akhir, sekarang - 1, sekarang, sekarang + 1])
  const urut = [...set].filter((n) => n >= 1 && n <= akhir).sort((a, b) => a - b)
  const hasil = []
  urut.forEach((n, i) => {
    if (i > 0 && n - urut[i - 1] > 1) hasil.push('…')
    hasil.push(n)
  })
  return hasil
}

// meta = bagian `meta` dari respons paginasi Laravel
export function Pagination({ meta, onPage, satuan = 'data' }) {
  if (!meta || meta.total === 0) return null
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-5 py-3 text-sm text-slate-600 shadow-sm ring-1 ring-slate-100">
      <span>
        Menampilkan <b className="text-slate-900">{meta.from}–{meta.to}</b> dari <b className="text-slate-900">{meta.total}</b> {satuan}
      </span>
      {meta.last_page > 1 && (
        <nav className="flex items-center gap-1.5" aria-label="Halaman">
          <button
            disabled={meta.current_page === 1}
            onClick={() => onPage(meta.current_page - 1)}
            aria-label="Halaman sebelumnya"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-slate-500 hover:bg-brand-100 disabled:opacity-40"
          >
            <Icon name="chevron_left" className="!text-xl" />
          </button>
          {nomorHalaman(meta.current_page, meta.last_page).map((n, i) =>
            n === '…' ? (
              <span key={`t${i}`} className="px-1 text-slate-400">…</span>
            ) : (
              <button
                key={n}
                onClick={() => onPage(n)}
                aria-current={n === meta.current_page ? 'page' : undefined}
                className={`h-9 w-9 rounded-full text-sm font-semibold ${n === meta.current_page ? 'bg-brand-600 text-white' : 'bg-brand-50 text-slate-700 hover:bg-brand-100'}`}
              >
                {n}
              </button>
            )
          )}
          <button
            disabled={meta.current_page === meta.last_page}
            onClick={() => onPage(meta.current_page + 1)}
            aria-label="Halaman berikutnya"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-slate-500 hover:bg-brand-100 disabled:opacity-40"
          >
            <Icon name="chevron_right" className="!text-xl" />
          </button>
        </nav>
      )}
    </div>
  )
}

// Jendela dialog di atas halaman. Ditutup dengan tombol Esc atau klik di area gelap.
export function Modal({ open, onClose, children, width = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        className={`max-h-[90vh] w-full ${width} overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

const GAYA_STATUS = {
  Diajukan: 'bg-brand-100 text-brand-700',
  Diproses: 'bg-sky-100 text-sky-700',
  Disetujui: 'bg-emerald-100 text-emerald-700',
  Ditolak: 'bg-red-100 text-red-700',
  Dibatalkan: 'bg-slate-200 text-slate-600',
}
const IKON_STATUS = { Disetujui: 'check_circle', Ditolak: 'cancel' }

// Label status pengajuan (BR-01): Diajukan, Diproses, Disetujui, Ditolak, Dibatalkan
export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${GAYA_STATUS[status] || 'bg-slate-100 text-slate-600'}`}>
      {IKON_STATUS[status] ? <Icon name={IKON_STATUS[status]} className="!text-sm" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {status}
    </span>
  )
}