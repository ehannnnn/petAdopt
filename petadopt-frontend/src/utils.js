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