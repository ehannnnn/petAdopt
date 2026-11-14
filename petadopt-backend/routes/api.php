<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\FavoritController;
use App\Http\Controllers\HewanController;
use App\Http\Controllers\PengajuanController;
use App\Http\Controllers\ProfileController;
use App\Http\Middleware\EnsureRole;
use Illuminate\Support\Facades\Route;

// Publik
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

Route::get('meta', [HewanController::class, 'meta']);
Route::get('hewan', [HewanController::class, 'index']);
Route::get('hewan/{hewan}', [HewanController::class, 'show']);

// Harus login
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [ProfileController::class, 'show']);
    Route::put('me', [ProfileController::class, 'update']);
    Route::put('me/password', [ProfileController::class, 'updatePassword']);

    // Khusus calon adopter
    Route::middleware(EnsureRole::class.':adopter')->group(function () {
        Route::get('favorit', [FavoritController::class, 'index']);
        Route::post('favorit/{hewan}', [FavoritController::class, 'store']);
        Route::delete('favorit/{hewan}', [FavoritController::class, 'destroy']);

        Route::get('pengajuan', [PengajuanController::class, 'index']);
        Route::post('pengajuan', [PengajuanController::class, 'store']);
        Route::post('pengajuan/{pengajuan}/batal', [PengajuanController::class, 'batal']);
    });
});