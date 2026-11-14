<?php

namespace App\Http\Controllers\Shelter;

use App\Http\Controllers\Controller;
use App\Http\Resources\HewanResource;
use App\Models\FotoHewan;
use App\Models\Hewan;
use App\Models\RiwayatMedis;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HewanController extends Controller
{
    // Daftar hewan milik shelter yang login, lengkap dengan jumlah per status
    public function index(Request $request)
    {
        $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'status' => ['nullable', 'in:Tersedia,Dalam Proses,Teradopsi'],
        ]);

        $shelter = $request->user()->shelter;

        $counts = $shelter->hewans()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $hewans = $shelter->hewans()
            ->with('foto')
            ->filter($request->only(['q', 'status']))
            ->latest('id')
            ->paginate(5)
            ->withQueryString();

        return HewanResource::collection($hewans)->additional(['counts' => [
            'semua' => (int) $counts->sum(),
            'Tersedia' => (int) ($counts['Tersedia'] ?? 0),
            'Dalam Proses' => (int) ($counts['Dalam Proses'] ?? 0),
            'Teradopsi' => (int) ($counts['Teradopsi'] ?? 0),
        ]]);
    }

    public function show(Request $request, Hewan $hewan)
    {
        $this->pastikanMilik($request, $hewan);

        return new HewanResource($hewan->load(['foto', 'riwayatMedis']));
    }

    public function store(Request $request)
    {
        $data = $this->validasi($request);

        $hewan = DB::transaction(function () use ($data, $request) {
            $hewan = $request->user()->shelter->hewans()
                ->create($data['hewan'] + ['status' => 'Tersedia']);

            $this->simpanFoto($hewan, $request);
            $hewan->riwayatMedis()->createMany($data['riwayat_medis']);

            return $hewan;
        });

        return (new HewanResource($hewan->load(['foto', 'riwayatMedis'])))
            ->response()->setStatusCode(201);
    }

    // Dikirim sebagai POST dengan _method=PUT (lihat penjelasan di atas).
    // Status hewan tidak bisa diubah di sini, karena diatur otomatis oleh alur pengajuan.
    public function update(Request $request, Hewan $hewan)
    {
        $this->pastikanMilik($request, $hewan);
        $data = $this->validasi($request);

        $request->validate([
            'hapus_foto' => ['nullable', 'array'],
            'hapus_foto.*' => ['integer'],
        ]);

        DB::transaction(function () use ($data, $request, $hewan) {
            $hewan->update($data['hewan']);

            // Hapus foto yang dipilih, tetapi hanya foto milik hewan ini
            $dihapus = $hewan->foto()->whereIn('id', $request->input('hapus_foto', []))->get();
            foreach ($dihapus as $foto) {
                $this->hapusBerkas($foto);
                $foto->delete();
            }

            $this->simpanFoto($hewan, $request);

            // Riwayat medis diganti dengan daftar terbaru dari form
            RiwayatMedis::where('hewan_id', $hewan->id)->delete();
            $hewan->riwayatMedis()->createMany($data['riwayat_medis']);
        });

        return new HewanResource($hewan->fresh(['foto', 'riwayatMedis']));
    }

    public function destroy(Request $request, Hewan $hewan)
    {
        $this->pastikanMilik($request, $hewan);

        // BR-06
        if ($hewan->pengajuan()->where('status', 'Disetujui')->exists()) {
            abort(422, 'Tidak dapat dihapus karena sudah ada adopsi yang disetujui.');
        }

        DB::transaction(function () use ($hewan) {
            foreach ($hewan->foto as $foto) {
                $this->hapusBerkas($foto);
            }
            $hewan->delete(); // foto, riwayat medis, pengajuan, dan favorit ikut terhapus (cascade)
        });

        return response()->json(['message' => 'Data hewan dihapus.']);
    }

    // BR-07: hewan harus milik shelter yang sedang login
    private function pastikanMilik(Request $request, Hewan $hewan): void
    {
        abort_unless($hewan->shelter_id === $request->user()->shelter->id, 403);
    }

    private function validasi(Request $request): array
    {
        $v = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'jenis' => ['required', 'in:Anjing,Kucing,Kelinci,Burung,Lainnya'],
            'ras' => ['nullable', 'string', 'max:100'],
            'jenis_kelamin' => ['required', 'in:Jantan,Betina'],
            'umur_bulan' => ['required', 'integer', 'min:0', 'max:360'],
            'kondisi_kesehatan' => ['required', 'string', 'max:255'],
            'deskripsi' => ['required', 'string', 'max:3000'],
            'foto' => ['nullable', 'array', 'max:8'],
            'foto.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'riwayat_medis' => ['nullable', 'array', 'max:50'],
            'riwayat_medis.*.judul' => ['required', 'string', 'max:100'],
            'riwayat_medis.*.tanggal' => ['required', 'date'],
            'riwayat_medis.*.keterangan' => ['nullable', 'string', 'max:1000'],
        ]);

        return [
            'hewan' => collect($v)->only([
                'nama', 'jenis', 'ras', 'jenis_kelamin', 'umur_bulan', 'kondisi_kesehatan', 'deskripsi',
            ])->all(),
            'riwayat_medis' => array_values($v['riwayat_medis'] ?? []),
        ];
    }

    private function simpanFoto(Hewan $hewan, Request $request): void
    {
        // Urutan foto baru dilanjutkan dari foto yang sudah ada. Urutan terkecil = foto utama.
        $urutan = FotoHewan::where('hewan_id', $hewan->id)->exists()
            ? FotoHewan::where('hewan_id', $hewan->id)->max('urutan') + 1
            : 0;

        foreach ($request->file('foto', []) as $file) {
            $hewan->foto()->create([
                'path' => $file->store('hewan', 'public'),
                'urutan' => $urutan++,
            ]);
        }
    }

    // Hanya file unggahan yang dihapus dari disk, URL luar (data contoh) dibiarkan
    private function hapusBerkas(FotoHewan $foto): void
    {
        if (! $foto->isExternal()) {
            Storage::disk('public')->delete($foto->path);
        }
    }
}