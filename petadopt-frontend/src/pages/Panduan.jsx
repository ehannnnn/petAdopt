import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/ui'
import { useApi } from '../hooks'

// Gambar dari export Stitch. Kalau gagal dimuat, diganti latar ungu dengan ikon.
const FOTO_BANNER = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeNL0oPE8KQDQw7YVhvJ2qBJT96NmNSTeXf8qZa0WV1uAdRqsXeDT5HvwGR5BB8cJNrv_0OlHHOVhwTlect9_P2avKVrlMftv5JFoZcfJ68UD0Gu0VqWpZ2cLjgcCfEFHIFci-0bTssLkrfyO1YnplHNuICUmY6lPAuTuEr-Mw10BssrBnjNudENu-l0nwztgvZwp4gxiIAdsFV1oW-q5aiNxx0EsAWXbzCIjrArU'

// Alur adopsi: sesuai alur sebenarnya di sistem (Diajukan -> Diproses -> Disetujui/Ditolak)
const LANGKAH = [
  { no: '01', ikon: 'pets', judul: 'Pilih & Kenali Hewan', isi: 'Telusuri katalog, pelajari kondisi kesehatan, riwayat medis, dan karakter setiap hewan yang diselamatkan.', tautan: ['Jelajahi katalog', '/katalog'] },
  { no: '02', ikon: 'description', judul: 'Ajukan Formulir', isi: 'Masuk atau daftar akun, lalu isi formulir berisi data diri, alasan mengadopsi, dan pernyataan komitmen perawatan.', tautan: ['Lihat hewan tersedia', '/katalog?status=Tersedia'] },
  { no: '03', ikon: 'support_agent', judul: 'Ditinjau Shelter', isi: 'Shelter meninjau pengajuan Anda lalu menyetujui atau menolaknya. Pantau perkembangannya di Dashboard Saya.', tautan: ['Buka Dashboard Saya', '/dashboard'] },
  { no: '04', ikon: 'favorite', judul: 'Serah Terima', isi: 'Jika disetujui, hubungi shelter lewat kontak pada halaman detail hewan untuk mengatur serah terima.', tautan: ['Lihat kontak shelter', '/katalog'] },
]

// Panduan untuk calon adopter (saran umum, bukan aturan yang dicek sistem)
const SYARAT = [
  { ikon: 'hourglass_empty', judul: 'Komitmen Jangka Panjang', label: '10-15 Tahun', isi: 'Satwa peliharaan bukanlah pelengkap sementara. Adopter bersedia berkomitmen merawat dalam setiap fase kehidupan hewan: saat sehat, bertumbuh menua, maupun membutuhkan perawatan medis ekstra.' },
  { ikon: 'home', judul: 'Hunian Aman & Ramah Hewan', label: 'Keamanan', isi: 'Memiliki hunian berventilasi baik dengan pembatas yang aman. Jika tempat tinggal berstatus sewa atau apartemen, pastikan Anda sudah mendapat izin dari pemilik atau pengelola gedung.' },
  { ikon: 'savings', judul: 'Kesiapan Finansial Rutin', label: 'Kesehatan', isi: 'Kemampuan mengalokasikan anggaran untuk nutrisi berkualitas, vaksin tahunan berkala, obat cacing/kutu, perlengkapan higienitas, serta dana darurat kunjungan dokter hewan saat tak terduga.' },
  { ikon: 'groups', judul: 'Persetujuan Seluruh Keluarga', label: 'Harmoni', isi: 'Semua anggota keluarga serumah telah menyetujui kehadiran satwa, tidak memiliki alergi bulu kronis yang tak terkendali, dan siap membagi peran pengasuhan dengan rasa tanggung jawab bersama.' },
]

const FAQ = [
  {
    q: 'Apakah proses adopsi di PetAdopt dipungut biaya?',
    a: (
      <>
        Prinsip utama PetAdopt adalah <b className="text-slate-900">adopsi bukan jual beli</b>. Sistem ini tidak memungut biaya apa pun dari adopter.
        Jika sebuah shelter menetapkan penggantian biaya perawatan (misalnya vaksinasi atau sterilisasi), hal itu disampaikan langsung oleh shelter yang bersangkutan.
      </>
    ),
  },
  {
    q: 'Bagaimana jika saya belum pernah memelihara hewan sebelumnya?',
    a: 'Pemula sangat disambut baik. Baca profil hewan dengan teliti (kondisi kesehatan dan karakternya), pilih satwa yang sesuai dengan pengalaman dan kondisi rumah Anda, lalu ceritakan rencana perawatan pada kolom alasan di formulir. Anda juga dapat menghubungi shelter lewat kontak di halaman detail hewan sebelum mengajukan.',
  },
  {
    q: 'Berapa lama waktu yang dibutuhkan dari pengajuan hingga persetujuan?',
    a: 'Lama proses bergantung pada shelter. Setelah Anda mengajukan, statusnya Diajukan, lalu berubah menjadi Diproses saat shelter mulai meninjau, dan berakhir Disetujui atau Ditolak. Anda dapat memantaunya kapan saja di Dashboard Saya. Selama masih berstatus Diajukan, pengajuan masih bisa dibatalkan.',
  },
  {
    q: 'Apa yang terjadi jika hewan tidak cocok dengan lingkungan rumah?',
    a: 'PetAdopt tidak mengatur masa percobaan. Karena itu, kenali hewan sebaik mungkin sebelum mengajukan dan tanyakan langsung ke shelter bila ada keraguan. Ketentuan setelah persetujuan, termasuk serah terima, dibicarakan langsung antara Anda dan shelter.',
  },
  {
    q: 'Apakah saya bisa mengadopsi lebih dari satu hewan sekaligus?',
    a: 'Bisa. Anda dapat mengajukan adopsi untuk beberapa hewan, masing-masing lewat formulirnya sendiri, dan semuanya terpantau di Dashboard Saya. Pastikan Anda sanggup merawat semuanya, karena setiap pengajuan dinilai terpisah oleh shelter.',
  },
]

