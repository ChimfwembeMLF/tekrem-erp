<?php

namespace App\Http\Controllers\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\Product;
use App\Models\Inventory\ProductCategory;
use App\Support\Organizations\OrganizationContext;
use App\Services\Inventory\ProductMediaService;
use App\Services\Inventory\BarcodeService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function __construct(
        private ProductMediaService $mediaService,
        private BarcodeService $barcodeService,
    ) {}

    public function index(Request $request)
    {
        $products = Product::with('category')
            ->when($request->search, function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhere('barcode', 'like', "%{$search}%");
                });
            })
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Inventory/Products/Index', [
            'products' => $products,
            'filters' => $request->only('search'),
        ]);
    }

    public function create(Request $request)
    {
        return Inertia::render('Inventory/Products/Create', [
            'categories' => ProductCategory::where('is_active', true)->orderBy('name')->get(['id', 'name']),
            'selectedCategoryId' => session('new_category_id') ?? $request->integer('category_id') ?: null,
        ]);
    }

    public function suggestBarcode()
    {
        return response()->json([
            'barcode' => $this->barcodeService->generateUnique(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $this->productData($request);
        $data['slug'] = Str::slug($data['name']) . '-' . Str::random(4);
        $data['category_id'] = $data['category_id'] ?: null;

        if (empty($data['barcode'])) {
            $data['barcode'] = $this->barcodeService->generateUnique();
        }

        $product = Product::create($data);

        $product->update([
            'images' => $this->mediaService->storeImages($product, $request->file('images', [])),
            'videos' => $this->mediaService->syncVideos($product, [], $request->file('videos', []), $request->input('video_urls', [])),
        ]);

        return redirect()->route('inventory.products.index')->with('success', 'Product created.');
    }

    public function show(Product $product)
    {
        $product->load(['category', 'stockLevels.warehouse']);
        return Inertia::render('Inventory/Products/Show', ['product' => $product]);
    }

    public function edit(Product $product)
    {
        return Inertia::render('Inventory/Products/Edit', [
            'product' => $product,
            'categories' => ProductCategory::where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $data = $this->productData($request, $product);

        if (empty($data['barcode'])) {
            $data['barcode'] = $this->barcodeService->generateUnique();
        }

        $product->update(array_merge($data, ['category_id' => $data['category_id'] ?: null]));

        $product->update([
            'images' => $this->mediaService->syncImages(
                $product,
                $request->input('existing_images', []),
                $request->file('images', []),
            ),
            'videos' => $this->mediaService->syncVideos(
                $product,
                $this->parseExistingVideos($request),
                $request->file('videos', []),
                $request->input('video_urls', []),
            ),
        ]);

        return redirect()->route('inventory.products.index')->with('success', 'Product updated.');
    }

    public function destroy(Product $product)
    {
        $this->mediaService->syncImages($product, [], []);
        $this->mediaService->syncVideos($product, [], [], []);

        $product->delete();
        return redirect()->route('inventory.products.index')->with('success', 'Product deleted.');
    }

    private function productData(Request $request, ?Product $product = null): array
    {
        $this->validateMedia($request);

        $organizationId = app(OrganizationContext::class)->check()
            ? app(OrganizationContext::class)->id()
            : null;

        $skuRule = 'required|string|max:50|unique:products,sku' . ($product ? ',' . $product->id : '');
        $barcodeRule = 'nullable|string|max:100|unique:products,barcode' . ($product ? ',' . $product->id : '');

        if ($organizationId) {
            $skuRule .= ',organization_id,' . $organizationId;
            $barcodeRule .= ',organization_id,' . $organizationId;
        }

        return $request->validate([
            'sku' => $skuRule,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category_id' => 'nullable|exists:product_categories,id',
            'barcode' => $barcodeRule,
            'unit' => 'required|string|max:20',
            'cost_price' => 'required|numeric|min:0',
            'sale_price' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'track_inventory' => 'boolean',
            'is_active' => 'boolean',
            'is_published' => 'boolean',
            'is_featured' => 'boolean',
        ]);
    }

    private function validateMedia(Request $request): void
    {
        $request->validate([
            'images' => 'nullable|array',
            'images.*' => 'image|max:5120',
            'existing_images' => 'nullable|array',
            'existing_images.*' => 'string',
            'videos' => 'nullable|array',
            'videos.*' => 'mimetypes:video/mp4,video/webm,video/quicktime,video/x-msvideo|max:51200',
            'existing_videos' => 'nullable',
            'video_urls' => 'nullable|array',
            'video_urls.*' => 'nullable|url|max:500',
        ]);
    }

    private function parseExistingVideos(Request $request): array
    {
        $videos = $request->input('existing_videos', []);

        if (is_string($videos)) {
            $videos = json_decode($videos, true) ?: [];
        }

        return is_array($videos) ? $videos : [];
    }
}
