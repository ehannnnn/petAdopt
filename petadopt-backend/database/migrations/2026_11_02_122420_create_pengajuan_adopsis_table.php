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
        Schema::create('pengajuan_adopsis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('hewan_id')->constrained()->cascadeOnDelete();
            $table->string('nama_lengkap', 100);
            $table->string('telepon', 20);
            $table->text('alamat');
            $table->text('alasan');
            $table->boolean('komitmen');
            $table->enum('status', ['Diajukan', 'Diproses', 'Disetujui', 'Ditolak', 'Dibatalkan'])
                ->default('Diajukan')->index();
            $table->text('alasan_penolakan')->nullable();
            $table->timestamp('diputuskan_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengajuan_adopsis');
    }
};
