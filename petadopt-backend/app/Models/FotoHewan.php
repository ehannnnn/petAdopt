<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FotoHewan extends Model
{
    protected $table = 'foto_hewans';

    protected $fillable = ['hewan_id', 'path', 'urutan'];

    // Kalau path berupa URL penuh, dipakai apa adanya
    public function isExternal(): bool
    {
        return Str::startsWith($this->path, ['http://', 'https://']);
    }

    // Dipanggil sebagai $foto->url
    public function getUrlAttribute(): string
    {
        return $this->isExternal() ? $this->path : Storage::disk('public')->url($this->path);
    }
}