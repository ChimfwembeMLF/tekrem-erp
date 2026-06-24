<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shop_shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->decimal('base_cost', 15, 2)->default(0);
            $table->decimal('cost_per_kg', 15, 2)->default(0);
            $table->unsignedInteger('estimated_days_min')->default(1);
            $table->unsignedInteger('estimated_days_max')->default(5);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('shop_coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('type')->default('percent'); // percent | fixed
            $table->decimal('value', 15, 2);
            $table->decimal('min_order_amount', 15, 2)->nullable();
            $table->unsignedInteger('max_uses')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('shop_wishlist_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['user_id', 'product_id']);
        });

        Schema::create('shop_product_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reviewer_name');
            $table->string('reviewer_email')->nullable();
            $table->unsignedTinyInteger('rating');
            $table->string('title')->nullable();
            $table->text('body')->nullable();
            $table->boolean('is_approved')->default(false);
            $table->timestamps();
            $table->index(['product_id', 'is_approved']);
        });

        Schema::create('shop_shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sales_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('shipping_method_id')->nullable()->constrained('shop_shipping_methods')->nullOnDelete();
            $table->string('tracking_number')->nullable()->unique();
            $table->string('carrier')->nullable();
            $table->string('status')->default('pending'); // pending, processing, in_transit, delivered, cancelled
            $table->text('shipping_address')->nullable();
            $table->decimal('shipping_cost', 15, 2)->default(0);
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });

        Schema::create('shop_shipment_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('shop_shipment_id')->constrained()->cascadeOnDelete();
            $table->string('status');
            $table->string('location')->nullable();
            $table->text('description')->nullable();
            $table->timestamp('occurred_at');
            $table->timestamps();
        });

        Schema::table('sales_orders', function (Blueprint $table) {
            $table->string('access_token', 64)->nullable()->unique()->after('metadata');
            $table->foreignId('shipping_method_id')->nullable()->after('warehouse_id')
                ->constrained('shop_shipping_methods')->nullOnDelete();
            $table->decimal('shipping_cost', 15, 2)->default(0)->after('discount_amount');
            $table->string('coupon_code')->nullable()->after('shipping_cost');
            $table->string('payment_status')->default('pending')->after('coupon_code'); // pending, paid, failed
            $table->string('payment_method')->nullable()->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('sales_orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('shipping_method_id');
            $table->dropColumn(['access_token', 'shipping_cost', 'coupon_code', 'payment_status', 'payment_method']);
        });

        Schema::dropIfExists('shop_shipment_events');
        Schema::dropIfExists('shop_shipments');
        Schema::dropIfExists('shop_product_reviews');
        Schema::dropIfExists('shop_wishlist_items');
        Schema::dropIfExists('shop_coupons');
        Schema::dropIfExists('shop_shipping_methods');
    }
};
