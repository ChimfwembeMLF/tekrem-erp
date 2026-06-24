<?php

namespace App\Http\Controllers\Ecommerce;

use App\Http\Controllers\Controller;
use App\Models\Ecommerce\CartItem;
use App\Models\Ecommerce\ShopProductReview;
use App\Models\Ecommerce\ShopShipment;
use App\Models\Ecommerce\ShopWishlistItem;
use App\Models\Inventory\Product;
use App\Models\Inventory\ProductCategory;
use App\Models\Inventory\Warehouse;
use App\Models\Sales\SalesOrder;
use App\Services\Commerce\ReceiptService;
use App\Services\Ecommerce\CartService;
use App\Services\Ecommerce\ShopCouponService;
use App\Services\Ecommerce\ShopHeroService;
use App\Services\Ecommerce\ShopShippingService;
use App\Services\Ecommerce\ShopShipmentService;
use App\Services\Payments\PawaPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function __construct(
        private CartService $cartService,
        private ShopHeroService $shopHero,
        private ShopShippingService $shippingService,
        private ShopCouponService $couponService,
        private ShopShipmentService $shipmentService,
    ) {}

    public function index(Request $request)
    {
        $warehouse = $this->defaultWarehouse();

        $products = Product::where('is_active', true)
            ->where('is_published', true)
            ->with('category')
            ->when($request->search, function ($q, $s) {
                $q->where(function ($inner) use ($s) {
                    $inner->where('name', 'like', "%{$s}%")
                        ->orWhere('sku', 'like', "%{$s}%")
                        ->orWhere('description', 'like', "%{$s}%");
                });
            })
            ->when($request->category, fn ($q, $slug) => $q->whereHas('category', fn ($c) => $c->where('slug', $slug)))
            ->paginate(12)
            ->withQueryString();

        $featuredProducts = collect();
        if (Schema::hasColumn('products', 'is_featured')) {
            $featuredProducts = Product::where('is_active', true)
                ->where('is_published', true)
                ->where('is_featured', true)
                ->with('category')
                ->latest()
                ->limit(12)
                ->get();
        }

        $categories = ProductCategory::where('is_active', true)->orderBy('name')->get();

        return Inertia::render('Shop/Index', [
            'products' => $products,
            'featuredProducts' => $featuredProducts,
            'categories' => $categories,
            'shopHero' => $this->shopHero->forFrontend(),
            'filters' => $request->only(['search', 'category']),
            'cartCount' => $this->getCartCount($request),
            'warehouseId' => $warehouse?->id,
        ]);
    }

    public function show(Request $request, string $product)
    {
        $productModel = $this->resolveProduct($product);
        abort_unless($productModel->is_active && $productModel->is_published, 404);

        $warehouse = $this->defaultWarehouse();
        $productModel->load(['category', 'stockLevels', 'approvedReviews']);

        $relatedProducts = Product::query()
            ->where('is_active', true)
            ->where('is_published', true)
            ->where('id', '!=', $productModel->id)
            ->when($productModel->category_id, fn ($q) => $q->where('category_id', $productModel->category_id))
            ->limit(8)
            ->get();

        return Inertia::render('Shop/Show', [
            'product' => $productModel,
            'relatedProducts' => $relatedProducts,
            'availableStock' => $this->cartService->availableStock($productModel, $warehouse?->id),
            'averageRating' => round((float) $productModel->approvedReviews->avg('rating'), 1),
            'reviewCount' => $productModel->approvedReviews->count(),
            'inWishlist' => auth()->check() && ShopWishlistItem::where('user_id', auth()->id())->where('product_id', $productModel->id)->exists(),
            'cartCount' => $this->getCartCount($request),
        ]);
    }

    public function cart(Request $request)
    {
        $cart = $this->loadCart($request);
        $warehouse = $this->defaultWarehouse();

        return Inertia::render('Shop/Cart', [
            'cart' => $cart,
            'totals' => $this->cartService->totals($cart),
            'shippingMethods' => $this->shippingService->activeMethods(),
            'stockIssues' => $this->cartService->stockIssues($cart, $warehouse?->id),
            'cartCount' => $cart->items->sum('quantity'),
        ]);
    }

    public function addToCart(Request $request, string $product)
    {
        $productModel = $this->resolveProduct($product);
        abort_unless($productModel->is_active && $productModel->is_published, 404);

        $data = $request->validate(['quantity' => 'nullable|numeric|min:0.01|max:9999']);
        $cart = $this->cartService->resolveCart($request->session()->getId(), auth()->id());
        $this->cartService->addItem($cart, $productModel, (float) ($data['quantity'] ?? 1));

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
            'shippingMethods' => $this->shippingService->activeMethods(),
            'stockIssues' => $this->cartService->stockIssues($cart, $warehouse?->id),
            'cartCount' => $cart->items->sum('quantity'),
            'defaults' => [
                'name' => $user?->name ?? '',
                'email' => $user?->email ?? '',
                'phone' => '',
            ],
            'momoAvailable' => app(PawaPayService::class)->isConfigured(),
        ]);
    }

    public function cartData(Request $request)
    {
        $cart = $this->loadCart($request);
        $warehouse = $this->defaultWarehouse();
        $user = auth()->user();
        $shippingMethodId = $request->integer('shipping_method_id') ?: null;
        $couponCode = $request->string('coupon_code')->toString() ?: null;

        return response()->json([
            'cart' => $cart,
            'totals' => $this->cartService->totals($cart, $shippingMethodId, $couponCode),
            'shippingMethods' => $this->shippingService->activeMethods(),
            'stockIssues' => $this->cartService->stockIssues($cart, $warehouse?->id),
            'cartCount' => (float) $cart->items->sum('quantity'),
            'defaults' => [
                'name' => $user?->name ?? '',
                'email' => $user?->email ?? '',
                'phone' => '',
            ],
            'momoAvailable' => app(PawaPayService::class)->isConfigured(),
        ]);
    }

    public function validateCoupon(Request $request)
    {
        $data = $request->validate([
            'coupon_code' => 'required|string|max:50',
            'shipping_method_id' => 'nullable|integer',
        ]);

        $cart = $this->loadCart($request);
        $totals = $this->cartService->totals(
            $cart,
            $data['shipping_method_id'] ?? null,
            $data['coupon_code']
        );

        try {
            $coupon = $this->couponService->validate($data['coupon_code'], $totals['subtotal'] + $totals['tax_amount']);
        } catch (ValidationException $e) {
            return response()->json(['valid' => false, 'message' => collect($e->errors())->flatten()->first()], 422);
        }

        return response()->json([
            'valid' => true,
            'coupon' => $coupon->only(['code', 'type', 'value']),
            'totals' => $totals,
        ]);
    }

    public function receiptData(Request $request, SalesOrder $order)
    {
        $this->authorizeOrderAccess($request, $order);

        return response()->json([
            'receipt' => app(ReceiptService::class)->fromSalesOrder($order),
        ]);
    }

    public function placeOrder(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email',
            'shipping_address' => 'required|string|max:500',
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'payment_method' => 'nullable|in:cod,momo',
            'shipping_method_id' => 'required|integer|exists:shop_shipping_methods,id',
            'coupon_code' => 'nullable|string|max:50',
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
                'user_id' => auth()->id(),
                'payment_method' => $data['payment_method'] ?? 'cod',
                'shipping_method_id' => $data['shipping_method_id'],
                'coupon_code' => $data['coupon_code'] ?? null,
            ], $warehouse?->id);
        } catch (ValidationException $e) {
            return back()->withErrors($e->errors())->withInput();
        }

        return redirect()->route('shop.order.confirmation', [
            'order' => $order->id,
            'token' => $order->access_token,
        ])->with('success', 'Order placed.');
    }

    public function confirmation(Request $request, SalesOrder $order)
    {
        $this->authorizeOrderAccess($request, $order);
        $order->load(['items.product', 'shipment.events', 'shippingMethod']);

        return Inertia::render('Shop/Confirmation', [
            'order' => $order,
            'totals' => [
                'subtotal' => (float) $order->subtotal,
                'tax_amount' => (float) $order->tax_amount,
                'discount_amount' => (float) $order->discount_amount,
                'shipping_cost' => (float) $order->shipping_cost,
                'total' => (float) $order->total,
            ],
        ]);
    }

    public function orders(Request $request)
    {
        abort_unless(auth()->check(), 403);

        $orders = SalesOrder::query()
            ->where('source', 'ecommerce')
            ->where(function ($q) {
                $q->where('user_id', auth()->id());
                if (auth()->user()?->client_id) {
                    $q->orWhere('client_id', auth()->user()->client_id);
                }
                $q->orWhere('metadata->customer_email', auth()->user()->email);
            })
            ->with(['shipment', 'items.product'])
            ->latest()
            ->paginate(10);

        return Inertia::render('Shop/Orders', [
            'orders' => $orders,
            'cartCount' => $this->getCartCount($request),
        ]);
    }

    public function tracking(Request $request, ?string $trackingNumber = null)
    {
        $trackingNumber = $trackingNumber ?: $request->query('tracking_number');

        $shipment = $trackingNumber
            ? $this->shipmentService->findByTrackingNumber($trackingNumber)
            : null;

        return Inertia::render('Shop/Tracking', [
            'trackingNumber' => $trackingNumber,
            'shipment' => $shipment,
            'cartCount' => $this->getCartCount($request),
        ]);
    }

    public function wishlist(Request $request)
    {
        abort_unless(auth()->check(), 403);

        $items = ShopWishlistItem::query()
            ->where('user_id', auth()->id())
            ->with('product.category')
            ->latest()
            ->get();

        return Inertia::render('Shop/Wishlist', [
            'items' => $items,
            'cartCount' => $this->getCartCount($request),
        ]);
    }

    public function toggleWishlist(Request $request, string $product)
    {
        abort_unless(auth()->check(), 403);

        $productModel = $this->resolveProduct($product);
        $existing = ShopWishlistItem::where('user_id', auth()->id())->where('product_id', $productModel->id)->first();

        if ($existing) {
            $existing->delete();
            return back()->with('success', 'Removed from wishlist.');
        }

        ShopWishlistItem::create(['user_id' => auth()->id(), 'product_id' => $productModel->id]);

        return back()->with('success', 'Added to wishlist.');
    }

    public function storeReview(Request $request, string $product)
    {
        $productModel = $this->resolveProduct($product);

        $data = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'title' => 'nullable|string|max:255',
            'body' => 'nullable|string|max:2000',
            'reviewer_name' => 'required|string|max:255',
            'reviewer_email' => 'nullable|email|max:255',
        ]);

        ShopProductReview::create([
            'product_id' => $productModel->id,
            'user_id' => auth()->id(),
            'reviewer_name' => $data['reviewer_name'],
            'reviewer_email' => $data['reviewer_email'] ?? auth()->user()?->email,
            'rating' => $data['rating'],
            'title' => $data['title'] ?? null,
            'body' => $data['body'] ?? null,
            'is_approved' => auth()->check(),
        ]);

        return back()->with('success', 'Review submitted for approval.');
    }

    private function loadCart(Request $request): \App\Models\Ecommerce\Cart
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

    private function authorizeCartItem(Request $request, \App\Models\Ecommerce\CartItem $cartItem): void
    {
        $cart = $this->cartService->resolveCart($request->session()->getId(), auth()->id());
        abort_unless($cartItem->cart_id === $cart->id, 403);
    }

    private function authorizeOrderAccess(Request $request, SalesOrder $order): void
    {
        abort_unless($order->source === 'ecommerce', 404);

        $token = $request->query('token') ?? $request->input('token');
        if ($token && hash_equals((string) $order->access_token, (string) $token)) {
            return;
        }

        if (auth()->check()) {
            $user = auth()->user();
            if ($order->user_id === $user->id) {
                return;
            }
            if ($user->client_id && $order->client_id === $user->client_id) {
                return;
            }
            if (($order->metadata['customer_email'] ?? null) === $user->email) {
                return;
            }
        }

        abort(403);
    }

    private function getCartCount(Request $request): float
    {
        $cart = $this->cartService->resolveCart($request->session()->getId(), auth()->id());
        $cart->load('items');

        return (float) $cart->items->sum('quantity');
    }

    private function resolveProduct(string $value): Product
    {
        return Product::query()
            ->where(function ($q) use ($value) {
                $q->where('slug', $value);
                if (is_numeric($value)) {
                    $q->orWhere('id', $value);
                }
            })
            ->firstOrFail();
    }
}
