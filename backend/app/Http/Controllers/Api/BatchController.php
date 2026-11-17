<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Obat;
use App\Support\Serializers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BatchController extends Controller
{
    public function index(Obat $obat): JsonResponse
    {
        $batches = $obat->batch()
            ->orderBy('tanggal_expired')
            ->orderBy('id')
            ->get()
            ->map(fn (Batch $batch) => Serializers::batch($batch))
            ->values();

        return response()->json(['data' => $batches]);
    }

    public function store(Request $request, Obat $obat): JsonResponse
    {
        $data = $request->validate([
            'nomor_batch' => [
                'required',
                'string',
                'max:50',
                Rule::unique('batch', 'nomor_batch')->where(
                    fn ($query) => $query->where('obat_id', $obat->id)
                ),
            ],
            'tanggal_expired' => ['required', 'date', 'after:today'],
            'qty' => ['required', 'integer', 'min:1'],
        ], [
            'nomor_batch.unique' => 'Nomor batch sudah dipakai untuk obat ini.',
            'tanggal_expired.after' => 'Tanggal expired harus lebih besar dari hari ini.',
        ]);

        $batch = $obat->batch()->create($data);

        return response()->json(Serializers::batch($batch), 201);
    }
}
