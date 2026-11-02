<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Shelter extends Model
{
    protected $fillable = ['user_id', 'nama', 'kota', 'alamat', 'telepon', 'deskripsi'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function hewans(): HasMany
    {
        return $this->hasMany(Hewan::class);
    }
}