<?php

namespace Tests\Feature;

use App\Models\Batch;
use App\Models\Obat;
use App\Models\Transaksi;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class VitafarmaApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    private function user(string $email): User
    {
        return User::query()->where('email', $email)->firstOrFail();
    }

    private function admin(): User
    {
        return $this->user('sri.wahyuni@vitafarma.test');
    }

    private function apoteker(): User
    {
        return $this->user('yoga.pratama@vitafarma.test');
    }

    private function kasir(): User
    {
        return $this->user('dewi.lestari@vitafarma.test');
    }

    private function resetAuth(): void
    {
        $this->flushHeaders();
        $this->app['auth']->forgetGuards();
    }

    public function test_login_inactive_account_and_role_restrictions(): void
    {
        $login = $this->postJson('/api/v1/login', [
            'email' => 'sri.wahyuni@vitafarma.test',
            'password' => 'vitafarma123',
        ]);

        $login->assertOk()->assertJsonStructure(['token', 'user']);
        $token = $login->json('token');

        $this->withToken($token)->getJson('/api/v1/me')
            ->assertOk()
            ->assertJsonPath('user.role', 'admin');

        $this->resetAuth();
        $this->getJson('/api/v1/dashboard')->assertUnauthorized();

        $this->postJson('/api/v1/login', [
            'email' => 'rina.kusuma@vitafarma.test',
            'password' => 'vitafarma123',
        ])->assertForbidden()->assertJsonPath(
            'message',
            'Akun ini nonaktif. Hubungi Admin untuk mengaktifkan.'
        );

        Sanctum::actingAs($this->kasir());
        $this->getJson('/api/v1/obat')->assertForbidden();
        $this->getJson('/api/v1/resep')->assertForbidden();
        $this->getJson('/api/v1/pengguna')->assertForbidden();
        $this->getJson('/api/v1/stok')->assertOk();
        $this->getJson('/api/v1/transaksi')->assertOk();

        Sanctum::actingAs($this->apoteker());
        $this->getJson('/api/v1/pengguna')->assertForbidden();
        $this->postJson('/api/v1/transaksi/penjualan', [
            'items' => [['obat_id' => 1, 'jumlah' => 1]],
            'uang_diterima' => 10000,
        ])->assertForbidden();
        $this->getJson('/api/v1/resep')->assertOk();
    }

    public function test_stock_report_and_dashboard_minimum(): void
    {
        Sanctum::actingAs($this->admin());

        $stok = $this->getJson('/api/v1/stok')->assertOk();
        $rows = collect($stok->json('data'));

        $amoxicillin = $rows->firstWhere('kode_obat', 'OBT-00002');
        $this->assertNotNull($amoxicillin);
        $this->assertSame(60, $amoxicillin['stok_expired']);
        $this->assertCount(2, $amoxicillin['batch_tersedia']);
        $this->assertTrue(collect($amoxicillin['batch_tersedia'])->every(
            fn (array $batch) => $batch['status'] === 'tersedia'
        ));

        $expired = collect($stok->json('batch_expired'));
        $expiredAmoxicillin = $expired->firstWhere('nomor_batch', 'AMX2311C');
        $this->assertNotNull($expiredAmoxicillin);
        $this->assertSame('expired', $expiredAmoxicillin['status']);
        $this->assertSame('OBT-00002', $expiredAmoxicillin['obat']['kode_obat']);

        $dashboard = $this->getJson('/api/v1/dashboard')->assertOk();
        $this->assertSame(3, $dashboard->json('jumlah_transaksi'));
        $this->assertSame(63000.0, (float) $dashboard->json('total_penjualan'));

        $lowStock = collect($dashboard->json('stok_minimum'));
        $this->assertCount(7, $lowStock);
        $this->assertSame('OBT-00011', $lowStock->first()['kode_obat']);
        $this->assertTrue($lowStock->every(
            fn (array $row) => $row['stok_minimum'] > 0
                && $row['stok_siap_jual'] <= $row['stok_minimum']
        ));
        $this->assertNull($lowStock->firstWhere('kode_obat', 'OBT-00024'));
    }

    public function test_fefo_sale_uses_nearest_batch_and_skips_expired(): void
    {
        Sanctum::actingAs($this->kasir());
        $amoxicillin = Obat::query()->where('kode_obat', 'OBT-00002')->firstOrFail();

        $sale = $this->postJson('/api/v1/transaksi/penjualan', [
            'items' => [['obat_id' => $amoxicillin->id, 'jumlah' => 100]],
            'uang_diterima' => 350000,
        ])->assertCreated();

        $this->assertStringStartsWith('TRX-', $sale->json('kode_transaksi'));
        $this->assertSame(320000.0, (float) $sale->json('total'));
        $this->assertSame(30000.0, (float) $sale->json('kembalian'));

        $detail = $this->getJson('/api/v1/transaksi/'.$sale->json('id'))->assertOk();
        $usedBatches = collect($detail->json('items'))
            ->map(fn (array $item) => $item['batch']['nomor_batch'])
            ->values()
            ->all();

        $this->assertSame(['AMX2405D', 'AMX2606E'], $usedBatches);
        $this->assertNotContains('AMX2311C', $usedBatches);

        $this->assertDatabaseHas('batch', [
            'nomor_batch' => 'AMX2405D',
            'qty' => 0,
        ]);
        $this->assertDatabaseHas('batch', [
            'nomor_batch' => 'AMX2311C',
            'qty' => 60,
        ]);
    }

    public function test_sale_rejects_invalid_requests_without_partial_stock_deduction(): void
    {
        Sanctum::actingAs($this->kasir());
        $paracetamol = Obat::query()->where('kode_obat', 'OBT-00001')->firstOrFail();
        $amoxicillin = Obat::query()->where('kode_obat', 'OBT-00002')->firstOrFail();
        $bahan = Obat::query()->where('jenis', 'bahan_racikan')->firstOrFail();

        $before = Batch::query()
            ->where('obat_id', $paracetamol->id)
            ->orderBy('id')
            ->pluck('qty', 'id')
            ->all();

        $this->postJson('/api/v1/transaksi/penjualan', [
            'items' => [
                ['obat_id' => $paracetamol->id, 'jumlah' => 2],
                ['obat_id' => $amoxicillin->id, 'jumlah' => 999999],
            ],
            'uang_diterima' => 999999999,
        ])->assertStatus(422)->assertJsonPath(
            'errors.stok.0',
            'Stok siap jual Amoxicillin 500 mg tidak mencukupi. Kurangi jumlah atau periksa batch lain.'
        );

        $after = Batch::query()
            ->where('obat_id', $paracetamol->id)
            ->orderBy('id')
            ->pluck('qty', 'id')
            ->all();

        $this->assertSame($before, $after);
        $this->assertSame(3, Transaksi::query()->count());

        $this->postJson('/api/v1/transaksi/penjualan', [
            'items' => [['obat_id' => $bahan->id, 'jumlah' => 1]],
            'uang_diterima' => 10000,
        ])->assertStatus(422);

        $this->postJson('/api/v1/transaksi/penjualan', [
            'items' => [['obat_id' => $paracetamol->id, 'jumlah' => 1]],
            'uang_diterima' => 1000,
        ])->assertStatus(422);

        $this->postJson('/api/v1/transaksi/penjualan', [
            'items' => [],
            'uang_diterima' => 10000,
        ])->assertStatus(422);
    }

    public function test_resep_rules_and_single_transaction_redemption(): void
    {
        Sanctum::actingAs($this->apoteker());
        $paracetamol = Obat::query()->where('kode_obat', 'OBT-00001')->firstOrFail();
        $laktosa = Obat::query()->where('kode_obat', 'OBT-00006')->firstOrFail();
        $kafein = Obat::query()->where('kode_obat', 'OBT-00005')->firstOrFail();

        $this->postJson('/api/v1/resep', [
            'nama_pasien' => 'Duplikat',
            'nama_dokter' => 'dr. Fajar Nugroho',
            'jenis' => 'jadi',
            'items' => [
                ['obat_id' => $paracetamol->id, 'jumlah' => 1],
                ['obat_id' => $paracetamol->id, 'jumlah' => 2],
            ],
        ])->assertStatus(422);

        $this->postJson('/api/v1/resep', [
            'nama_pasien' => 'Racikan Salah',
            'nama_dokter' => 'dr. Fajar Nugroho',
            'jenis' => 'racikan',
            'nama_racikan' => 'Racikan Salah',
            'aturan_pakai' => '1 kali sehari',
            'items' => [['obat_id' => $paracetamol->id, 'jumlah' => 1]],
        ])->assertStatus(422);

        $resep = $this->postJson('/api/v1/resep', [
            'nama_pasien' => 'Rahmat Hidayat',
            'nomor_rm' => 'RM-999001',
            'nama_dokter' => 'dr. Anisa Rahayu',
            'nomor_sip' => 'SIP-999',
            'jenis' => 'jadi',
            'items' => [
                [
                    'obat_id' => $paracetamol->id,
                    'jumlah' => 5,
                    'aturan_pakai' => '3 kali sehari 1 tablet',
                ],
            ],
        ])->assertCreated();

        $resepId = $resep->json('resep.id');
        $this->assertStringStartsWith('RSP-', $resep->json('resep.kode_resep'));
        $this->assertSame('menunggu', $resep->json('resep.status'));

        $tebus = $this->postJson('/api/v1/resep/'.$resepId.'/tebus', [
            'uang_diterima' => 10000,
        ])->assertCreated();

        $this->assertSame($resepId, $tebus->json('resep_id'));
        $this->assertSame(7500.0, (float) $tebus->json('total'));
        $this->assertSame(1, Transaksi::query()->where('resep_id', $resepId)->count());
        $this->assertDatabaseHas('resep', ['id' => $resepId, 'status' => 'ditebus']);

        $this->postJson('/api/v1/resep/'.$resepId.'/tebus', [
            'uang_diterima' => 10000,
        ])->assertStatus(422)->assertJsonPath(
            'errors.resep.0',
            'Resep ini sudah ditebus dan tidak dapat ditebus ulang.'
        );

        $racikan = $this->postJson('/api/v1/resep', [
            'nama_pasien' => 'Siti Maimunah',
            'nama_dokter' => 'dr. Fajar Nugroho',
            'jenis' => 'racikan',
            'nama_racikan' => 'Puyer Anak',
            'aturan_pakai' => '3 kali sehari 1 bungkus',
            'items' => [
                ['obat_id' => $laktosa->id, 'jumlah' => 60],
                ['obat_id' => $kafein->id, 'jumlah' => 2],
            ],
        ])->assertCreated();

        $this->postJson('/api/v1/resep/'.$racikan->json('resep.id').'/tebus', [
            'uang_diterima' => 200000,
        ])->assertCreated();
    }

    public function test_insufficient_resep_redemption_rolls_back(): void
    {
        Sanctum::actingAs($this->apoteker());
        $laktosa = Obat::query()->where('kode_obat', 'OBT-00006')->firstOrFail();

        $before = Batch::query()
            ->where('obat_id', $laktosa->id)
            ->orderBy('id')
            ->pluck('qty', 'id')
            ->all();

        $resep = $this->postJson('/api/v1/resep', [
            'nama_pasien' => 'Lina Marlina',
            'nama_dokter' => 'dr. Anisa Rahayu',
            'jenis' => 'racikan',
            'nama_racikan' => 'Puyer Batuk',
            'aturan_pakai' => '2 kali sehari 1 bungkus',
            'items' => [['obat_id' => $laktosa->id, 'jumlah' => 5000]],
        ])->assertCreated();

        $resepId = $resep->json('resep.id');

        $this->postJson('/api/v1/resep/'.$resepId.'/tebus', [
            'uang_diterima' => 9999999,
        ])->assertStatus(422)->assertJsonPath(
            'errors.stok.0',
            'Stok siap jual Laktosa Monohidrat tidak mencukupi. Kurangi jumlah atau periksa batch lain.'
        );

        $after = Batch::query()
            ->where('obat_id', $laktosa->id)
            ->orderBy('id')
            ->pluck('qty', 'id')
            ->all();

        $this->assertSame($before, $after);
        $this->assertDatabaseHas('resep', ['id' => $resepId, 'status' => 'menunggu']);
        $this->assertSame(0, Transaksi::query()->where('resep_id', $resepId)->count());
    }

    public function test_batch_validation_and_status(): void
    {
        Sanctum::actingAs($this->apoteker());
        $paracetamol = Obat::query()->where('kode_obat', 'OBT-00001')->firstOrFail();

        $this->postJson('/api/v1/obat/'.$paracetamol->id.'/batch', [
            'nomor_batch' => 'TST001',
            'tanggal_expired' => now()->toDateString(),
            'qty' => 10,
        ])->assertStatus(422);

        $this->postJson('/api/v1/obat/'.$paracetamol->id.'/batch', [
            'nomor_batch' => 'TST001',
            'tanggal_expired' => now()->addDay()->toDateString(),
            'qty' => 10,
        ])->assertCreated()->assertJsonPath('status', 'tersedia');

        $this->postJson('/api/v1/obat/'.$paracetamol->id.'/batch', [
            'nomor_batch' => 'TST001',
            'tanggal_expired' => now()->addDay()->toDateString(),
            'qty' => 10,
        ])->assertStatus(422)->assertJsonPath(
            'errors.nomor_batch.0',
            'Nomor batch sudah dipakai untuk obat ini.'
        );

        $batches = $this->getJson('/api/v1/obat/'.$paracetamol->id.'/batch')->assertOk();
        $expired = collect($batches->json('data'))->firstWhere('nomor_batch', 'PCM2401A');
        $this->assertSame('expired', $expired['status']);
    }

    public function test_obat_and_user_validation(): void
    {
        Sanctum::actingAs($this->apoteker());

        $maxSequence = Obat::query()
            ->pluck('kode_obat')
            ->map(fn (string $kode) => (int) substr($kode, 4))
            ->max();
        $expectedCode = 'OBT-'.str_pad((string) ($maxSequence + 1), 5, '0', STR_PAD_LEFT);

        $obat = $this->postJson('/api/v1/obat', [
            'nama_obat' => 'Ambroxol 30 mg',
            'jenis' => 'jadi',
            'satuan' => 'tablet',
            'harga_jual' => 1200,
            'stok_minimum' => 20,
        ])->assertCreated();

        $this->assertSame($expectedCode, $obat->json('kode_obat'));

        $this->postJson('/api/v1/obat', [
            'nama_obat' => 'Harga Salah',
            'jenis' => 'jadi',
            'satuan' => 'tablet',
            'harga_jual' => -1,
            'stok_minimum' => 0,
        ])->assertStatus(422);

        Sanctum::actingAs($this->admin());
        $user = $this->postJson('/api/v1/pengguna', [
            'nama' => 'Ahmad Fauzi',
            'email' => 'ahmad.fauzi@vitafarma.test',
            'password' => 'vitafarma123',
            'role' => 'kasir',
        ])->assertCreated();

        $this->assertTrue($user->json('is_active'));

        $this->postJson('/api/v1/pengguna', [
            'nama' => 'Duplikat',
            'email' => 'ahmad.fauzi@vitafarma.test',
            'password' => 'vitafarma123',
            'role' => 'kasir',
        ])->assertStatus(422);

        $this->postJson('/api/v1/pengguna', [
            'nama' => 'Pendek',
            'email' => 'pendek@vitafarma.test',
            'password' => '1234567',
            'role' => 'kasir',
        ])->assertStatus(422);

        $this->putJson('/api/v1/pengguna/'.$user->json('id'), ['role' => 'admin'])
            ->assertOk()
            ->assertJsonPath('role', 'admin');

        $this->patchJson('/api/v1/pengguna/'.$user->json('id').'/nonaktif')
            ->assertOk()
            ->assertJsonPath('is_active', false);

        $this->postJson('/api/v1/login', [
            'email' => 'ahmad.fauzi@vitafarma.test',
            'password' => 'vitafarma123',
        ])->assertForbidden();
    }

    public function test_pagination_and_transaction_list(): void
    {
        Sanctum::actingAs($this->admin());

        $totalObat = Obat::query()->count();

        $this->getJson('/api/v1/obat')
            ->assertOk()
            ->assertJsonPath('per_page', 20)
            ->assertJsonPath('total', $totalObat)
            ->assertJsonCount(20, 'data');

        $this->getJson('/api/v1/obat?page=2')
            ->assertOk()
            ->assertJsonPath('current_page', 2)
            ->assertJsonCount(min(20, $totalObat - 20), 'data');

        $this->getJson('/api/v1/resep')
            ->assertOk()
            ->assertJsonPath('per_page', 20);

        $this->getJson('/api/v1/transaksi')
            ->assertOk()
            ->assertJsonPath('per_page', 20)
            ->assertJsonStructure(['data' => [['kode_transaksi', 'total', 'resep_kode']]]);
    }

    public function test_logout_and_deactivated_token_are_revoked(): void
    {
        $login = $this->postJson('/api/v1/login', [
            'email' => 'dewi.lestari@vitafarma.test',
            'password' => 'vitafarma123',
        ])->assertOk();

        $token = $login->json('token');

        $this->withToken($token)->postJson('/api/v1/logout')->assertOk();
        $this->resetAuth();
        $this->withToken($token)->getJson('/api/v1/me')->assertUnauthorized();

        $user = User::create([
            'nama' => 'Kasir Sementara',
            'email' => 'kasir.sementara@vitafarma.test',
            'password' => 'vitafarma123',
            'role' => 'kasir',
            'is_active' => true,
        ]);

        $secondLogin = $this->postJson('/api/v1/login', [
            'email' => 'kasir.sementara@vitafarma.test',
            'password' => 'vitafarma123',
        ])->assertOk();

        Sanctum::actingAs($this->admin());
        $this->patchJson('/api/v1/pengguna/'.$user->id.'/nonaktif')->assertOk();

        $this->resetAuth();
        $this->withToken($secondLogin->json('token'))->getJson('/api/v1/me')->assertUnauthorized();

        $this->assertSame(0, DB::table('personal_access_tokens')->count());
    }

    public function test_cors_allows_configured_frontend_origin(): void
    {
        $response = $this->call('OPTIONS', '/api/v1/dashboard', [], [], [], [
            'HTTP_ORIGIN' => 'http://localhost:5173',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
        ]);

        $response->assertStatus(204);
        $response->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
    }
}
