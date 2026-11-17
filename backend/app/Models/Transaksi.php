<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaksi extends Model
{
    protected $table = 'transaksi';

    protected $fillable = [
        'kode_transaksi',
        'tanggal',
        'resep_id',
        'user_id',
        'total',
        'uang_diterima',
        'kembalian',
    ];

    protected function casts(): array
    {
        return [
            'total' => 'decimal:2',
            'uang_diterima' => 'decimal:2',
            'kembalian' => 'decimal:2',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(TransaksiItem::class);
    }

    public function resep(): BelongsTo
    {
        return $this->belongsTo(Resep::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
