<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('batch', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('obat_id');
            $table->string('nomor_batch', 50);
            $table->date('tanggal_expired');
            $table->unsignedInteger('qty')->default(0);
            $table->timestamps();

            $table->unique(['obat_id', 'nomor_batch'], 'uq_batch_obat');
            $table->index(['obat_id', 'tanggal_expired'], 'idx_batch_fefo');
            $table->foreign('obat_id', 'fk_batch_obat')->references('id')->on('obat');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batch');
    }
};
