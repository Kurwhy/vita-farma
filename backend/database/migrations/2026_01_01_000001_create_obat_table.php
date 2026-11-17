<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('obat', function (Blueprint $table) {
            $table->id();
            $table->string('kode_obat', 20)->unique();
            $table->string('nama_obat', 150);
            $table->enum('jenis', ['jadi', 'bahan_racikan']);
            $table->string('satuan', 30);
            $table->decimal('harga_jual', 12, 2)->default(0);
            $table->unsignedInteger('stok_minimum')->default(0);
            $table->timestamps();

            $table->index('nama_obat', 'idx_obat_nama');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('obat');
    }
};
