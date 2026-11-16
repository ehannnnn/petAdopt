export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toUpperCase()

// Tujuan setelah login sesuai peran
export const homeFor = (user) => (user?.role === 'admin_shelter' ? '/shelter' : '/dashboard')

// 18 bulan -> "1,5 tahun", 8 bulan -> "8 bulan"
export function formatUmur(bulan) {
  if (bulan < 12) return `${bulan} bulan`
  if (bulan % 12 === 0) return `${bulan / 12} tahun`
  return `${(bulan / 12).toFixed(1).replace('.', ',')} tahun`
}

export const JENIS = ['Anjing', 'Kucing', 'Kelinci', 'Burung', 'Lainnya']
export const UMUR = [['lt1', '< 1 tahun'], ['1-3', '1–3 tahun'], ['gt3', '> 3 tahun']] // [nilai ke API, tulisan]
export const STATUS_HEWAN = ['Tersedia', 'Dalam Proses', 'Teradopsi']

// "2026-01-12" -> "12 Jan 2026"
export function formatTanggal(iso) {
  if (!iso) return '-'
  const d = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso) // tanggal tanpa jam dibaca sebagai waktu setempat
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

// 0812... atau +62 812... -> tautan WhatsApp (hubungan dengan shelter lewat kontaknya, tanpa fitur chat di sistem)
export function waLink(telepon = '') {
  let n = telepon.replace(/\D/g, '')
  if (n.startsWith('0')) n = '62' + n.slice(1)
  return `https://wa.me/${n}`
}

// "2026-05-12T02:42:00Z" -> "12 Mei 2026"
export function formatTanggalPanjang(iso) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}