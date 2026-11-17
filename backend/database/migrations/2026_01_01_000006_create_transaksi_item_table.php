<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transaksi_item', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('transaksi_id');
            $table->unsignedBigInteger('obat_id');
            $table->unsignedBigInteger('batch_id');
            $table->unsignedInteger('qty');
            $table->decimal('harga_satuan', 12, 2);
            $table->decimal('subtotal', 12, 2);
            $table->timestamps();

            $table->foreign('transaksi_id', 'fk_ti_transaksi')->references('id')->on('transaksi')->onDelete('cascade');
            $table->foreign('obat_id', 'fk_ti_obat')->references('id')->on('obat');
            $table->foreign('batch_id', 'fk_ti_batch')->references('id')->on('batch');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transaksi_item');
    }
};
