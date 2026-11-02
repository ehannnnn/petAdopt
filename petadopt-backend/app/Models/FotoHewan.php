<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FotoHewan extends Model
{
    protected $table = 'foto_hewans';

    protected $fillable = ['hewan_id', 'path', 'urutan'];
}