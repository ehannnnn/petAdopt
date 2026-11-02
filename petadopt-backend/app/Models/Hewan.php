<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Hewan extends Model
{
    protected $table = 'hewans';

    protected $fillable = [
        'shelter_id', 'nama', 'jenis', 'ras', 'jenis_kelamin',
        'umur_bulan', 'kondisi_kesehatan', 'deskripsi', 'status',
    ];

    public function shelter(): BelongsTo
    {
        return $this->belongsTo(Shelter::class);
    }

    public function foto(): HasMany
    {
        return $this->hasMany(FotoHewan::class)->orderBy('urutan')->orderBy('id');
    }

    public function riwayatMedis(): HasMany
    {
        return $this->hasMany(RiwayatMedis::class)->orderByDesc('tanggal');
    }

    public function pengajuan(): HasMany
    {
        return $this->hasMany(PengajuanAdopsi::class);
    }
}