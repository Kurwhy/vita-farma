<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Obat extends Model
{
    protected $table = 'obat';

    protected $fillable = [
        'kode_obat',
        'nama_obat',
        'jenis',
        'satuan',
        'harga_jual',
        'stok_minimum',
    ];

    protected function casts(): array
    {
        return [
            'harga_jual' => 'decimal:2',
            'stok_minimum' => 'integer',
        ];
    }

    public function batch(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    public function resepItem(): HasMany
    {
        return $this->hasMany(ResepItem::class);
    }

    public function transaksiItem(): HasMany
    {
        return $this->hasMany(TransaksiItem::class);
    }
}
