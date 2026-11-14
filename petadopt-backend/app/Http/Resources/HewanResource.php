<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HewanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Diisi oleh controller: daftar id hewan favorit milik pengguna yang sedang login
        $favoritIds = $request->attributes->get('favorit_ids', []);

        return [
            'id' => $this->id,
            'kode' => sprintf('PET-%04d', $this->id),
            'nama' => $this->nama,
            'jenis' => $this->jenis,
            'ras' => $this->ras,
            'jenis_kelamin' => $this->jenis_kelamin,
            'umur_bulan' => $this->umur_bulan,
            'kondisi_kesehatan' => $this->kondisi_kesehatan,
            'deskripsi' => $this->deskripsi,
            'status' => $this->status,
            'is_favorit' => in_array($this->id, $favoritIds, true),

            // whenLoaded: hanya disertakan kalau relasinya memang sudah dimuat
            'foto' => $this->whenLoaded('foto', fn () => $this->foto->map(
                fn ($f) => ['id' => $f->id, 'url' => $f->url]
            )->values()),
            'foto_utama' => $this->whenLoaded('foto', fn () => $this->foto->first()?->url),

            'shelter' => $this->whenLoaded('shelter', fn () => [
                'id' => $this->shelter->id,
                'nama' => $this->shelter->nama,
                'kota' => $this->shelter->kota,
                'alamat' => $this->shelter->alamat,
                'telepon' => $this->shelter->telepon,
                'deskripsi' => $this->shelter->deskripsi,
            ]),

            'riwayat_medis' => $this->whenLoaded('riwayatMedis', fn () => $this->riwayatMedis->map(fn ($r) => [
                'id' => $r->id,
                'judul' => $r->judul,
                'tanggal' => $r->tanggal->toDateString(),
                'keterangan' => $r->keterangan,
            ])->values()),
        ];
    }
}