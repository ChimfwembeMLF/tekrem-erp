<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CodeImageController extends Controller
{
    public function qr(Request $request): Response
    {
        $validated = $request->validate([
            'data' => 'required|string|max:2000',
            'size' => 'nullable|integer|min:80|max:400',
        ]);

        $size = (int) ($validated['size'] ?? 160);

        $png = QrCode::format('png')
            ->size($size)
            ->margin(1)
            ->errorCorrection('M')
            ->generate($validated['data']);

        return response($png, 200, [
            'Content-Type' => 'image/png',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
