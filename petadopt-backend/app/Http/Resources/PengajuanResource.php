<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PengajuanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'kode' => $this->kode,
            'status' => $this->status,
            'nama_lengkap' => $this->nama_lengkap,
            'telepon' => $this->telepon,
            'alamat' => $this->alamat,
            'alasan' => $this->alasan,
            'komitmen' => $this->komitmen,
            'alasan_penolakan' => $this->alasan_penolakan,
            'created_at' => $this->created_at,
            'diputuskan_at' => $this->diputuskan_at,
            'hewan' => $this->whenLoaded('hewan', fn () => new HewanResource($this->hewan)),
            'pemohon' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
            ]),
        ];
    }
}