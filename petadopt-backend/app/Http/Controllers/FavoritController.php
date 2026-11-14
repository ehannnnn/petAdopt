<?php

namespace App\Http\Controllers;

use App\Http\Resources\HewanResource;
use App\Models\Hewan;
use Illuminate\Http\Request;

class FavoritController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $request->attributes->set('favorit_ids', $user->favorit()->pluck('hewans.id')->all());

        return HewanResource::collection(
            $user->favorit()->with(['foto', 'shelter'])->latest('favorits.created_at')->get()
        );
    }

    public function store(Request $request, Hewan $hewan)
    {
        // Tambahkan kalau belum ada, tidak membuat data ganda
        $request->user()->favorit()->syncWithoutDetaching([$hewan->id]);

        return response()->json(['message' => 'Ditambahkan ke favorit.'], 201);
    }

    public function destroy(Request $request, Hewan $hewan)
    {
        $request->user()->favorit()->detach($hewan->id);

        return response()->json(['message' => 'Dihapus dari favorit.']);
    }
}