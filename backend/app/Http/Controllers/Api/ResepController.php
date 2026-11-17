<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Resep;
use App\Services\ResepService;
use App\Support\Serializers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ResepController extends Controller
{
    public function index(): JsonResponse
    {
        $paginator = Resep::query()
            ->orderByDesc('tanggal')
            ->orderByDesc('kode_resep')
            ->paginate(20)
            ->through(fn (Resep $resep) => Serializers::resep($resep));

        return response()->json($paginator);
    }

    public function store(Request $request, ResepService $resepService): JsonResponse
    {
        $data = $request->validate([
            'nama_pasien' => ['required', 'string', 'max:100'],
            'nomor_rm' => ['nullable', 'string', 'max:30'],
            'nama_dokter' => ['required', 'string', 'max:100'],
            'nomor_sip' => ['nullable', 'string', 'max:30'],
            'jenis' => ['required', Rule::in(['jadi', 'racikan'])],
            'nama_racikan' => ['nullable', 'string', 'max:100', 'required_if:jenis,racikan'],
            'aturan_pakai' => ['nullable', 'string', 'max:255', 'required_if:jenis,racikan'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.obat_id' => ['required', 'integer', 'distinct', 'exists:obat,id'],
            'items.*.jumlah' => ['required', 'integer', 'min:1'],
            'items.*.aturan_pakai' => ['nullable', 'string', 'max:255'],
        ]);

        $resep = $resepService->create($data, $request->user()->id);

        return response()->json([
            'resep' => Serializers::resep($resep),
            'items' => $resep->items->map(fn ($item) => Serializers::resepItem($item))->values(),
        ], 201);
    }

    public function show(Resep $resep): JsonResponse
    {
        $resep->load(['items.obat', 'transaksi']);

        return response()->json([
            'resep' => Serializers::resep($resep),
            'items' => $resep->items->map(fn ($item) => Serializers::resepItem($item))->values(),
            'transaksi' => $resep->transaksi ? Serializers::transaksi($resep->transaksi) : null,
        ]);
    }

    public function tebus(Request $request, Resep $resep, ResepService $resepService): JsonResponse
    {
        $data = $request->validate([
            'uang_diterima' => ['required', 'integer', 'min:0'],
        ]);

        $transaksi = $resepService->redeem($resep, (int) $data['uang_diterima'], $request->user()->id);

        return response()->json(Serializers::transaksi($transaksi), 201);
    }
}
