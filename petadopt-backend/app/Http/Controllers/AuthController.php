<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'role' => ['required', 'in:adopter,admin_shelter'],
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['required', 'string', 'max:20'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
            'alamat' => ['required_if:role,adopter', 'nullable', 'string', 'max:500'],
            'shelter_nama' => ['required_if:role,admin_shelter', 'nullable', 'string', 'max:100'],
            'shelter_kota' => ['required_if:role,admin_shelter', 'nullable', 'string', 'max:100'],
            'shelter_alamat' => ['required_if:role,admin_shelter', 'nullable', 'string', 'max:500'],
            'shelter_deskripsi' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = DB::transaction(function () use ($data) {
            $isShelter = $data['role'] === 'admin_shelter';

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'alamat' => $isShelter ? $data['shelter_alamat'] : $data['alamat'],
                'role' => $data['role'],
                'password' => $data['password'],
            ]);

            if ($isShelter) {
                $user->shelter()->create([
                    'nama' => $data['shelter_nama'],
                    'kota' => $data['shelter_kota'],
                    'alamat' => $data['shelter_alamat'],
                    'telepon' => $data['phone'],
                    'deskripsi' => $data['shelter_deskripsi'] ?? null,
                ]);
            }

            return $user;
        });

        return $this->tokenResponse($user, 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau kata sandi salah.'],
            ]);
        }

        return $this->tokenResponse($user);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Berhasil keluar.']);
    }

    public function forgotPassword(Request $request)
{
    $data = $request->validate(['email' => ['required', 'email']]);

    Password::sendResetLink($data);

    // Jawaban selalu sama, baik email terdaftar maupun tidak
    return response()->json(['message' => 'Tautan telah dikirim jika email terdaftar.']);
}

    public function resetPassword(Request $request)
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(8)],
        ]);

        $status = Password::reset($data, function (User $user, string $password) {
            $user->forceFill(['password' => $password])->save();
            $user->tokens()->delete(); // cabut semua token login lama
            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => ['Tautan tidak valid atau sudah kedaluwarsa.'],
            ]);
        }

        return response()->json(['message' => 'Kata sandi berhasil diperbarui.']);
    }

    private function tokenResponse(User $user, int $status = 200)
    {
        return response()->json([
            'token' => $user->createToken('web')->plainTextToken,
            'user' => $user->load('shelter'),
        ], $status);
    }
}