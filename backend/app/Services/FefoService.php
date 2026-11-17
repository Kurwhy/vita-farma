<?php

namespace App\Services;

use App\Models\Batch;
use App\Models\Obat;
use Illuminate\Validation\ValidationException;

class FefoService
{
    /**
     * @param  array<int, array{obat_id: int|string, jumlah: int|string}>  $lines
     * @return array<int, array{obat: Obat, jumlah: int, allocations: array<int, array{batch: Batch, qty: int}>}>
     */
    public function allocate(array $lines): array
    {
        $sorted = collect($lines)
            ->map(fn (array $line) => [
                'obat_id' => (int) $line['obat_id'],
                'jumlah' => (int) $line['jumlah'],
            ])
            ->sortBy('obat_id')
            ->values();

        $obatMap = Obat::query()
            ->whereIn('id', $sorted->pluck('obat_id')->unique()->all())
            ->get()
            ->keyBy('id');

        $prepared = [];

        foreach ($sorted as $line) {
            $obat = $obatMap->get($line['obat_id']);

            if (! $obat) {
                throw ValidationException::withMessages([
                    'items' => 'Ada obat yang tidak ditemukan.',
                ]);
            }

            $batches = Batch::query()
                ->where('obat_id', $obat->id)
                ->where('qty', '>', 0)
                ->where('tanggal_expired', '>=', now()->toDateString())
                ->orderBy('tanggal_expired')
                ->orderBy('id')
                ->lockForUpdate()
                ->get();

            $available = (int) $batches->sum('qty');

            if ($available < $line['jumlah']) {
                throw ValidationException::withMessages([
                    'stok' => "Stok siap jual {$obat->nama_obat} tidak mencukupi. Kurangi jumlah atau periksa batch lain.",
                ]);
            }

            $remaining = $line['jumlah'];
            $allocations = [];

            foreach ($batches as $batch) {
                if ($remaining <= 0) {
                    break;
                }

                $take = min($remaining, (int) $batch->qty);

                if ($take > 0) {
                    $allocations[] = [
                        'batch' => $batch,
                        'qty' => $take,
                    ];
                    $remaining -= $take;
                }
            }

            $prepared[] = [
                'obat' => $obat,
                'jumlah' => $line['jumlah'],
                'allocations' => $allocations,
            ];
        }

        foreach ($prepared as $line) {
            foreach ($line['allocations'] as $allocation) {
                $allocation['batch']->decrement('qty', $allocation['qty']);
            }
        }

        return $prepared;
    }
}
