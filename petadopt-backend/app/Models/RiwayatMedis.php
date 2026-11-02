<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RiwayatMedis extends Model
{
    protected $table = 'riwayat_medis';

    protected $fillable = ['hewan_id', 'judul', 'tanggal', 'keterangan'];

    protected $casts = ['tanggal' => 'date:Y-m-d'];
}