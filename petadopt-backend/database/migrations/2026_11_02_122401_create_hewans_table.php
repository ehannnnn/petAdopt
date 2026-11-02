<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('hewans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shelter_id')->constrained()->cascadeOnDelete();
            $table->string('nama', 100);
            $table->enum('jenis', ['Anjing', 'Kucing', 'Kelinci', 'Burung', 'Lainnya'])->index();
            $table->string('ras', 100)->nullable();
            $table->enum('jenis_kelamin', ['Jantan', 'Betina']);
            $table->unsignedSmallInteger('umur_bulan');
            $table->string('kondisi_kesehatan');
            $table->text('deskripsi');
            $table->enum('status', ['Tersedia', 'Dalam Proses', 'Teradopsi'])->default('Tersedia')->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hewans');
    }
};
