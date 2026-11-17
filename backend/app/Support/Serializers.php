<?php

namespace App\Support;

use App\Models\Batch;
use App\Models\Obat;
use App\Models\Resep;
use App\Models\ResepItem;
use App\Models\Transaksi;
use App\Models\TransaksiItem;
use App\Models\User;

final class Serializers
{
    public static function user(User $user): array
    {
        return [
            'id' => $user->id,
            'nama' => $user->nama,
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => (bool) $user->is_active,
        ];
    }

    public static function obat(Obat $obat): array
    {
        return [
            'id' => $obat->id,
            'kode_obat' => $obat->kode_obat,
            'nama_obat' => $obat->nama_obat,
            'jenis' => $obat->jenis,
            'satuan' => $obat->satuan,
            'harga_jual' => (float) $obat->harga_jual,
            'stok_minimum' => (int) $obat->stok_minimum,
        ];
    }

    public static function obatRingkas(Obat $obat): array
    {
        return [
            'id' => $obat->id,
            'kode_obat' => $obat->kode_obat,
            'nama_obat' => $obat->nama_obat,
            'satuan' => $obat->satuan,
            'jenis' => $obat->jenis,
        ];
    }

    public static function batch(Batch $batch, bool $denganObat = false): array
    {
        $data = [
            'id' => $batch->id,
            'obat_id' => $batch->obat_id,
            'nomor_batch' => $batch->nomor_batch,
            'tanggal_expired' => $batch->tanggal_expired,
            'qty' => (int) $batch->qty,
            'status' => $batch->status,
        ];

        if ($denganObat && $batch->relationLoaded('obat')) {
            $data['obat'] = self::obatRingkas($batch->obat);
        }

        return $data;
    }

    public static function resep(Resep $resep): array
    {
        return [
            'id' => $resep->id,
            'kode_resep' => $resep->kode_resep,
            'tanggal' => $resep->tanggal,
            'nama_pasien' => $resep->nama_pasien,
            'nomor_rm' => $resep->nomor_rm,
            'nama_dokter' => $resep->nama_dokter,
            'nomor_sip' => $resep->nomor_sip,
            'jenis' => $resep->jenis,
            'nama_racikan' => $resep->nama_racikan,
            'aturan_pakai' => $resep->aturan_pakai,
            'status' => $resep->status,
            'user_id' => $resep->user_id,
        ];
    }

    public static function resepItem(ResepItem $item): array
    {
        return [
            'id' => $item->id,
            'resep_id' => $item->resep_id,
            'obat_id' => $item->obat_id,
            'jumlah' => (int) $item->jumlah,
            'aturan_pakai' => $item->aturan_pakai,
            'obat' => $item->relationLoaded('obat') ? self::obat($item->obat) : null,
        ];
    }

    public static function transaksi(Transaksi $transaksi): array
    {
        return [
            'id' => $transaksi->id,
            'kode_transaksi' => $transaksi->kode_transaksi,
            'tanggal' => $transaksi->tanggal,
            'resep_id' => $transaksi->resep_id,
            'user_id' => $transaksi->user_id,
            'total' => (float) $transaksi->total,
            'uang_diterima' => (float) $transaksi->uang_diterima,
            'kembalian' => (float) $transaksi->kembalian,
            'resep_kode' => $transaksi->relationLoaded('resep') && $transaksi->resep
                ? $transaksi->resep->kode_resep
                : null,
        ];
    }

    public static function transaksiItem(TransaksiItem $item): array
    {
        return [
            'id' => $item->id,
            'transaksi_id' => $item->transaksi_id,
            'obat_id' => $item->obat_id,
            'batch_id' => $item->batch_id,
            'qty' => (int) $item->qty,
            'harga_satuan' => (float) $item->harga_satuan,
            'subtotal' => (float) $item->subtotal,
            'obat' => $item->relationLoaded('obat') ? self::obat($item->obat) : null,
            'batch' => $item->relationLoaded('batch') ? self::batch($item->batch) : null,
        ];
    }
}
