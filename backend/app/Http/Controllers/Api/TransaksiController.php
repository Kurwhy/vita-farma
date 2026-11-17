<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use App\Services\PenjualanService;
use App\Support\Serializers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransaksiController extends Controller
{
    public function index(): JsonResponse
    {
        $paginator = Transaksi::query()
            ->with('resep:id,kode_resep')
            ->orderByDesc('tanggal')
            ->orderByDesc('id')
            ->paginate(20)
            ->through(fn (Transaksi $transaksi) => Serializers::transaksi($transaksi));

        return response()->json($paginator);
    }

    public function show(Transaksi $transaksi): JsonResponse
    {
        $transaksi->load(['items.obat', 'items.batch', 'resep', 'user']);

        return response()->json([
            'transaksi' => Serializers::transaksi($transaksi),
            'items' => $transaksi->items->map(fn ($item) => Serializers::transaksiItem($item))->values(),
            'resep' => $transaksi->resep ? Serializers::resep($transaksi->resep) : null,
            'user' => Serializers::user($transaksi->user),
        ]);
    }

    public function penjualan(Request $request, PenjualanService $penjualanService): JsonResponse
    {
        $data = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.obat_id' => ['required', 'integer', 'distinct', 'exists:obat,id'],
            'items.*.jumlah' => ['required', 'integer', 'min:1'],
            'uang_diterima' => ['required', 'integer', 'min:0'],
        ]);

        $transaksi = $penjualanService->create(
            $data['items'],
            (int) $data['uang_diterima'],
            $request->user()->id,
        );

        return response()->json(Serializers::transaksi($transaksi), 201);
    }
}