function Kepala({ kecil, judul, sub, tengah }) {
  return (
    <div className={tengah ? 'text-center' : ''}>
      <div className="text-xs font-bold uppercase tracking-wide text-brand-700">{kecil}</div>
      <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{judul}</h2>
      {sub && <p className={`mt-2 text-slate-600 ${tengah ? 'mx-auto max-w-xl' : 'max-w-xl'}`}>{sub}</p>}
    </div>
  )
}

function ItemFaq({ no, item, terbuka, onToggle }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <button onClick={onToggle} aria-expanded={terbuka} className="flex w-full items-center gap-3 px-5 py-4 text-left">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">Q{no}</span>
        <span className="flex-1 text-base font-bold text-slate-900 md:text-lg">{item.q}</span>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <Icon name={terbuka ? 'keyboard_arrow_up' : 'keyboard_arrow_down'} />
        </span>
      </button>
      {terbuka && <div className="px-5 pb-5 pl-[4.25rem] text-sm leading-relaxed text-slate-600">{item.a}</div>}
    </div>
  )
}

export default function Panduan() {
  const { data: meta } = useApi('meta')
  const [terbuka, setTerbuka] = useState(0) // pertanyaan pertama terbuka sejak awal
  const [fotoGagal, setFotoGagal] = useState(false)

  const statistik = [
    [meta?.jumlah_teradopsi, 'Sahabat Teradopsi'],
    [meta?.jumlah_tersedia, 'Hewan Siap Diadopsi'],
    [meta?.kota?.length, 'Kota Shelter'],
  ]

  return (
    <div className="space-y-20 pb-20">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pt-14 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-4 py-1.5 text-xs font-semibold text-brand-700">
          <Icon name="volunteer_activism" className="!text-base" /> Panduan Terpadu Adopsi Satwa
        </span>
        <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl">Panduan Adopsi &amp; Pertanyaan Umum (FAQ)</h1>
        <p className="mt-5 text-lg text-slate-600">
          Menyambut anggota keluarga baru berbulu adalah perjalanan penuh kasih dan tanggung jawab seumur hidup. Pelajari setiap tahapan adopsi transparan kami untuk memberikan rumah terbaik bagi satwa tersayang.
        </p>
        <div className="mx-auto mt-8 grid max-w-xl grid-cols-3 gap-2 rounded-3xl bg-brand-50 p-2">
          {statistik.map(([angka, label], i) => (
            <div key={label} className={`rounded-2xl px-3 py-4 ${i === 1 ? 'bg-white shadow-sm' : ''}`}>
              <div className="text-2xl font-extrabold text-brand-700">{angka ?? '–'}</div>
              <div className="mt-0.5 text-xs text-slate-600">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Alur proses */}
      <section className="mx-auto max-w-[1200px] space-y-8 px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Kepala kecil="Langkah Sederhana" judul="Alur Proses Adopsi" />
          <p className="max-w-sm text-sm text-slate-600">Empat langkah terstruktur yang memastikan kesejahteraan satwa dan kesiapan calon adopter berjalan selaras.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {LANGKAH.map((l) => (
            <article key={l.no} className="flex flex-col gap-3 rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">{l.no}</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-600"><Icon name={l.ikon} className="!text-xl" /></span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{l.judul}</h3>
              <p className="flex-1 text-sm leading-relaxed text-slate-600">{l.isi}</p>
              <Link to={l.tautan[1]} className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
                {l.tautan[0]} <Icon name="arrow_forward" className="!text-sm" />
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Syarat calon adopter */}
      <section className="mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="space-y-6 rounded-[32px] bg-brand-50 p-6 md:p-10">
          <Kepala kecil="Komitmen Penuh Kasih" judul="Kriteria & Syarat Calon Adopter" sub="Setiap satwa pantas mendapatkan perlindungan seumur hidup yang stabil. Pastikan Anda dan keluarga telah memenuhi persyaratan fundamental berikut sebelum melangkah." />
          <div className="grid gap-4 md:grid-cols-2">
            {SYARAT.map((s) => (
              <article key={s.judul} className="flex gap-4 rounded-3xl bg-white p-5 shadow-sm">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-100 text-brand-600"><Icon name={s.ikon} /></span>
                <div className="space-y-1">
                  <h3 className="flex flex-wrap items-center gap-2 text-lg font-bold text-slate-900">
                    {s.judul} <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">{s.label}</span>
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600">{s.isi}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="flex items-start gap-3 rounded-2xl bg-brand-100 px-5 py-4 text-sm text-slate-700">
            <Icon name="info" className="!text-xl text-brand-600" />
            Ketentuan tambahan, misalnya batas usia calon adopter, ditentukan oleh masing-masing shelter. Hubungi shelter lewat halaman detail hewan bila ada pertanyaan.
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl space-y-8 px-4">
        <Kepala tengah kecil="Transparan & Jelas" judul="Pertanyaan yang Sering Diajukan" sub="Punya keraguan seputar biaya, proses pemula, atau kebijakan kecocokan? Temukan jawabannya di sini." />
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <ItemFaq key={item.q} no={i + 1} item={item} terbuka={terbuka === i} onToggle={() => setTerbuka(terbuka === i ? null : i)} />
          ))}
        </div>
      </section>

      {/* Banner */}
      <section className="mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="grid items-center gap-8 rounded-[32px] bg-[#E0E9FF] p-6 md:p-10 lg:grid-cols-2">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-brand-700">
              <Icon name="verified" className="!text-sm" /> Adopsi, Bukan Beli
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Membuka Pintu Hati, Menyelamatkan Nyawa</h2>
            <p className="text-slate-700">
              Mengadopsi bukan hanya memberi mereka atap berteduh, tetapi juga mengakhiri siklus keputusasaan di jalanan. Di PetAdopt, shelter menampilkan kondisi kesehatan dan riwayat medis setiap hewan, sehingga Anda dapat memilih dengan tenang.
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-800">
              {['Riwayat Medis Transparan', 'Kontak Shelter Langsung'].map((t) => (
                <span key={t} className="inline-flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-600 text-white"><Icon name="check" className="!text-sm" /></span> {t}
                </span>
              ))}
            </div>
          </div>
          {fotoGagal ? (
            <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-800 text-white/80">
              <Icon name="pets" fill className="!text-8xl" />
            </div>
          ) : (
            <img src={FOTO_BANNER} alt="Pengadopsi tersenyum memeluk kucing yang diadopsi" referrerPolicy="no-referrer" onError={() => setFotoGagal(true)} className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lg" />
          )}
        </div>
      </section>

      {/* Bantuan */}
      <section className="mx-auto max-w-[1200px] space-y-8 px-4 md:px-8">
        <Kepala tengah kecil="Masih Ada Pertanyaan?" judul="Bantuan & Kontak" sub="Hubungi shelter langsung untuk pertanyaan seputar hewan, atau pantau pengajuan Anda kapan saja." />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { ikon: 'chat', judul: 'Hubungi Shelter', isi: 'Nomor telepon dan alamat shelter tersedia di halaman detail setiap hewan, lengkap dengan tombol WhatsApp.', teks: 'Cari Hewan', ke: '/katalog' },
            { ikon: 'assignment', judul: 'Pantau Pengajuan', isi: 'Lihat status pengajuan, batalkan selama masih Diajukan, dan baca alasan jika pengajuan ditolak.', teks: 'Dashboard Saya', ke: '/dashboard' },
            { ikon: 'lock_reset', judul: 'Masalah Akun', isi: 'Lupa kata sandi? Atur ulang lewat email, atau ubah data diri dan kata sandi di halaman profil.', teks: 'Atur Ulang Kata Sandi', ke: '/lupa-sandi' },
          ].map((k) => (
            <article key={k.judul} className="flex flex-col gap-3 rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-brand-600"><Icon name={k.ikon} /></span>
              <h3 className="text-lg font-bold text-slate-900">{k.judul}</h3>
              <p className="flex-1 text-sm leading-relaxed text-slate-600">{k.isi}</p>
              <Link to={k.ke} className="rounded-full bg-brand-100 py-2.5 text-center text-sm font-semibold text-brand-800 hover:bg-brand-200">{k.teks}</Link>
            </article>
          ))}
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-brand-100/70 px-5 py-4 text-sm text-slate-700">
          <Icon name="shield" className="!text-xl text-brand-600" />
          <span><b>Catatan Penting:</b> Untuk kasus satwa liar dilindungi atau gigitan berisiko rabies, segera hubungi dinas terkait dan amankan jarak aman.</span>
        </div>
      </section>

      {/* Ajakan penutup */}
      <section className="mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-14 text-center text-white shadow-xl shadow-brand-900/20">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/20"><Icon name="favorite" fill className="!text-3xl" /></span>
          <h2 className="mx-auto mt-5 max-w-xl text-4xl font-extrabold leading-tight tracking-tight">Siap Menemukan Sahabat Sejati?</h2>
          <p className="mx-auto mt-4 max-w-lg text-brand-100">Banyak sahabat berbulu sedang menanti di shelter rekanan kami. Berikan mereka rumah penuh kasih hari ini.</p>
          <Link to="/katalog" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            <Icon name="pets" fill className="!text-xl" /> Jelajahi Katalog Hewan
          </Link>
        </div>
      </section>
    </div>
  )
}