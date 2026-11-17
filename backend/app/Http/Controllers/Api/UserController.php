<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\Serializers;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->orderBy('id')
            ->get()
            ->map(fn (User $user) => Serializers::user($user))
            ->values();

        return response()->json(['data' => $users]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'nama' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(['admin', 'apoteker', 'kasir'])],
        ]);

        $data['email'] = strtolower(trim($data['email']));
        $data['is_active'] = true;
        $user = User::create($data);

        return response()->json(Serializers::user($user), 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'nama' => ['sometimes', 'string', 'max:100'],
            'email' => [
                'sometimes',
                'email',
                'max:150',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => ['sometimes', 'string', 'min:8'],
            'role' => ['sometimes', Rule::in(['admin', 'apoteker', 'kasir'])],
        ]);

        if (array_key_exists('email', $data)) {
            $data['email'] = strtolower(trim($data['email']));
        }

        $user->update($data);

        return response()->json(Serializers::user($user));
    }

    public function nonaktif(User $user): JsonResponse
    {
        $user->update(['is_active' => false]);

        return response()->json(Serializers::user($user));
    }
}
