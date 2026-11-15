<?php

namespace Database\Seeders;

use App\Models\FotoHewan;
use App\Models\Hewan;
use Illuminate\Database\Seeder;

/**
 * Menambah foto contoh (alamat gambar dari desain Stitch) ke hewan yang sudah ada.
 * Aman dijalankan berulang kali dan tidak menghapus data apa pun.
 */
class FotoContohSeeder extends Seeder
{
    public function run(): void
    {
        $foto = [
            'Milo' => [
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAmeFDM8NLfPcD5lN5A4C5qp3C2wC3fFcSUUeAagbBDv4kBb8pMPapZ5LbcjlNctIzSQjxNnAsvT4N4st9GQUD0t8YI8aWKjM8sa3tbBJsvLgjBiCKNX-D5-GH74QzefGpVv-ze7VEDWShjSckR1giy5V1wVXOQnDAPhMS0tq-tjxZDfegRviMBX2ztU1WUTS1Rv6B2E19bbUk0UrqEvgd3dbiNYN7oJvTF7WMOMKY',
                'https://lh3.googleusercontent.com/aida-public/AB6AXuDVwk4-X_aFHh4VbfeM_PjC8KKpwiyG2Zm1Gd83oQhSIn9tuR-JTrG1QXRLxeS4TPTuhO_2gFP7dpI2XzswDMnyMgS8lnnf8K1pLmbW0C9NfcZSOPqUt4Q2QnWp1cCNplj2QSxEEkRWrtbCusAOB-ZCY1pE1MLXDM2hgRPJF4i8Cs6KQlLnXGHFaQ3BqmLr_sLtOBeFPTaCo31rI2EErZ79oUqR3EYmYseWuxO6wU4',
            ],
            'Luna' => ['https://lh3.googleusercontent.com/aida-public/AB6AXuCc7Cs789DSuQmxYAQ1GqFHMK45yY-gYx_8LWC6q6xAYsQHCtASS8WZVnpovxzJih0q7RlAALWC1g20hup7GIkDXM6eRCNxepKvNFt66oP071uFor7KdWKd66IRHZszIhs3mtcHJ8xkRCPWMnN5hS1UXUs6oVc2tGrYh24u5-4K2rAVbkEGKw2OHwiSIDD13w0xZLrL0Qw2Os3Axic_iFxMHrI9JdWjsb8MW5zelyQ'],
            'Bobi' => ['https://lh3.googleusercontent.com/aida-public/AB6AXuCqv3WmQzW5z-xpWNF3CdxguOl5KEstc0Ft23_zEfaDIkmExavzqxrtEfRWhmCK17qY9mRC26GrmxAg_fjsxIMKMOfnClnU5mOfglz9UP6TeQqu9yHy3nI-yPFRwX2cNi1TOxBCxeh7w6dkW31TQkMGv71-vW6U3b1sIS-BItkupnq9H8iQrTyLNpwoZ5HBrQZNVXCfScjQb3P6fVw8m3Fl98JpMrFs6uok3onm7qY'],
            'Koko' => ['https://lh3.googleusercontent.com/aida-public/AB6AXuDUAekQmDyMfINGpdxgcXrvz5_T95bhuPzYtxobvS_ySbHVU9uA_j48Cd3aRYzpfDi_mJw8CTIicAzgYVY_QfuZ71DUBVsv5Cn37ntdryqk5HHF7sJkw1OpGf9yrVQscG5SKYBRET5Dah4LRCgYS4bMucAibL6BALBpmmc1ixgeG9QZ4sj6DRtJp6WA_OyAwAtJ33NzojJJ_ps70u2aqdYFfz7siCY3cuI2PfzSjkM'],
            'Mochi' => ['https://lh3.googleusercontent.com/aida-public/AB6AXuCzNl25TPjvzsV7JJDJGA3kvG1u_83DU8VMbguVB06-Jw25m6boFzBywf-izzDu2_SJnRfq9oyf6FrHy_5-1yLpRhyuuAx48SgeiLyyTlUk8c6MtWEXgy3ae6A9PyUdZ_Cup85aTsdBtIr52g_VTc7_Bxv7nueW5jDnlNsbEsR9eIl4Mq8xQ-JbqMJ5Wr4hUuOxIHEAwKqxYPPM1Xaq5G9iKclTsBuuIWo_cr9vImE'],
        ];

        foreach ($foto as $nama => $daftarUrl) {
            $hewan = Hewan::where('nama', $nama)->first();

            if (! $hewan) {
                continue; // hewan ini tidak ada di database Anda, lewati
            }

            foreach ($daftarUrl as $urutan => $url) {
                FotoHewan::firstOrCreate(
                    ['hewan_id' => $hewan->id, 'path' => $url],
                    ['urutan' => $urutan]
                );
            }
        }
    }
}