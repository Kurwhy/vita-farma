<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_active) {
            $user?->currentAccessToken()?->delete();

            return response()->json([
                'message' => 'Sesi tidak valid. Silakan masuk kembali.',
            ], 401);
        }

        return $next($request);
    }
}
