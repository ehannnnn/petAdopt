<?php

namespace App\Http\Controllers\Shelter;

use App\Http\Controllers\Controller;
use App\Http\Resources\PengajuanResource;
use App\Models\PengajuanAdopsi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PengajuanController extends Controller
{
    // Daftar pengajuan masuk + jumlah per status untuk tab filter
    public function index(Request $request)
    {
        $request->validate([
            'status' => ['nullable', 'in:'.implode(',', PengajuanAdopsi::STATUS)],
        ]);

        $counts = $this->milikShelter($request)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $perStatus = collect(PengajuanAdopsi::STATUS)
            ->mapWithKeys(fn ($s) => [$s => (int) ($counts[$s] ?? 0)]);

        $list = $this->milikShelter($request)
            ->with(['user', 'hewan.foto'])
            ->when($request->status, fn ($q, $s) => $q->where('status', $s))
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        return PengajuanResource::collection($list)->additional(['counts' => $perStatus->all() + [
            'semua' => $perStatus->sum(),
            'perlu_tindakan' => $perStatus['Diajukan'] + $perStatus['Diproses'],
            'baru_hari_ini' => $this->milikShelter($request)
                ->whereDate('pengajuan_adopsis.created_at', today())->count(),
        ]]);
    }

    public function show(Request $request, PengajuanAdopsi $pengajuan)
    {
        $this->pastikanMilik($request, $pengajuan);

        return new PengajuanResource($pengajuan->load(['user', 'hewan.foto', 'hewan.shelter']));
    }

    // Diajukan -> Diproses (dipanggil saat shelter mulai meninjau berkas)
    public function proses(Request $request, PengajuanAdopsi $pengajuan)
    {
        $this->pastikanMilik($request, $pengajuan);

        DB::transaction(function () use ($pengajuan) {
            $p = PengajuanAdopsi::whereKey($pengajuan->id)->lockForUpdate()->firstOrFail();

            if ($p->status === 'Diajukan') {
                $p->update(['status' => 'Diproses']);
            } elseif ($p->status !== 'Diproses') {
                abort(422, 'Pengajuan ini sudah tidak dapat diproses.');
            }
        });

        return new PengajuanResource($pengajuan->fresh(['user', 'hewan.foto', 'hewan.shelter']));
    }

    public function setujui(Request $request, PengajuanAdopsi $pengajuan)
    {
        $this->pastikanMilik($request, $pengajuan);

        $this->putuskan($pengajuan, 'Disetujui', 'Teradopsi');

        return new PengajuanResource($pengajuan->fresh(['user', 'hewan.foto', 'hewan.shelter']));
    }

    public function tolak(Request $request, PengajuanAdopsi $pengajuan)
    {
        $this->pastikanMilik($request, $pengajuan);

        $data = $request->validate([
            'alasan_penolakan' => ['required', 'string', 'max:500'],
        ]);

        $this->putuskan($pengajuan, 'Ditolak', 'Tersedia', $data['alasan_penolakan']);

        return new PengajuanResource($pengajuan->fresh(['user', 'hewan.foto', 'hewan.shelter']));
    }

    // Satu transaksi: ubah pengajuan DAN status hewan, atau batal semuanya
    private function putuskan(PengajuanAdopsi $pengajuan, string $status, string $statusHewan, ?string $alasan = null): void
    {
        DB::transaction(function () use ($pengajuan, $status, $statusHewan, $alasan) {
            $p = PengajuanAdopsi::whereKey($pengajuan->id)->lockForUpdate()->firstOrFail();

            if ($p->status !== 'Diproses') {
                abort(422, 'Keputusan hanya dapat diambil pada pengajuan berstatus Diproses.');
            }

            $p->update([
                'status' => $status,
                'alasan_penolakan' => $alasan,
                'diputuskan_at' => now(),
            ]);

            $p->hewan()->update(['status' => $statusHewan]);
        });
    }

    // Semua pengajuan untuk hewan milik shelter yang sedang login
    private function milikShelter(Request $request)
    {
        $shelterId = $request->user()->shelter->id;

        return PengajuanAdopsi::query()
            ->whereHas('hewan', fn ($q) => $q->where('shelter_id', $shelterId));
    }

    private function pastikanMilik(Request $request, PengajuanAdopsi $pengajuan): void
    {
        abort_unless($pengajuan->hewan->shelter_id === $request->user()->shelter->id, 403);
    }
}