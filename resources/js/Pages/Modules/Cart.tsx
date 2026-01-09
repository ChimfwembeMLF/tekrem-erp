import React, { useState } from 'react';
// Type definitions for cart module and addon
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
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';


interface CartProps {
    modules: CartModule[];
}

export default function Cart({ modules }: CartProps) {
    const [cartModules, setCartModules] = useState<CartModule[]>(modules);
    const [loading, setLoading] = useState(false);
    const handleRemove = (moduleId: number) => {
        setLoading(true);
        router.post('/admin/modules/cart/remove', { module_id: moduleId }, {
            onSuccess: () => setLoading(false),
            onError: () => setLoading(false),
        });
    };
    const handleClear = () => {
        setLoading(true);
        router.post('/admin/modules/cart/clear', {}, {
            onSuccess: () => setLoading(false),
            onError: () => setLoading(false),
        });
    };
    const handleToggleAddon = (moduleId: number, addonId: number) => {
        setCartModules((prev: CartModule[]) => prev.map((m: CartModule) => {
            if (m.id !== moduleId) return m;
            const selected = m.selected_addons || [];
            return {
                ...m,
                selected_addons: selected.includes(addonId)
                    ? selected.filter((id: number) => id !== addonId)
                    : [...selected, addonId],
            };
        }));
    };
    const subtotal = cartModules.reduce((sum: number, m: CartModule) => {
        const addonsTotal = (m.addons || []).filter((a: CartAddon) => (m.selected_addons || []).includes(a.id)).reduce((s: number, a: CartAddon) => s + a.price, 0);
        return sum + m.price + addonsTotal;
    }, 0);
    const tax = Math.round(subtotal * 0.16 * 100) / 100; // 16% VAT
    const total = subtotal + tax;
    return (
        <AppLayout title="Cart">
            <Head title="Cart" />
            <div className="max-w-3xl mx-auto py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Cart</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {cartModules.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-3xl mb-2">🛒</div>
                                <div>Your cart is empty. Browse the marketplace to add modules.</div>
                            </div>
                        ) : (
                            <>
                                <ul className="mb-4 divide-y">
                                    {cartModules.map((module: CartModule) => {
                                        const moduleAddons = module.addons || [];
                                        const selectedAddons = module.selected_addons || [];
                                        const moduleSubtotal = module.price + moduleAddons.filter((a: CartAddon) => selectedAddons.includes(a.id)).reduce((s: number, a: CartAddon) => s + a.price, 0);
                                        return (
                                            <li key={module.id} className="py-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-semibold text-lg">{module.name}</div>
                                                        <div className="text-gray-500 text-sm mb-1">{module.description}</div>
                                                        <div className="text-sm">Base: <span className="font-medium">ZMW {module.price}</span></div>
                                                        {moduleAddons.length > 0 && (
                                                            <div className="mt-2">
                                                                <div className="font-medium text-xs text-gray-700 mb-1">Add-ons:</div>
                                                                <ul className="ml-2">
                                                                    {moduleAddons.map((addon: CartAddon) => (
                                                                        <li key={addon.id} className="flex items-center gap-2 text-sm mb-1">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={selectedAddons.includes(addon.id)}
                                                                                onChange={() => handleToggleAddon(module.id, addon.id)}
                                                                                className="accent-blue-600"
                                                                            />
                                                                            <span>{addon.name}</span>
                                                                            <span className="text-gray-400">(ZMW {addon.price})</span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        <div className="mt-2 text-xs text-gray-500">Subtotal: <span className="font-semibold text-gray-700">ZMW {moduleSubtotal}</span></div>
                                                    </div>
                                                    <Button variant="destructive" size="sm" onClick={() => handleRemove(module.id)} disabled={loading}>Remove</Button>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <div className="border-t pt-4 mt-4">
                                    <div className="flex justify-between mb-1 text-sm">
                                        <span>Subtotal</span>
                                        <span>ZMW {subtotal}</span>
                                    </div>
                                    <div className="flex justify-between mb-1 text-sm">
                                        <span>Tax (16% VAT)</span>
                                        <span>ZMW {tax}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>ZMW {total}</span>
                                    </div>
                                </div>
                                <div className="flex mt-6 gap-2">
                                    <Button className="mr-2" onClick={handleClear} variant="outline" disabled={loading}>Clear Cart</Button>
                                    <Button className="ml-2" disabled={loading || cartModules.length === 0} onClick={() => router.visit('/admin/modules/checkout')}>Proceed to Checkout</Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
