<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BatchController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ObatController;
use App\Http\Controllers\Api\ResepController;
use App\Http\Controllers\Api\StokController;
use App\Http\Controllers\Api\TransaksiController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'active'])->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/dashboard', DashboardController::class);
    Route::get('/stok', [StokController::class, 'index']);

    Route::get('/transaksi', [TransaksiController::class, 'index']);
    Route::get('/transaksi/{transaksi}', [TransaksiController::class, 'show']);

    Route::middleware('role:admin,kasir')->group(function () {
        Route::post('/transaksi/penjualan', [TransaksiController::class, 'penjualan']);
    });

    Route::middleware('role:admin,apoteker')->group(function () {
        Route::get('/obat', [ObatController::class, 'index']);
        Route::post('/obat', [ObatController::class, 'store']);
        Route::get('/obat/{obat}', [ObatController::class, 'show']);
        Route::put('/obat/{obat}', [ObatController::class, 'update']);

        Route::get('/obat/{obat}/batch', [BatchController::class, 'index']);
        Route::post('/obat/{obat}/batch', [BatchController::class, 'store']);

        Route::get('/resep', [ResepController::class, 'index']);
        Route::post('/resep', [ResepController::class, 'store']);
        Route::get('/resep/{resep}', [ResepController::class, 'show']);
        Route::post('/resep/{resep}/tebus', [ResepController::class, 'tebus']);
    });

    Route::middleware('role:admin')->group(function () {
        Route::get('/pengguna', [UserController::class, 'index']);
        Route::post('/pengguna', [UserController::class, 'store']);
        Route::put('/pengguna/{user}', [UserController::class, 'update']);
        Route::patch('/pengguna/{user}/nonaktif', [UserController::class, 'nonaktif']);
    });
});
