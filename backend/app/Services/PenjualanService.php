<?php

namespace App\Services;

use App\Models\Obat;
use App\Models\Transaksi;
use App\Models\TransaksiItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PenjualanService
{
    public function __construct(
        private FefoService $fefo,
        private CodeService $codes,
    ) {}

    public function create(array $items, int $uangDiterima, int $userId): Transaksi
    {
        return DB::transaction(function () use ($items, $uangDiterima, $userId) {
            $obatMap = Obat::query()
                ->whereIn('id', collect($items)->pluck('obat_id')->unique()->all())
                ->get()
                ->keyBy('id');

            foreach ($items as $item) {
                $obat = $obatMap->get((int) $item['obat_id']);

                if (! $obat) {
                    throw ValidationException::withMessages([
                        'items' => 'Ada obat yang tidak ditemukan.',
                    ]);
                }

                if ($obat->jenis !== 'jadi') {
                    throw ValidationException::withMessages([
                        'items' => 'Bahan racikan tidak dapat dijual di kasir penjualan.',
                    ]);
                }
            }

            $lines = $this->fefo->allocate($items);

            $total = 0.0;

            foreach ($lines as $line) {
                $total += (float) $line['obat']->harga_jual * $line['jumlah'];
            }

            $total = round($total, 2);

            if ($uangDiterima < $total) {
                throw ValidationException::withMessages([
                    'uang_diterima' => 'Uang diterima minimal sama dengan total.',
                ]);
            }

            $transaksi = Transaksi::create([
                'kode_transaksi' => $this->codes->nextTransaksi(),
                'tanggal' => now()->format('Y-m-d H:i:s'),
                'resep_id' => null,
                'user_id' => $userId,
                'total' => $total,
                'uang_diterima' => $uangDiterima,
                'kembalian' => round($uangDiterima - $total, 2),
            ]);

            foreach ($lines as $line) {
                foreach ($line['allocations'] as $allocation) {
                    TransaksiItem::create([
                        'transaksi_id' => $transaksi->id,
                        'obat_id' => $line['obat']->id,
                        'batch_id' => $allocation['batch']->id,
                        'qty' => $allocation['qty'],
                        'harga_satuan' => $line['obat']->harga_jual,
                        'subtotal' => round((float) $line['obat']->harga_jual * $allocation['qty'], 2),
                    ]);
                }
            }

            return $transaksi->load(['items.obat', 'items.batch', 'user', 'resep']);
        });
    }
}
