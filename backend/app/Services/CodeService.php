<?php

namespace App\Services;

use App\Models\Obat;
use App\Models\Resep;
use App\Models\Transaksi;

class CodeService
{
    public function nextObat(): string
    {
        return $this->next(Obat::class, 'kode_obat', 'OBT-', 5);
    }

    public function nextResep(): string
    {
        return $this->next(Resep::class, 'kode_resep', 'RSP-'.now()->format('Ymd').'-', 4);
    }

    public function nextTransaksi(): string
    {
        return $this->next(Transaksi::class, 'kode_transaksi', 'TRX-'.now()->format('Ymd').'-', 4);
    }

    private function next(string $modelClass, string $column, string $prefix, int $pad): string
    {
        $codes = $modelClass::query()
            ->where($column, 'like', $prefix.'%')
            ->lockForUpdate()
            ->pluck($column);

        $max = 0;

        foreach ($codes as $code) {
            $sequence = (int) substr($code, strlen($prefix));

            if ($sequence > $max) {
                $max = $sequence;
            }
        }

        return $prefix.str_pad((string) ($max + 1), $pad, '0', STR_PAD_LEFT);
    }
}
