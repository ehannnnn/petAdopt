<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PengajuanAdopsi extends Model
{
    protected $table = 'pengajuan_adopsis';

    protected $fillable = [
        'user_id', 'hewan_id', 'nama_lengkap', 'telepon', 'alamat', 'alasan',
        'komitmen', 'status', 'alasan_penolakan', 'diputuskan_at',
    ];

    protected $casts = ['komitmen' => 'boolean', 'diputuskan_at' => 'datetime'];

    public const STATUS = ['Diajukan', 'Diproses', 'Disetujui', 'Ditolak', 'Dibatalkan'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hewan(): BelongsTo
    {
        return $this->belongsTo(Hewan::class);
    }

    // Nomor tiket, contoh: REQ-2026-1113-07. Dipanggil sebagai $pengajuan->kode
    public function getKodeAttribute(): string
    {
        return sprintf('REQ-%s-%02d', $this->created_at->format('Y-md'), $this->id);
    }
}