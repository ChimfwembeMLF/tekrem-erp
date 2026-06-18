<?php

namespace App\Http\Controllers\POS;

use App\Http\Controllers\Controller;
use App\Exceptions\InsufficientStockException;
use App\Models\Inventory\Product;
use App\Models\POS\PosRegister;
use App\Models\Finance\MomoTransaction;
use App\Models\POS\PosSession;
use App\Services\MoMo\MomoTransactionService;
use App\Services\POS\PosService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class PosController extends Controller
{
    public function __construct(
        private PosService $posService,
        private MomoTransactionService $momoTransactionService,
    ) {}

    public function index()
    {
        $user = auth()->user();

        return Inertia::render('POS/Dashboard', [
            'registers' => PosRegister::with('warehouse')->where('is_active', true)->get(),
            'openSessions' => PosSession::with(['register', 'user'])
                ->where('status', 'open')
                ->latest()
                ->get(),
            'stats' => [
                'registers' => PosRegister::where('is_active', true)->count(),
                'open_sessions' => PosSession::where('status', 'open')->count(),
            ],
            'canManageRegisters' => $user?->can('manage pos registers') ?? false,
        ]);
    }

    public function terminal(PosRegister $register)
    {
        abort_unless($register->is_active, 404);

        $session = PosSession::where('register_id', $register->id)
            ->where('user_id', auth()->id())
            ->where('status', 'open')
            ->first();

        if (!$session) {
            return redirect()->route('pos.index')->with('error', 'Open a session on this terminal first.');
        }

        if ($register->access_pin && !session("pos_register_{$register->id}_unlocked")) {
            return redirect()->route('pos.index')->with('error', 'Enter the terminal PIN to open a session.');
        }

        return Inertia::render('POS/Terminal', [
            'register' => $register->load('warehouse'),
            'session' => $session,
            'products' => Product::where('is_active', true)
                ->where('sale_price', '>', 0)
                ->orderBy('name')
                ->get(['id', 'name', 'sku', 'sale_price', 'tax_rate', 'barcode']),
        ]);
    }

    public function openSession(Request $request, PosRegister $register)
    {
        abort_unless($register->is_active, 404);

        $data = $request->validate([
            'opening_cash' => 'nullable|numeric|min:0',
            'pin' => 'nullable|string|max:20',
        ]);

        $this->verifyRegisterPin($register, $data['pin'] ?? null);

        $existing = PosSession::where('register_id', $register->id)
            ->where('user_id', auth()->id())
            ->where('status', 'open')
            ->first();

        if ($existing) {
            session(["pos_register_{$register->id}_unlocked" => true]);
            return redirect()->route('pos.terminal', $register);
        }

        $otherOpen = PosSession::where('register_id', $register->id)
            ->where('status', 'open')
            ->where('user_id', '!=', auth()->id())
            ->exists();

        if ($otherOpen) {
            throw ValidationException::withMessages([
                'register' => 'Another cashier already has an open session on this terminal.',
            ]);
        }

        PosSession::create([
            'register_id' => $register->id,
            'user_id' => auth()->id(),
            'status' => 'open',
            'opened_at' => now(),
            'opening_cash' => $data['opening_cash'] ?? 0,
        ]);

        session(["pos_register_{$register->id}_unlocked" => true]);

        return redirect()->route('pos.terminal', $register)->with('success', 'POS session opened.');
    }

    public function closeSession(Request $request, PosSession $session)
    {
        abort_unless($session->user_id === auth()->id(), 403);

        $data = $request->validate(['closing_cash' => 'required|numeric|min:0']);

        $cashSales = $session->sales()->where('payment_method', 'cash')->sum('total');
        $expected = (float) $session->opening_cash + (float) $cashSales;

        $session->update([
            'status' => 'closed',
            'closed_at' => now(),
            'closing_cash' => $data['closing_cash'],
            'expected_cash' => $expected,
            'variance' => (float) $data['closing_cash'] - $expected,
        ]);

        session()->forget("pos_register_{$session->register_id}_unlocked");

        return redirect()->route('pos.index')->with('success', 'POS session closed.');
    }

    public function sale(Request $request, PosSession $session)
    {
        abort_unless($session->user_id === auth()->id() && $session->status === 'open', 403);

        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
            'payment_method' => 'required|in:cash,card,momo,mobile_money',
            'client_id' => 'nullable|exists:clients,id',
        ]);

        try {
            $sale = $this->posService->processSale(
                $session,
                $data['items'],
                $data['payment_method'],
                $data['client_id'] ?? null,
            );
        } catch (InsufficientStockException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'sale' => $sale->load('salesOrder'),
            'message' => "Sale {$sale->sale_number} completed.",
        ]);
    }

    public function momoSale(Request $request, PosSession $session)
    {
        abort_unless($session->user_id === auth()->id() && $session->status === 'open', 403);

        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.description' => 'required|string',
            'items.*.quantity' => 'required|numeric|min:0.01',
            'items.*.unit_price' => 'required|numeric|min:0',
            'items.*.tax_rate' => 'nullable|numeric|min:0',
            'phone_number' => 'required|string',
            'correspondent' => 'nullable|string|in:MTN_MOMO_ZMB,AIRTEL_OAPI_ZMB,ZAMTEL_ZMB',
            'client_id' => 'nullable|exists:clients,id',
        ]);

        try {
            $result = $this->posService->processMomoSale(
                $session,
                $data['items'],
                $data['phone_number'],
                $data['correspondent'] ?? null,
                $data['client_id'] ?? null,
            );
        } catch (InsufficientStockException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'sale' => $result['sale']->load('salesOrder'),
            'transaction' => $result['transaction'],
            'message' => 'Mobile money payment initiated. Ask the customer to approve on their phone.',
        ]);
    }

    public function momoStatus(MomoTransaction $transaction)
    {
        $result = $this->momoTransactionService->checkTransactionStatus($transaction);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => $result['error'] ?? 'Status check failed.',
            ], 422);
        }

        return response()->json([
            'success' => true,
            'status' => $result['status'],
            'transaction' => $result['transaction'],
        ]);
    }

    private function verifyRegisterPin(PosRegister $register, ?string $pin): void
    {
        if (!$register->access_pin) {
            return;
        }

        if (!$pin || !Hash::check($pin, $register->access_pin)) {
            throw ValidationException::withMessages([
                'pin' => 'Invalid terminal PIN.',
            ]);
        }
    }
}
