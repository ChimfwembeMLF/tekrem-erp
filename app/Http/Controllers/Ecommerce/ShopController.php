<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Exceptions\InsufficientStockException;
use App\Models\Ecommerce\Cart;
use App\Models\Ecommerce\CartItem;
use App\Models\Inventory\Product;
use App\Models\Inventory\Warehouse;
use App\Models\Sales\SalesOrder;
use App\Services\Ecommerce\CartService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function __construct(private CartService $cartService) {}

    public function index(Request $request)
    {
        $products = Product::where('is_active', true)
            ->where('is_published', true)
            ->with('category')
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->paginate(12)
            ->withQueryString();

        return Inertia::render('Shop/Index', [
            'products' => $products,
            'filters' => $request->only('search'),
            'cartCount' => $this->getCartCount($request),
        ]);
    }

    public function show(Product $product)
    {
        abort_unless($product->is_active && $product->is_published, 404);

        $product->load(['category', 'stockLevels']);

        return Inertia::render('Shop/Show', [
            'product' => $product,
            'cartCount' => $this->getCartCount(request()),
        ]);
    }

    public function cart(Request $request)
    {
        $cart = $this->loadCart($request);

        return Inertia::render('Shop/Cart', [
            'cart' => $cart,
            'totals' => $this->cartService->totals($cart),
            'cartCount' => $cart->items->sum('quantity'),
        ]);
    }

    public function addToCart(Request $request, Product $product)
    {
        abort_unless($product->is_active && $product->is_published, 404);

        $data = $request->validate(['quantity' => 'nullable|numeric|min:0.01|max:9999']);
        $cart = $this->cartService->resolveCart($request->session()->getId(), auth()->id());
        $this->cartService->addItem($cart, $product, (float) ($data['quantity'] ?? 1));

        return back()->with('success', 'Added to cart.');
    }

    public function updateCartItem(Request $request, CartItem $cartItem)
    {
        $this->authorizeCartItem($request, $cartItem);

        $data = $request->validate(['quantity' => 'required|numeric|min:0|max:9999']);
        $this->cartService->updateItem($cartItem, (float) $data['quantity']);

        return back()->with('success', 'Cart updated.');
    }

    public function removeCartItem(Request $request, CartItem $cartItem)
    {
        $this->authorizeCartItem($request, $cartItem);
        $this->cartService->removeItem($cartItem);

        return back()->with('success', 'Item removed from cart.');
    }

    public function checkout(Request $request)
    {
        $cart = $this->loadCart($request);

        if ($cart->items->isEmpty()) {
            return redirect()->route('shop.cart')->with('error', 'Your cart is empty.');
        }

        $warehouse = $this->defaultWarehouse();
        $user = auth()->user();

        return Inertia::render('Shop/Checkout', [
            'cart' => $cart,
            'totals' => $this->cartService->totals($cart),
            'stockIssues' => $this->cartService->stockIssues($cart, $warehouse?->id),
            'cartCount' => $cart->items->sum('quantity'),
            'defaults' => [
                'name' => $user?->name ?? '',
                'email' => $user?->email ?? '',
                'phone' => '',
            ],
        ]);
    }

    public function placeOrder(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'shipping_address' => 'required|string|max:500',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
        ]);

        $cart = $this->loadCart($request);

        if ($cart->items->isEmpty()) {
            return redirect()->route('shop.cart')->with('error', 'Your cart is empty.');
        }

        $warehouse = $this->defaultWarehouse();

        try {
            $order = $this->cartService->checkout($cart, [
                'email' => $data['email'],
                'shipping_address' => $data['shipping_address'],
                'name' => $data['name'],
                'phone' => $data['phone'] ?? null,
                'client_id' => auth()->user()?->client_id ?? null,
            ], $warehouse?->id);
        } catch (ValidationException $e) {
            return back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (InsufficientStockException $e) {
            return back()
                ->withErrors(['stock' => [$e->getMessage()]])
                ->withInput();
        }

        return redirect()->route('shop.order.confirmation', $order)->with('success', 'Order placed.');
    }

    public function confirmation(SalesOrder $order)
    {
        $order->load('items.product');

        return Inertia::render('Shop/Confirmation', [
            'order' => $order,
            'totals' => [
                'subtotal' => (float) $order->subtotal,
                'tax_amount' => (float) $order->tax_amount,
                'total' => (float) $order->total,
            ],
        ]);
    }

    private function loadCart(Request $request): Cart
    {
        $cart = $this->cartService->resolveCart($request->session()->getId(), auth()->id());
        $cart->load(['items.product.category']);

        return $cart;
    }

    private function defaultWarehouse(): ?Warehouse
    {
        return Warehouse::where('is_default', true)->where('is_active', true)->first()
            ?? Warehouse::where('is_active', true)->first();
    }

    private function authorizeCartItem(Request $request, CartItem $cartItem): void
    {
        $cart = $this->cartService->resolveCart($request->session()->getId(), auth()->id());

        abort_unless($cartItem->cart_id === $cart->id, 403);
    }

    private function getCartCount(Request $request): float
    {
        $cart = Cart::where('session_id', $request->session()->getId())
            ->orWhere('user_id', auth()->id())
            ->with('items')
            ->first();

        return $cart ? (float) $cart->items->sum('quantity') : 0;
    }
}
