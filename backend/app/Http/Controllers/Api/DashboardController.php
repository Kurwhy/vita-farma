<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transaksi;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(StockService $stock): JsonResponse
    {
        $hariIni = Transaksi::query()->whereDate('tanggal', now()->toDateString());

        return response()->json([
            'jumlah_transaksi' => (clone $hariIni)->count(),
            'total_penjualan' => (float) (clone $hariIni)->sum('total'),
            'stok_minimum' => $stock->lowStock(),
        ]);
    }
}
