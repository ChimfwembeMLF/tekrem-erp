import React from 'react';
import { TooltipProvider } from '@/Components/ui/tooltip';
import { Head, usePage, router } from '@inertiajs/react';
import useRoute from '@/Hooks/useRoute';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/Components/ui/dropdown-menu';
import { Popover, PopoverTrigger, PopoverContent } from '@/Components/ui/popover';
import { Tooltip } from '@/Components/ui/tooltip';
import { Separator } from '@/Components/ui/separator';
import { Info, ShoppingCart, Eye, MoreHorizontal } from 'lucide-react';
import { Input } from '@/Components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Components/ui/select';
import AppLayout from '@/Layouts/AppLayout';
import { toast } from 'sonner';
import type { Module, Addon } from '@/types';


interface MarketplaceProps {
  modules: Module[];
}

export default function Marketplace({ modules }: MarketplaceProps) {
    const route = useRoute();
    // State for search, filter, and sort
    const [searchTerm, setSearchTerm] = React.useState('');
    const [category, setCategory] = React.useState('all');
    const [sort, setSort] = React.useState('price_asc');

    // Example categories (replace with backend data if available)
    const categories = ['all', 'CRM', 'HRM', 'Inventory', 'Finance', 'Other'];

    // Filter and sort modules
    const filteredModules = modules
        .filter((m) =>
            (category === 'all' || m.category === category) &&
            (searchTerm === '' || m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.description.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            if (sort === 'price_asc') return a.price - b.price;
            if (sort === 'price_desc') return b.price - a.price;
            return 0;
        });


    const handleGoToCheckout = (moduleId: number) => {
        router.visit(route('admin.modules.checkout', moduleId));
    };

    // Add to Cart handler
    const [showGoToCart, setShowGoToCart] = React.useState(false);
    const handleAddToCart = (moduleId: number) => {
        router.post(route('admin.modules.cart.add'), { module_id: moduleId }, {
            onSuccess: () => {
                toast.success('Module added to cart!');
                setShowGoToCart(true);
            },
            onError: () => {
                toast.error('Failed to add module to cart.');
            },
            preserveScroll: true,
        });
    };

    return (
        <TooltipProvider>
            <AppLayout
                title='Tekrem Marketplace'
                renderHeader={() => (
                    <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                        <ShoppingCart className="text-blue-600" /> Module Marketplace
                        {showGoToCart && (
                            <Button variant="outline" size="sm" className="ml-4" onClick={() => router.visit(route('admin.modules.cart.index'))}>
                                <ShoppingCart className="mr-2" /> Go to Cart
                            </Button>
                        )}
                    </h1>
                )}
            >
                <div className="container mx-auto py-8">
                    <Head title="Module Marketplace" />

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Filters */}
                        <div className="lg:w-1/4 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Search & Filter</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Input
                                        placeholder="Search modules..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="mb-4"
                                    />
                                    <Select value={category} onValueChange={setCategory}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((cat) => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Select value={sort} onValueChange={setSort} className="mt-4">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sort by" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="price_asc">Price: Low to High</SelectItem>
                                            <SelectItem value="price_desc">Price: High to Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        </div>
                        {/* Main Grid */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredModules.map((module) => (
                                <Card key={module.id} className="flex flex-col justify-between relative">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CardTitle>{module.name}</CardTitle>
                                                <Tooltip content="View details">
                                                    <Button variant="ghost" size="icon" onClick={() => router.visit(route('admin.modules.show', module.id))}>
                                                        <Eye className="text-gray-500" />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem onClick={() => handleGoToCheckout(module.id)}>
                                                        <ShoppingCart className="mr-2" /> Purchase / Checkout
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => router.visit(route('admin.modules.show', module.id))}>
                                                        <Info className="mr-2" /> Details
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <Badge variant="secondary" className="mt-2">${module.price}</Badge>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="mb-4 text-gray-600 line-clamp-3">{module.description}</p>
                                        {Array.isArray(module.addons) && module.addons.length > 0 && (
                                            <div className="mb-2">
                                                <div className="font-semibold text-sm mb-1 text-gray-700">Add-ons available:</div>
                                                <ul className="list-disc pl-5 space-y-1">
                                                    {module.addons.map((addon) => (
                                                        <li key={addon.id} className="flex items-center justify-between">
                                                            <span>{addon.name}</span>
                                                            <span className="text-xs text-gray-500">${addon.price}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        <Button className="w-full mt-2" onClick={() => handleAddToCart(module.id)}>
                                            <ShoppingCart className="mr-2" /> Add to Cart
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </AppLayout>
        </TooltipProvider>
    );
}
