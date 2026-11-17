<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Resep extends Model
{
    protected $table = 'resep';

    protected $fillable = [
        'kode_resep',
        'tanggal',
        'nama_pasien',
        'nomor_rm',
        'nama_dokter',
        'nomor_sip',
        'jenis',
        'nama_racikan',
        'aturan_pakai',
        'status',
        'user_id',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(ResepItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transaksi(): HasOne
    {
        return $this->hasOne(Transaksi::class);
    }
}
