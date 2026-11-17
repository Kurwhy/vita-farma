<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\StockService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class StokController extends Controller
{
    public function index(Request $request, StockService $stock): JsonResponse
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:150'],
            'jenis' => ['nullable', Rule::in(['jadi', 'bahan_racikan'])],
        ]);

        return response()->json($stock->report(
            $filters['search'] ?? null,
            $filters['jenis'] ?? null,
        ));
    }
}
