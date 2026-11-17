<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Batch extends Model
{
    protected $table = 'batch';

    protected $fillable = [
        'obat_id',
        'nomor_batch',
        'tanggal_expired',
        'qty',
    ];

    protected $appends = [
        'status',
    ];

    protected function casts(): array
    {
        return [
            'qty' => 'integer',
        ];
    }

    public function obat(): BelongsTo
    {
        return $this->belongsTo(Obat::class);
    }

    public function transaksiItem(): HasMany
    {
        return $this->hasMany(TransaksiItem::class);
    }

    public function getStatusAttribute(): string
    {
        if ($this->tanggal_expired < now()->toDateString()) {
            return 'expired';
        }

        if ((int) $this->qty <= 0) {
            return 'habis';
        }

        return 'tersedia';
    }
}
