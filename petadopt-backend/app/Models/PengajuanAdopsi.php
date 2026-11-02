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

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hewan(): BelongsTo
    {
        return $this->belongsTo(Hewan::class);
    }
}