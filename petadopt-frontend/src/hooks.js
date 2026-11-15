import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

/**
 * Mengambil data GET dari API. Pemakaian: const { data, loading, error, reload } = useApi('hewan', { jenis: 'Kucing' })
 * Data diambil ulang otomatis kalau path atau params berubah.
 */
export function useApi(path, params) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const kunci = JSON.stringify(params || {}) // supaya perubahan isi params terbaca sebagai perubahan

  const load = useCallback(() => {
    let aktif = true
    setState((s) => ({ ...s, loading: true, error: null }))
    api(path, { params: JSON.parse(kunci) })
      .then((data) => aktif && setState({ data, loading: false, error: null }))
      .catch((error) => aktif && setState({ data: null, loading: false, error }))
    return () => {
      aktif = false // abaikan jawaban lama kalau permintaan baru sudah dikirim
    }
  }, [path, kunci])

  useEffect(() => load(), [load])

  return { ...state, reload: load, setData: (data) => setState((s) => ({ ...s, data })) }
}