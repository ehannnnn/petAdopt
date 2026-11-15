// Klien REST ke backend Laravel. Autentikasi memakai token Bearer (Laravel Sanctum).
const TOKEN_KEY = 'petadopt_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY))

// Error khusus supaya halaman bisa menampilkan pesan validasi per kolom (status 422)
export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message)
    this.status = status
    this.errors = errors || {}
  }
}

/**
 * Pemakaian: api('hewan', { params: { jenis: 'Kucing' } })
 *            api('login', { method: 'POST', body: { email, password } })
 * body boleh object (dikirim sebagai JSON) atau FormData (untuk unggah foto).
 */
export async function api(path, { method = 'GET', body, params } = {}) {
  const url = new URL(`/api/${path}`, window.location.origin)
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v)
  })

  const headers = { Accept: 'application/json' }
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let payload
  if (body instanceof FormData) {
    payload = body
  } else if (body) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  let res
  try {
    res = await fetch(url, { method, headers, body: payload })
  } catch {
    throw new ApiError('Tidak dapat terhubung ke server. Coba lagi beberapa saat.', 0)
  }

  const data = await res.json().catch(() => null)

  // Token tidak berlaku lagi: hapus dan beri tahu aplikasi agar pengguna dianggap keluar
  if (res.status === 401 && token) {
    setToken(null)
    window.dispatchEvent(new Event('petadopt:logout'))
  }

  if (!res.ok) throw new ApiError(data?.message || 'Terjadi kesalahan pada server.', res.status, data?.errors)
  return data
}

// Ambil pesan error pertama untuk sebuah kolom dari respons validasi Laravel
export const fieldError = (err, name) => err?.errors?.[name]?.[0]