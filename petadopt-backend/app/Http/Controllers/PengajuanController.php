<?php

namespace App\Http\Controllers;

use App\Http\Resources\PengajuanResource;
use App\Models\Hewan;
use App\Models\PengajuanAdopsi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PengajuanController extends Controller
{
    // FR-08: daftar pengajuan milik adopter yang sedang login
    public function index(Request $request)
    {
        $request->validate([
            'status' => ['nullable', 'in:'.implode(',', PengajuanAdopsi::STATUS)],
        ]);

        $list = $request->user()->pengajuan()
            ->with(['hewan.foto', 'hewan.shelter'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest('id')
            ->get();

        return PengajuanResource::collection($list);
    }

    // FR-06: ajukan adopsi
    public function store(Request $request)
    {
        $data = $request->validate([
            'hewan_id' => ['required', 'exists:hewans,id'],
            'nama_lengkap' => ['required', 'string', 'max:100'],
            'telepon' => ['required', 'string', 'max:20'],
            'alamat' => ['required', 'string', 'max:500'],
            'alasan' => ['required', 'string', 'min:50', 'max:2000'],
            'komitmen' => ['accepted'],
        ]);

        $pengajuan = DB::transaction(function () use ($data, $request) {
            // Kunci baris hewan supaya dua pengajuan bersamaan tidak sama-sama lolos
            $hewan = Hewan::whereKey($data['hewan_id'])->lockForUpdate()->firstOrFail();

            if ($hewan->status !== 'Tersedia') {
                abort(422, 'Hewan ini sedang tidak tersedia untuk diadopsi.');
            }

            $hewan->update(['status' => 'Dalam Proses']); // BR-03

            return $request->user()->pengajuan()->create([
                'hewan_id' => $hewan->id,
                'nama_lengkap' => $data['nama_lengkap'],
                'telepon' => $data['telepon'],
                'alamat' => $data['alamat'],
                'alasan' => $data['alasan'],
                'komitmen' => true,
                'status' => 'Diajukan',
            ]);
        });

        return (new PengajuanResource($pengajuan->load(['hewan.foto', 'hewan.shelter'])))
            ->response()->setStatusCode(201);
    }

    // FR-11 + BR-04: batalkan, hanya saat masih Diajukan
    public function batal(Request $request, PengajuanAdopsi $pengajuan)
    {
        abort_unless($pengajuan->user_id === $request->user()->id, 403);

        DB::transaction(function () use ($pengajuan) {
            $p = PengajuanAdopsi::whereKey($pengajuan->id)->lockForUpdate()->firstOrFail();

            if ($p->status !== 'Diajukan') {
                abort(422, 'Pengajuan hanya dapat dibatalkan selama berstatus Diajukan.');
            }

            $p->update(['status' => 'Dibatalkan']);
            $p->hewan()->update(['status' => 'Tersedia']); // BR-03
        });

        return response()->json(['message' => 'Pengajuan dibatalkan.']);
    }
}