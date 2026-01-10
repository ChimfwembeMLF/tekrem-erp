import React, { useCallback, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import useRoute from '@/Hooks/useRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import {
    ShoppingCart, Trash2, X, Plus, ChevronRight,
    AlertCircle, ShieldCheck, Package, CreditCard,
    ArrowRight, Loader2, CheckCircle2, Tag, Sparkles
} from 'lucide-react';

/* =======================
   Types
======================= */
type CartAddon = {
    id: number;
    name: string;
    price: number;
    description?: string;
};

type CartModule = {
    id: number;
    name: string;
    price: number;
    description?: string;
    addons?: CartAddon[];
    selected_addons?: number[];
};

interface CartProps {
    modules: CartModule[];
}

/* =======================
   Utils
======================= */
const money = (value: number) =>
    new Intl.NumberFormat('en-ZM', {
        style: 'currency',
        currency: 'ZMW',
        minimumFractionDigits: 2,
    }).format(value);

const VAT_RATE = 0.16;

/* =======================
   Component
======================= */
export default function Cart({ modules }: CartProps) {
    const route = useRoute();
    const [cartModules, setCartModules] = useState<CartModule[]>(modules);
    const [loadingId, setLoadingId] = useState<number | null>(null);
    const [clearing, setClearing] = useState(false);
    const [removingId, setRemovingId] = useState<number | null>(null);

    /* =======================
       Derived State
    ======================= */
    const totals = useMemo(() => {
        const subtotal = cartModules.reduce((sum, m) => {
            const addonTotal =
                m.addons
                    ?.filter(a => m.selected_addons?.includes(a.id))
                    .reduce((s, a) => s + a.price, 0) ?? 0;
            return sum + m.price + addonTotal;
        }, 0);

        const tax = +(subtotal * VAT_RATE).toFixed(2);
        return { subtotal, tax, total: subtotal + tax };
    }, [cartModules]);

    const itemCount = cartModules.length;
    const addonCount = cartModules.reduce(
        (sum, m) => sum + (m.selected_addons?.length ?? 0),
        0
    );

    /* =======================
       Actions
    ======================= */
    const removeModule = useCallback((moduleId: number) => {
        setRemovingId(moduleId);

        // Optimistic update with animation
        setTimeout(() => {
            setCartModules(prev => prev.filter(m => m.id !== moduleId));

            router.post(
                '/admin/modules/cart/remove',
                { module_id: moduleId },
                {
                    onFinish: () => {
                        setRemovingId(null);
                        setLoadingId(null);
                    },
                    preserveScroll: true
                }
            );
        }, 300);
    }, []);

    const clearCart = useCallback(() => {
        if (!confirm('Are you sure you want to clear your cart? This action cannot be undone.')) {
            return;
        }

        setClearing(true);
        setCartModules([]);

        router.post('/admin/modules/cart/clear', {}, {
            onFinish: () => setClearing(false),
        });
    }, []);

    const toggleAddon = useCallback((moduleId: number, addonId: number) => {
        setCartModules(prev =>
            prev.map(m => {
                if (m.id !== moduleId) return m;
                const selected = m.selected_addons ?? [];
                const next = selected.includes(addonId)
                    ? selected.filter(id => id !== addonId)
                    : [...selected, addonId];

                return { ...m, selected_addons: next };
            })
        );

        router.post(
            '/admin/modules/cart/addon/toggle',
            { module_id: moduleId, addon_id: addonId },
            { preserveScroll: true }
        );
    }, []);

    const handleCheckout = useCallback(() => {
        router.visit(route('admin.modules.billing.checkout'));
    }, [route]);

    /* =======================
       Render
    ======================= */
    return (
        <AppLayout title="Shopping Cart">
            <Head title="Shopping Cart" />

            <div className="min-h-screen">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                                <ShoppingCart className="w-8 h-8 text-blue-600" />
                                Your Cart
                            </h1>
                            {cartModules.length > 0 && (
                                <p className="text-slate-600 mt-2">
                                    {itemCount} {itemCount === 1 ? 'module' : 'modules'}
                                    {addonCount > 0 && ` with ${addonCount} ${addonCount === 1 ? 'add-on' : 'add-ons'}`}
                                </p>
                            )}
                        </div>

                        {cartModules.length > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={clearing}
                                onClick={clearCart}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                                {clearing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Clearing...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Clear Cart
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </div>

                {cartModules.length === 0 ? (
                    /* Empty State */
                    <Card className="border-slate-200 shadow-lg">
                        <CardContent className="py-16 sm:py-24">
                            <div className="text-center max-w-md mx-auto">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
                                    <ShoppingCart className="w-10 h-10 text-slate-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-3">
                                    Your cart is empty
                                </h2>
                                <p className="text-slate-600 mb-8">
                                    Discover our modules and add them to your cart to get started with powerful features for your business.
                                </p>
                                <Button
                                    onClick={() => router.visit('/admin/modules')}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Package className="w-4 h-4 mr-2" />
                                    Browse Modules
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartModules.map((module, index) => {
                                const selected = module.selected_addons ?? [];
                                const addonTotal =
                                    module.addons
                                        ?.filter(a => selected.includes(a.id))
                                        .reduce((s, a) => s + a.price, 0) ?? 0;
                                const moduleTotal = module.price + addonTotal;
                                const isRemoving = removingId === module.id;

                                return (
                                    <Card
                                        key={module.id}
                                        className={`
                        border-slate-200 shadow-sm hover:shadow-md transition-all duration-300
                        ${isRemoving ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
                      `}
                                        style={{
                                            animation: `slideInUp 0.4s ease-out ${index * 0.1}s backwards`,
                                        }}
                                    >
                                        <CardContent className="p-6">
                                            <div className="flex gap-6">

                                                {/* Module Icon */}
                                                <div className="flex-shrink-0">
                                                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-secondary to-primary text-primary-foreground dark:text-primary-foreground flex items-center justify-center shadow-lg">
                                                        <Package className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>

                                                {/* Module Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-4 mb-3">
                                                        <div className="flex-1">
                                                            <h3 className="text-xl font-bold text-slate-900 mb-1">
                                                                {module.name}
                                                            </h3>
                                                            {module.description && (
                                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                                    {module.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            disabled={isRemoving}
                                                            onClick={() => removeModule(module.id)}
                                                            className="text-slate-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                                                        >
                                                            {isRemoving ? (
                                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                            ) : (
                                                                <X className="w-5 h-5" />
                                                            )}
                                                        </Button>
                                                    </div>

                                                    {/* Pricing */}
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                                                            <span className="text-sm text-slate-600">Base Price:</span>
                                                            <span className="text-lg font-bold text-blue-700">
                                                                {money(module.price)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Add-ons */}
                                                    {module.addons && module.addons.length > 0 && (
                                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <Sparkles className="w-4 h-4 text-blue-600" />
                                                                <h4 className="text-sm font-semibold text-slate-900">
                                                                    Available Add-ons
                                                                </h4>
                                                                {selected.length > 0 && (
                                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                                                        {selected.length} selected
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="space-y-2">
                                                                {module.addons.map(addon => {
                                                                    const isSelected = selected.includes(addon.id);
                                                                    return (
                                                                        <div
                                                                            key={addon.id}
                                                                            onClick={() => toggleAddon(module.id, addon.id)}
                                                                            className={`
                                          flex items-start gap-3 p-3 rounded-lg border cursor-pointer
                                          transition-all duration-200
                                          ${isSelected
                                                                                    ? 'bg-blue-50 border-blue-200 shadow-sm'
                                                                                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                                                                                }
                                        `}
                                                                        >
                                                                            <div className={`
                                          flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5
                                          flex items-center justify-center transition-all
                                          ${isSelected
                                                                                    ? 'bg-blue-600 border-blue-600'
                                                                                    : 'bg-white border-slate-300'
                                                                                }
                                        `}>
                                                                                {isSelected && (
                                                                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                                                                )}
                                                                            </div>

                                                                            <div className="flex-1 min-w-0">
                                                                                <div className="flex items-start justify-between gap-2">
                                                                                    <div>
                                                                                        <div className="font-medium text-slate-900">
                                                                                            {addon.name}
                                                                                        </div>
                                                                                        {addon.description && (
                                                                                            <div className="text-xs text-slate-600 mt-0.5">
                                                                                                {addon.description}
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    <div className="flex-shrink-0 font-semibold text-slate-900">
                                                                                        {money(addon.price)}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Module Subtotal */}
                                                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                                                        <span className="text-sm font-medium text-slate-600">
                                                            Module Subtotal
                                                        </span>
                                                        <span className="text-xl font-bold text-slate-900">
                                                            {money(moduleTotal)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        {/* Order Summary - Sticky */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6 space-y-4">

                                {/* Summary Card */}
                                <Card className="border-slate-200 shadow-lg">
                                    <CardHeader className="bg-gradient-to-br from-secondary to-primary text-primary-foreground dark:text-primary-foreground border-b-0">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Tag className="w-5 h-5" />
                                            Order Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-4">

                                        {/* Summary Lines */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600">Subtotal</span>
                                                <span className="font-semibold text-slate-900">
                                                    {money(totals.subtotal)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-600">VAT (16%)</span>
                                                    <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                                                </div>
                                                <span className="font-semibold text-slate-900">
                                                    {money(totals.tax)}
                                                </span>
                                            </div>

                                            <div className="pt-3 border-t-2 border-slate-300">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-lg font-bold text-slate-900">Total</span>
                                                    <span className="text-2xl font-bold text-blue-600">
                                                        {money(totals.total)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Checkout Button */}
                                        <Button
                                            onClick={handleCheckout}
                                            disabled={!cartModules.length}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            <CreditCard className="w-5 h-5 mr-2" />
                                            Proceed to Checkout
                                            <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>

                                        {/* Security Badge */}
                                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                                            <ShieldCheck className="w-4 h-4 text-green-600" />
                                            <span>Secure checkout process</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Info Cards */}
                                <Card className="border-slate-200 bg-green-50 border-green-100">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <div className="font-semibold text-green-900 mb-1">
                                                    Instant Activation
                                                </div>
                                                <p className="text-green-700">
                                                    All modules are activated immediately after successful payment.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-200 bg-blue-50 border-blue-100">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="text-sm">
                                                <div className="font-semibold text-blue-900 mb-1">
                                                    Money-Back Guarantee
                                                </div>
                                                <p className="text-blue-700">
                                                    30-day money-back guarantee on all module purchases.
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}