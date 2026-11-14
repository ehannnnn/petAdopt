<?php

namespace App\Http\Controllers\Shelter;

use App\Http\Controllers\Controller;
use App\Http\Resources\PengajuanResource;
use App\Models\PengajuanAdopsi;
use Illuminate\Http\Request;

class ShelterController extends Controller
{
    // FR-14: angka-angka untuk dasbor ringkasan
    public function ringkasan(Request $request)
    {
        $shelter = $request->user()->shelter;

        $hewan = $shelter->hewans()
            ->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        $pengajuan = $this->pengajuanMilik($shelter->id)
            ->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        $terbaru = $this->pengajuanMilik($shelter->id)
            ->with(['user', 'hewan'])->latest('id')->limit(5)->get();

        return [
            'hewan' => [
                'total' => (int) $hewan->sum(),
                'Tersedia' => (int) ($hewan['Tersedia'] ?? 0),
                'Dalam Proses' => (int) ($hewan['Dalam Proses'] ?? 0),
                'Teradopsi' => (int) ($hewan['Teradopsi'] ?? 0),
            ],
            'pengajuan' => collect(PengajuanAdopsi::STATUS)
                ->mapWithKeys(fn ($s) => [$s => (int) ($pengajuan[$s] ?? 0)])
                ->all(),
            'adopsi_berhasil' => (int) ($pengajuan['Disetujui'] ?? 0),
            'terbaru' => $terbaru->map(fn ($p) => (new PengajuanResource($p))->resolve())->all(),
        ];
    }

    // FR-13: riwayat adopsi yang disetujui, bisa dicari berdasarkan nama pemohon atau hewan
    public function riwayat(Request $request)
    {
        $request->validate(['q' => ['nullable', 'string', 'max:100']]);

        $list = $this->pengajuanMilik($request->user()->shelter->id)
            ->where('status', 'Disetujui')
            ->when($request->q, function ($query, $v) {
                $query->where(function ($w) use ($v) {
                    $w->where('nama_lengkap', 'like', "%{$v}%")
                        ->orWhereHas('hewan', fn ($h) => $h->where('nama', 'like', "%{$v}%"));
                });
            })
            ->with(['user', 'hewan.foto'])
            ->latest('diputuskan_at')
            ->paginate(6)
            ->withQueryString();

        return PengajuanResource::collection($list);
    }

    public function show(Request $request)
    {
        return $request->user()->load('shelter');
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'nama_pengelola' => ['required', 'string', 'max:100'],
            'nama' => ['required', 'string', 'max:100'],
            'kota' => ['required', 'string', 'max:100'],
            'alamat' => ['required', 'string', 'max:500'],
            'telepon' => ['required', 'string', 'max:20'],
            'deskripsi' => ['nullable', 'string', 'max:1000'],
        ]);

        $request->user()->update(['name' => $data['nama_pengelola']]);
        $request->user()->shelter->update(collect($data)->except('nama_pengelola')->all());

        return $request->user()->load('shelter');
    }

    private function pengajuanMilik(int $shelterId)
    {
        return PengajuanAdopsi::query()
            ->whereHas('hewan', fn ($q) => $q->where('shelter_id', $shelterId));
    }
}