<?php

namespace Database\Seeders;

use App\Models\Obat;
use App\Models\User;
use App\Services\PenjualanService;
use App\Services\ResepService;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        if (User::query()->exists()) {
            return;
        }

        $admin = User::create([
            'nama' => 'Sri Wahyuni',
            'email' => 'sri.wahyuni@vitafarma.test',
            'password' => 'vitafarma123',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $apoteker = User::create([
            'nama' => 'Dr. Yoga Pratama, Apt.',
            'email' => 'yoga.pratama@vitafarma.test',
            'password' => 'vitafarma123',
            'role' => 'apoteker',
            'is_active' => true,
        ]);

        $kasir = User::create([
            'nama' => 'Dewi Lestari',
            'email' => 'dewi.lestari@vitafarma.test',
            'password' => 'vitafarma123',
            'role' => 'kasir',
            'is_active' => true,
        ]);

        User::create([
            'nama' => 'Rina Kusumawati, S.Farm.',
            'email' => 'rina.kusuma@vitafarma.test',
            'password' => 'vitafarma123',
            'role' => 'apoteker',
            'is_active' => false,
        ]);

        $obatRows = [
            ['OBT-00001', 'Paracetamol 500 mg', 'jadi', 'tablet', 1500, 50],
            ['OBT-00002', 'Amoxicillin 500 mg', 'jadi', 'kapsul', 3200, 40],
            ['OBT-00003', 'Vitamin C 500 mg', 'jadi', 'tablet', 2000, 30],
            ['OBT-00004', 'Salep Kulit Gentamicin 0,1%', 'jadi', 'tube', 18500, 5],
            ['OBT-00005', 'Bubuk Kafein Anhidrat', 'bahan_racikan', 'gram', 4000, 20],
            ['OBT-00006', 'Laktosa Monohidrat', 'bahan_racikan', 'gram', 500, 100],
            ['OBT-00007', 'Ibuprofen 400 mg', 'jadi', 'tablet', 1800, 40],
            ['OBT-00008', 'Cetirizine 10 mg', 'jadi', 'tablet', 1200, 30],
            ['OBT-00009', 'Omeprazole 20 mg', 'jadi', 'kapsul', 4500, 25],
            ['OBT-00010', 'Antasida DOEN', 'jadi', 'tablet', 800, 50],
            ['OBT-00011', 'Dexamethasone 0,5 mg', 'jadi', 'tablet', 900, 40],
            ['OBT-00012', 'Salbutamol 2 mg', 'jadi', 'tablet', 1500, 20],
            ['OBT-00013', 'Metformin 500 mg', 'jadi', 'tablet', 1000, 60],
            ['OBT-00014', 'Amlodipine 5 mg', 'jadi', 'tablet', 2500, 30],
            ['OBT-00015', 'Simvastatin 20 mg', 'jadi', 'tablet', 3000, 80],
            ['OBT-00016', 'Loratadine 10 mg', 'jadi', 'tablet', 2200, 20],
            ['OBT-00017', 'Povidone Iodine 10%', 'jadi', 'botol', 12500, 8],
            ['OBT-00018', 'Alkohol 70%', 'jadi', 'botol', 9000, 10],
            ['OBT-00019', 'Vitamin B Complex', 'jadi', 'tablet', 1700, 40],
            ['OBT-00020', 'Zinc 20 mg', 'jadi', 'tablet', 1300, 30],
            ['OBT-00021', 'Oralit', 'jadi', 'sachet', 2500, 30],
            ['OBT-00022', 'Minyak Kayu Putih', 'jadi', 'botol', 15000, 6],
            ['OBT-00023', 'Kasa Steril', 'jadi', 'pak', 4500, 15],
            ['OBT-00024', 'Plester Luka', 'jadi', 'kotak', 7000, 0],
            ['OBT-00025', 'Ekstrak Jahe', 'bahan_racikan', 'gram', 3000, 50],
            ['OBT-00026', 'Bubuk Pektin', 'bahan_racikan', 'gram', 500, 20],
            ['OBT-00027', 'Chlorpheniramine Maleate 4 mg', 'jadi', 'tablet', 900, 30],
            ['OBT-00028', 'Asam Mefenamat 500 mg', 'jadi', 'tablet', 2100, 30],
        ];

        $obatMap = [];

        foreach ($obatRows as [$kode, $nama, $jenis, $satuan, $harga, $stokMinimum]) {
            $obat = Obat::create([
                'kode_obat' => $kode,
                'nama_obat' => $nama,
                'jenis' => $jenis,
                'satuan' => $satuan,
                'harga_jual' => $harga,
                'stok_minimum' => $stokMinimum,
            ]);

            $obatMap[$kode] = $obat;
        }

        $batchRows = [
            ['OBT-00001', 'PCM2401A', '2026-03-31', 120],
            ['OBT-00001', 'PCM2402B', '2026-09-30', 300],
            ['OBT-00001', 'PCM2601C', '2027-03-31', 240],
            ['OBT-00001', 'PCM2602D', '2027-09-30', 180],
            ['OBT-00002', 'AMX2311C', '2025-12-31', 60],
            ['OBT-00002', 'AMX2405D', '2027-02-28', 80],
            ['OBT-00002', 'AMX2606E', '2027-06-30', 120],
            ['OBT-00003', 'VTC2509B', '2026-12-31', 60],
            ['OBT-00003', 'VTC2504A', '2027-04-30', 150],
            ['OBT-00004', 'SLG2302X', '2025-06-30', 3],
            ['OBT-00004', 'SLG2508A', '2027-08-31', 12],
            ['OBT-00004', 'SLG2601B', '2028-01-31', 8],
            ['OBT-00005', 'KAF2503A', '2027-03-31', 500],
            ['OBT-00005', 'KAF2509B', '2027-09-30', 300],
            ['OBT-00006', 'LAK2502A', '2028-02-28', 1000],
            ['OBT-00006', 'LAK2602B', '2028-08-31', 600],
            ['OBT-00007', 'IBU2601A', '2027-01-31', 200],
            ['OBT-00007', 'IBU2605B', '2028-05-31', 150],
            ['OBT-00008', 'CET2604A', '2027-04-30', 180],
            ['OBT-00008', 'CET2608B', '2028-08-31', 200],
            ['OBT-00009', 'OMP2507A', '2027-07-31', 22],
            ['OBT-00010', 'ANT2401X', '2025-10-31', 20],
            ['OBT-00010', 'ANT2603A', '2027-03-31', 160],
            ['OBT-00011', 'DEX2505A', '2027-05-31', 35],
            ['OBT-00012', 'SLB2602A', '2027-02-28', 90],
            ['OBT-00013', 'MET2601A', '2027-01-31', 400],
            ['OBT-00014', 'AML2608A', '2028-08-31', 120],
            ['OBT-00015', 'SIM2509A', '2027-09-30', 75],
            ['OBT-00016', 'LOR2603A', '2027-03-31', 80],
            ['OBT-00017', 'PVI2402Y', '2026-02-28', 2],
            ['OBT-00017', 'PVI2507A', '2027-07-31', 6],
            ['OBT-00018', 'ALK2604A', '2027-04-30', 30],
            ['OBT-00019', 'VBC2608A', '2028-08-31', 150],
            ['OBT-00020', 'ZNC2506A', '2027-06-30', 90],
            ['OBT-00021', 'ORL2605A', '2027-05-31', 30],
            ['OBT-00022', 'MKP2509A', '2027-09-30', 4],
            ['OBT-00023', 'KSA2601A', '2027-01-31', 15],
            ['OBT-00024', 'PLS2606A', '2027-06-30', 40],
            ['OBT-00025', 'JAH2602A', '2028-02-29', 80],
            ['OBT-00026', 'PEK2508A', '2027-08-31', 40],
            ['OBT-00027', 'CHL2604A', '2027-04-30', 100],
            ['OBT-00028', 'MEF2603A', '2027-03-31', 90],
        ];

        foreach ($batchRows as [$kodeObat, $nomorBatch, $tanggalExpired, $qty]) {
            $obatMap[$kodeObat]->batch()->create([
                'nomor_batch' => $nomorBatch,
                'tanggal_expired' => $tanggalExpired,
                'qty' => $qty,
            ]);
        }

        $tambahanObat = [
            ['OBT-00029', 'Ambroxol 30 mg', 'jadi', 'tablet', 1200, 20, 'AMB2608A', '2027-08-31', 220],
            ['OBT-00030', 'Dextromethorphan 15 mg', 'jadi', 'tablet', 1500, 20, 'DMP2609A', '2027-09-30', 180],
            ['OBT-00031', 'Guaifenesin 100 mg', 'jadi', 'tablet', 1300, 20, 'GUA2607A', '2027-07-31', 160],
            ['OBT-00032', 'Paracetamol Sirup 120 mg/5 ml', 'jadi', 'botol', 18500, 10, 'PCS2605A', '2027-05-31', 40],
            ['OBT-00033', 'Amoxicillin Sirup 125 mg/5 ml', 'jadi', 'botol', 22000, 10, 'AMS2604A', '2027-04-30', 35],
            ['OBT-00034', 'Azithromycin 500 mg', 'jadi', 'tablet', 8500, 15, 'AZI2606A', '2027-06-30', 90],
            ['OBT-00035', 'Ciprofloxacin 500 mg', 'jadi', 'tablet', 2500, 20, 'CIP2603A', '2027-03-31', 100],
            ['OBT-00036', 'Metronidazole 500 mg', 'jadi', 'tablet', 1800, 20, 'MTR2608A', '2027-08-31', 120],
            ['OBT-00037', 'Domperidone 10 mg', 'jadi', 'tablet', 2200, 20, 'DOM2606A', '2027-06-30', 100],
            ['OBT-00038', 'Loperamide 2 mg', 'jadi', 'tablet', 1200, 20, 'LOP2607A', '2027-07-31', 80],
            ['OBT-00039', 'Simethicone 80 mg', 'jadi', 'tablet', 1500, 20, 'SMT2604A', '2027-04-30', 90],
            ['OBT-00040', 'Bisacodyl 5 mg', 'jadi', 'tablet', 1300, 20, 'BIS2609A', '2027-09-30', 70],
            ['OBT-00041', 'Sucralfate 500 mg', 'jadi', 'tablet', 3500, 15, 'SUC2605A', '2027-05-31', 80],
            ['OBT-00042', 'Ondansetron 4 mg', 'jadi', 'tablet', 4500, 10, 'OND2608A', '2027-08-31', 50],
            ['OBT-00043', 'Captopril 25 mg', 'jadi', 'tablet', 900, 30, 'CAP2607A', '2027-07-31', 150],
            ['OBT-00044', 'Valsartan 80 mg', 'jadi', 'tablet', 3200, 20, 'VAL2606A', '2027-06-30', 90],
            ['OBT-00045', 'Hydrochlorothiazide 25 mg', 'jadi', 'tablet', 800, 30, 'HCT2604A', '2027-04-30', 120],
            ['OBT-00046', 'Glimepiride 2 mg', 'jadi', 'tablet', 2100, 20, 'GLM2605A', '2027-05-31', 80],
            ['OBT-00047', 'Vitamin D3 1000 IU', 'jadi', 'tablet', 2500, 30, 'VD32609A', '2027-09-30', 150],
            ['OBT-00048', 'Multivitamin', 'jadi', 'tablet', 3000, 40, 'MVT2608A', '2027-08-31', 200],
            ['OBT-00049', 'Kalsium Laktat 500 mg', 'jadi', 'tablet', 1800, 30, 'CAL2607A', '2027-07-31', 150],
            ['OBT-00050', 'Tablet Tambah Darah', 'jadi', 'tablet', 1200, 40, 'TTD2606A', '2027-06-30', 200],
            ['OBT-00051', 'Omega-3 1000 mg', 'jadi', 'kapsul', 4500, 20, 'OMG2609A', '2027-09-30', 80],
            ['OBT-00052', 'Hidrokortison 1% Krim', 'jadi', 'tube', 15000, 8, 'HID2605A', '2027-05-31', 30],
            ['OBT-00053', 'Ketokonazol 2% Krim', 'jadi', 'tube', 18000, 8, 'KET2607A', '2027-07-31', 25],
            ['OBT-00054', 'Betametason 1% Krim', 'jadi', 'tube', 16000, 8, 'BET2604A', '2027-04-30', 28],
            ['OBT-00055', 'Chlorhexidine 0,05%', 'jadi', 'botol', 11000, 10, 'CHX2608A', '2027-08-31', 35],
            ['OBT-00056', 'Masker Medis 3 Ply', 'jadi', 'kotak', 25000, 10, 'MSK2606A', '2027-06-30', 40],
            ['OBT-00057', 'Perban Elastis 10 cm', 'jadi', 'rol', 12000, 10, 'PBN2605A', '2027-05-31', 30],
            ['OBT-00058', 'Kapas Steril 50 gram', 'jadi', 'pak', 8000, 15, 'KPS2607A', '2027-07-31', 60],
            ['OBT-00059', 'Amilum Manihot', 'bahan_racikan', 'gram', 400, 200, 'AMI2609A', '2027-09-30', 1000],
            ['OBT-00060', 'Sukrosa', 'bahan_racikan', 'gram', 300, 200, 'SUK2609A', '2027-09-30', 1000],
            ['OBT-00061', 'Magnesium Stearat', 'bahan_racikan', 'gram', 800, 100, 'MGS2608A', '2027-08-31', 500],
            ['OBT-00062', 'Talkum Farmasi', 'bahan_racikan', 'gram', 500, 100, 'TLK2608A', '2027-08-31', 500],
        ];

        foreach ($tambahanObat as [$kode, $nama, $jenis, $satuan, $harga, $stokMinimum, $nomorBatch, $tanggalExpired, $qty]) {
            $obat = Obat::create([
                'kode_obat' => $kode,
                'nama_obat' => $nama,
                'jenis' => $jenis,
                'satuan' => $satuan,
                'harga_jual' => $harga,
                'stok_minimum' => $stokMinimum,
            ]);

            $obat->batch()->create([
                'nomor_batch' => $nomorBatch,
                'tanggal_expired' => $tanggalExpired,
                'qty' => $qty,
            ]);

            $obatMap[$kode] = $obat;
        }

        $penjualan = app(PenjualanService::class);
        $resepService = app(ResepService::class);

        $penjualan->create([
            ['obat_id' => $obatMap['OBT-00003']->id, 'jumlah' => 4],
        ], 10000, $kasir->id);

        $resepService->create([
            'nama_pasien' => 'Bambang Hartono',
            'nomor_rm' => 'RM-004521',
            'nama_dokter' => 'dr. Anisa Rahayu',
            'nomor_sip' => 'SIP-446/0912/DU/2024',
            'jenis' => 'jadi',
            'items' => [
                [
                    'obat_id' => $obatMap['OBT-00002']->id,
                    'jumlah' => 15,
                    'aturan_pakai' => '3 kali sehari 1 kapsul',
                ],
            ],
        ], $apoteker->id);

        $resepService->create([
            'nama_pasien' => 'Siti Maimunah',
            'nomor_rm' => null,
            'nama_dokter' => 'dr. Fajar Nugroho',
            'nomor_sip' => null,
            'jenis' => 'racikan',
            'nama_racikan' => 'Puyer Anak',
            'aturan_pakai' => '3 kali sehari 1 bungkus',
            'items' => [
                ['obat_id' => $obatMap['OBT-00006']->id, 'jumlah' => 60],
                ['obat_id' => $obatMap['OBT-00005']->id, 'jumlah' => 2],
            ],
        ], $apoteker->id);

        $resepDitebus = $resepService->create([
            'nama_pasien' => 'Nur Aisyah',
            'nomor_rm' => 'RM-004530',
            'nama_dokter' => 'dr. Fajar Nugroho',
            'nomor_sip' => 'SIP-447/0913/DU/2024',
            'jenis' => 'jadi',
            'items' => [
                [
                    'obat_id' => $obatMap['OBT-00003']->id,
                    'jumlah' => 10,
                    'aturan_pakai' => '2 kali sehari 1 tablet',
                ],
                [
                    'obat_id' => $obatMap['OBT-00001']->id,
                    'jumlah' => 6,
                    'aturan_pakai' => '3 kali sehari 1 tablet',
                ],
            ],
        ], $apoteker->id);

        $resepService->redeem($resepDitebus, 50000, $apoteker->id);

        $penjualan->create([
            ['obat_id' => $obatMap['OBT-00007']->id, 'jumlah' => 10],
            ['obat_id' => $obatMap['OBT-00010']->id, 'jumlah' => 10],
        ], 30000, $kasir->id);
    }
}
