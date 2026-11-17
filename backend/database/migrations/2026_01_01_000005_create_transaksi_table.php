<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id();
            $table->string('kode_transaksi', 20)->unique();
            $table->dateTime('tanggal');
            $table->unsignedBigInteger('resep_id')->nullable()->unique();
            $table->unsignedBigInteger('user_id');
            $table->decimal('total', 12, 2)->default(0);
            $table->decimal('uang_diterima', 12, 2)->default(0);
            $table->decimal('kembalian', 12, 2)->default(0);
            $table->timestamps();

            $table->index('tanggal', 'idx_transaksi_tanggal');
            $table->foreign('resep_id', 'fk_transaksi_resep')->references('id')->on('resep');
            $table->foreign('user_id', 'fk_transaksi_user')->references('id')->on('users');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi');
    }
};
