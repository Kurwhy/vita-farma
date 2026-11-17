<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resep', function (Blueprint $table) {
            $table->id();
            $table->string('kode_resep', 20)->unique();
            $table->date('tanggal');
            $table->string('nama_pasien', 100);
            $table->string('nomor_rm', 30)->nullable();
            $table->string('nama_dokter', 100);
            $table->string('nomor_sip', 30)->nullable();
            $table->enum('jenis', ['jadi', 'racikan']);
            $table->string('nama_racikan', 100)->nullable();
            $table->string('aturan_pakai', 255)->nullable();
            $table->enum('status', ['menunggu', 'ditebus'])->default('menunggu');
            $table->unsignedBigInteger('user_id');
            $table->timestamps();

            $table->index('tanggal', 'idx_resep_tanggal');
            $table->foreign('user_id', 'fk_resep_user')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resep');
    }
};
