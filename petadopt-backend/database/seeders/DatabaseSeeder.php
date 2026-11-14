<?php

namespace Database\Seeders;

use App\Models\Shelter;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Data contoh untuk pengembangan. Semua akun memakai kata sandi: password
 * Aman dijalankan berulang kali (tidak membuat data ganda).
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $hope = $this->shelter('drh. Sarah Wijaya', 'sarah@shelterhope.test', '081200000001',
            'Shelter Hope Bandung', 'Bandung', 'Jl. Riau No. 88, Bandung',
            'Menyelamatkan dan merawat anjing serta kucing terlantar di Bandung.');

        $sahabat = $this->shelter('Budi Hartono', 'sahabat@sahabatsatwa.test', '081200000002',
            'Sahabat Satwa', 'Jakarta', 'Jl. Kemang Raya No. 10, Jakarta Selatan',
            'Shelter rekanan penyelamat satwa terlantar di Jakarta.');

        // [shelter, nama, jenis, ras, kelamin, umur (bulan), kondisi, status]
        $data = [
            [$hope, 'Milo', 'Anjing', 'Golden Retriever', 'Jantan', 24, 'Sehat, vaksin lengkap', 'Tersedia'],
            [$hope, 'Luna', 'Kucing', 'Persia', 'Betina', 12, 'Sehat, sudah steril', 'Tersedia'],
            [$hope, 'Snowy', 'Kucing', 'Anggora Putih', 'Betina', 8, 'Sehat, vaksin lengkap', 'Teradopsi'],
            [$hope, 'Coco', 'Kelinci', 'Holland Lop', 'Jantan', 10, 'Sehat dan aktif', 'Tersedia'],
            [$hope, 'Rocky', 'Anjing', 'Siberian Husky', 'Jantan', 48, 'Vaksin lengkap', 'Tersedia'],
            [$sahabat, 'Bobi', 'Anjing', 'Campuran', 'Jantan', 18, 'Terapi kulit selesai, vaksin rabies', 'Dalam Proses'],
            [$sahabat, 'Koko', 'Burung', 'Parkit', 'Jantan', 6, 'Sehat dan aktif', 'Tersedia'],
            [$sahabat, 'Mochi', 'Kucing', 'Scottish Fold', 'Betina', 24, 'Sehat, vaksin lengkap', 'Tersedia'],
            [$sahabat, 'Nala', 'Kucing', 'Domestik', 'Betina', 36, 'Sehat, sudah steril', 'Tersedia'],
            [$sahabat, 'Tiko', 'Burung', 'Lovebird', 'Jantan', 14, 'Sehat dan aktif', 'Teradopsi'],
        ];

        foreach ($data as [$shelter, $nama, $jenis, $ras, $kelamin, $umur, $kondisi, $status]) {
            $hewan = $shelter->hewans()->firstOrCreate(['nama' => $nama], [
                'jenis' => $jenis,
                'ras' => $ras,
                'jenis_kelamin' => $kelamin,
                'umur_bulan' => $umur,
                'kondisi_kesehatan' => $kondisi,
                'deskripsi' => "$nama adalah $jenis $ras yang ramah dan siap mendapatkan rumah baru.",
                'status' => $status,
            ]);

            if ($nama === 'Milo') {
                $hewan->riwayatMedis()->firstOrCreate(['judul' => 'Vaksin Rabies'], [
                    'tanggal' => '2026-01-12',
                    'keterangan' => 'Dosis tahunan oleh dokter hewan mitra.',
                ]);
                $hewan->riwayatMedis()->firstOrCreate(['judul' => 'Pemeriksaan Rutin'], [
                    'tanggal' => '2026-03-05',
                    'keterangan' => 'Kondisi fisik prima, bebas kutu dan cacing.',
                ]);
            }
        }
    }

    private function shelter(string $pengelola, string $email, string $telepon, string $nama,
        string $kota, string $alamat, string $deskripsi): Shelter
    {
        $user = User::firstOrCreate(['email' => $email], [
            'name' => $pengelola,
            'phone' => $telepon,
            'alamat' => $alamat,
            'role' => 'admin_shelter',
            'password' => 'password',
        ]);

        return $user->shelter()->firstOrCreate([], [
            'nama' => $nama,
            'kota' => $kota,
            'alamat' => $alamat,
            'telepon' => $telepon,
            'deskripsi' => $deskripsi,
        ]);
    }
}