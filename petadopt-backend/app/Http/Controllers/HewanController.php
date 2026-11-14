<?php

namespace App\Http\Controllers;

use App\Http\Resources\HewanResource;
use App\Models\Hewan;
use App\Models\Shelter;
use Illuminate\Http\Request;

class HewanController extends Controller
{
    // Data pendukung beranda dan dropdown filter lokasi
    public function meta()
    {
        return [
            'kota' => Shelter::query()->distinct()->orderBy('kota')->pluck('kota'),
            'jumlah_tersedia' => Hewan::where('status', 'Tersedia')->count(),
            'jumlah_teradopsi' => Hewan::where('status', 'Teradopsi')->count(),
        ];
    }

    public function index(Request $request)
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'jenis' => ['nullable', 'in:Anjing,Kucing,Kelinci,Burung,Lainnya'],
            'umur' => ['nullable', 'in:lt1,1-3,gt3'],
            'kota' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:Tersedia,Dalam Proses,Teradopsi'],
        ]);

        $this->ingatFavorit($request);

        $hewans = Hewan::with(['foto', 'shelter'])
            ->filter($request->only(['q', 'jenis', 'umur', 'kota', 'status']))
            ->latest('id')
            ->paginate(9)
            ->withQueryString();

        return HewanResource::collection($hewans);
    }

    public function show(Request $request, Hewan $hewan)
    {
        $this->ingatFavorit($request);

        return new HewanResource($hewan->load(['foto', 'shelter', 'riwayatMedis']));
    }

    // Route ini publik, jadi pengguna dibaca dari token (kalau ada) lewat guard sanctum
    private function ingatFavorit(Request $request): void
    {
        $user = $request->user('sanctum');

        $request->attributes->set(
            'favorit_ids',
            $user ? $user->favorit()->pluck('hewans.id')->all() : []
        );
    }
}