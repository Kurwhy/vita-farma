<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Obat;
use App\Services\CodeService;
use App\Support\Serializers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ObatController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:150'],
            'jenis' => ['nullable', Rule::in(['jadi', 'bahan_racikan'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $perPage = (int) ($filters['per_page'] ?? 20);

        $paginator = Obat::query()
            ->when(isset($filters['search']) && trim($filters['search']) !== '', function ($query) use ($filters) {
                $term = '%'.trim($filters['search']).'%';
                $query->where(function ($builder) use ($term) {
                    $builder->where('nama_obat', 'like', $term)
                        ->orWhere('kode_obat', 'like', $term);
                });
            })
            ->when(isset($filters['jenis']), fn ($query) => $query->where('jenis', $filters['jenis']))
            ->orderBy('kode_obat')
            ->paginate($perPage)
            ->through(fn (Obat $obat) => Serializers::obat($obat));

        return response()->json($paginator);
    }

    public function store(Request $request, CodeService $codes): JsonResponse
    {
        $data = $this->validated($request);

        $obat = DB::transaction(function () use ($data, $codes) {
            return Obat::create([
                ...$data,
                'kode_obat' => $codes->nextObat(),
            ]);
        });

        return response()->json(Serializers::obat($obat), 201);
    }

    public function show(Obat $obat): JsonResponse
    {
        return response()->json(Serializers::obat($obat));
    }

    public function update(Request $request, Obat $obat): JsonResponse
    {
        $obat->update($this->validated($request));

        return response()->json(Serializers::obat($obat));
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'nama_obat' => ['required', 'string', 'max:150'],
            'jenis' => ['required', Rule::in(['jadi', 'bahan_racikan'])],
            'satuan' => ['required', 'string', 'max:30'],
            'harga_jual' => ['required', 'numeric', 'min:0', 'decimal:0,2'],
            'stok_minimum' => ['required', 'integer', 'min:0'],
        ]);
    }
}
