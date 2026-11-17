<?php

namespace App\Services;

use App\Models\Obat;
use App\Support\Serializers;

class StockService
{
    public function stokObat(Obat $obat): array
    {
        $total = 0;
        $siapJual = 0;
        $expired = 0;

        foreach ($obat->batch as $batch) {
            $qty = (int) $batch->qty;
            $total += $qty;

            if ($batch->status === 'tersedia') {
                $siapJual += $qty;
            }

            if ($batch->status === 'expired') {
                $expired += $qty;
            }
        }

        return [
            'stok_total' => $total,
            'stok_siap_jual' => $siapJual,
            'stok_expired' => $expired,
        ];
    }

    public function report(?string $search = null, ?string $jenis = null): array
    {
        $query = Obat::query()
            ->with(['batch' => fn ($builder) => $builder->orderBy('tanggal_expired')->orderBy('id')])
            ->orderBy('kode_obat');

        if ($search !== null && trim($search) !== '') {
            $term = '%'.trim($search).'%';
            $query->where(function ($builder) use ($term) {
                $builder->where('nama_obat', 'like', $term)
                    ->orWhere('kode_obat', 'like', $term);
            });
        }

        if ($jenis !== null && $jenis !== '') {
            $query->where('jenis', $jenis);
        }

        $rows = [];
        $batchExpired = [];

        foreach ($query->get() as $obat) {
            $total = 0;
            $siapJual = 0;
            $expired = 0;
            $batchTersedia = [];

            foreach ($obat->batch as $batch) {
                $qty = (int) $batch->qty;
                $total += $qty;

                if ($batch->status === 'tersedia') {
                    $siapJual += $qty;
                    $batchTersedia[] = Serializers::batch($batch);
                }

                if ($batch->status === 'expired') {
                    $expired += $qty;
                    $batch->setRelation('obat', $obat);
                    $batchExpired[] = Serializers::batch($batch, true);
                }
            }

            $rows[] = array_merge(Serializers::obat($obat), [
                'stok_total' => $total,
                'stok_siap_jual' => $siapJual,
                'stok_expired' => $expired,
                'selisih' => $siapJual - (int) $obat->stok_minimum,
                'batch_tersedia' => $batchTersedia,
            ]);
        }

        usort($batchExpired, function (array $a, array $b) {
            return strcmp($a['tanggal_expired'], $b['tanggal_expired']) ?: $a['id'] <=> $b['id'];
        });

        return [
            'data' => $rows,
            'batch_expired' => $batchExpired,
        ];
    }

    public function lowStock(): array
    {
        $rows = array_values(array_filter($this->report()['data'], function (array $row) {
            return (int) $row['stok_minimum'] > 0
                && $row['stok_siap_jual'] <= (int) $row['stok_minimum'];
        }));

        usort($rows, function (array $a, array $b) {
            return $a['selisih'] <=> $b['selisih'] ?: strcmp($a['kode_obat'], $b['kode_obat']);
        });

        return $rows;
    }
}
