<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
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

    /** Filter katalog (FR-05): q, jenis, umur (lt1 | 1-3 | gt3), kota, status */
    public function scopeFilter(Builder $query, array $f): Builder
    {
        return $query
            ->when($f['q'] ?? null, function ($q, $v) {
                $q->where(function ($w) use ($v) {
                    $w->where('nama', 'like', "%{$v}%")
                        ->orWhere('ras', 'like', "%{$v}%")
                        ->orWhere('jenis', 'like', "%{$v}%")
                        ->orWhereHas('shelter', fn ($s) => $s
                            ->where('nama', 'like', "%{$v}%")
                            ->orWhere('kota', 'like', "%{$v}%"));
                });
            })
            ->when($f['jenis'] ?? null, fn ($q, $v) => $q->where('jenis', $v))
            ->when($f['kota'] ?? null, fn ($q, $v) => $q->whereHas('shelter', fn ($s) => $s->where('kota', $v)))
            ->when($f['status'] ?? null, fn ($q, $v) => $q->where('status', $v))
            ->when($f['umur'] ?? null, fn ($q, $v) => match ($v) {
                'lt1' => $q->where('umur_bulan', '<', 12),
                '1-3' => $q->whereBetween('umur_bulan', [12, 36]),
                'gt3' => $q->where('umur_bulan', '>', 36),
                default => $q,
            });
    }
}