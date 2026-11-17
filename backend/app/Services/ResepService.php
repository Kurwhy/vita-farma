<?php

namespace App\Services;

use App\Models\Obat;
use App\Models\Resep;
use App\Models\ResepItem;
use App\Models\Transaksi;
use App\Models\TransaksiItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ResepService
{
    public function __construct(
        private FefoService $fefo,
        private CodeService $codes,
    ) {}

    public function create(array $data, int $userId): Resep
    {
        return DB::transaction(function () use ($data, $userId) {
            $expectedJenis = $data['jenis'] === 'racikan' ? 'bahan_racikan' : 'jadi';

            $obatMap = Obat::query()
                ->whereIn('id', collect($data['items'])->pluck('obat_id')->unique()->all())
                ->get()
                ->keyBy('id');

            foreach ($data['items'] as $item) {
                $obat = $obatMap->get((int) $item['obat_id']);

                if (! $obat) {
                    throw ValidationException::withMessages([
                        'items' => 'Ada obat yang tidak ditemukan.',
                    ]);
                }

                if ($obat->jenis !== $expectedJenis) {
                    throw ValidationException::withMessages([
                        'items' => $data['jenis'] === 'racikan'
                            ? 'Resep racikan hanya boleh berisi bahan racikan.'
                            : 'Resep jadi hanya boleh berisi obat jadi.',
                    ]);
                }
            }

            $resep = Resep::create([
                'kode_resep' => $this->codes->nextResep(),
                'tanggal' => now()->toDateString(),
                'nama_pasien' => $data['nama_pasien'],
                'nomor_rm' => $data['nomor_rm'] ?? null,
                'nama_dokter' => $data['nama_dokter'],
                'nomor_sip' => $data['nomor_sip'] ?? null,
                'jenis' => $data['jenis'],
                'nama_racikan' => $data['jenis'] === 'racikan' ? $data['nama_racikan'] : null,
                'aturan_pakai' => $data['jenis'] === 'racikan' ? $data['aturan_pakai'] : null,
                'status' => 'menunggu',
                'user_id' => $userId,
            ]);

            foreach ($data['items'] as $item) {
                ResepItem::create([
                    'resep_id' => $resep->id,
                    'obat_id' => $item['obat_id'],
                    'jumlah' => $item['jumlah'],
                    'aturan_pakai' => $data['jenis'] === 'jadi'
                        ? ($item['aturan_pakai'] ?? null)
                        : null,
                ]);
            }

            return $resep->load('items.obat');
        });
    }

    public function redeem(Resep $resep, int $uangDiterima, int $userId): Transaksi
    {
        return DB::transaction(function () use ($resep, $uangDiterima, $userId) {
            $locked = Resep::query()->whereKey($resep->id)->lockForUpdate()->firstOrFail();

            if ($locked->status === 'ditebus') {
                throw ValidationException::withMessages([
                    'resep' => 'Resep ini sudah ditebus dan tidak dapat ditebus ulang.',
                ]);
            }

            $items = $locked->items()->with('obat')->get();

            if ($items->isEmpty()) {
                throw ValidationException::withMessages([
                    'resep' => 'Resep belum memiliki baris obat.',
                ]);
            }

            $lines = $this->fefo->allocate($items->map(fn (ResepItem $item) => [
                'obat_id' => $item->obat_id,
                'jumlah' => $item->jumlah,
            ])->all());

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
                'resep_id' => $locked->id,
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

            $locked->update(['status' => 'ditebus']);

            return $transaksi->load(['items.obat', 'items.batch', 'user', 'resep']);
        });
    }
}
