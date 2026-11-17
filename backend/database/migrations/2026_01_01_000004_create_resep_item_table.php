<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resep_item', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('resep_id');
            $table->unsignedBigInteger('obat_id');
            $table->unsignedInteger('jumlah');
            $table->string('aturan_pakai', 255)->nullable();
            $table->timestamps();

            $table->unique(['resep_id', 'obat_id'], 'uq_resep_obat');
            $table->foreign('resep_id', 'fk_resep_item_resep')->references('id')->on('resep')->onDelete('cascade');
            $table->foreign('obat_id', 'fk_resep_item_obat')->references('id')->on('obat');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resep_item');
    }
};
