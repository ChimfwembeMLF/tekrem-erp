

import React, { useState } from 'react';
import { TooltipProvider } from '@/Components/ui/tooltip';
import { usePage, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
    Search,
    MoreHorizontal,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
} from 'lucide-react';
import AppLayout from '@/Layouts/AppLayout';

export default function MyModules() {
    const pageProps = usePage().props as any;
    const modules: Array<{ id: number, name: string, status: string, description?: string }> = pageProps.modules || [];
    const [searchTerm, setSearchTerm] = useState('');
    const filteredModules = modules.filter((m) =>
        searchTerm === '' || m.name.toLowerCase().includes(searchTerm.toLowerCase()) || (m.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleActivate = (moduleId: number) => {
        router.post(`/admin/modules/${moduleId}/activate`, {}, {
            onSuccess: () => { },
        });
    };
    const handleDeactivate = (moduleId: number) => {
        router.post(`/admin/modules/${moduleId}/deactivate`, {}, {
            onSuccess: () => { },
        });
    };

    const getStatusBadge = (status: string) => {
        if (!status) {
            return (
                <Badge variant="secondary" className="flex items-center gap-1 text-gray-400">
                    <XCircle className="h-3 w-3" />
                    Unknown
                </Badge>
            );
        }
        const statusConfig = {
            active: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
            inactive: { variant: 'secondary' as const, icon: XCircle, color: 'text-gray-600' },
            pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
        };
        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
        const Icon = config.icon;
        return (
            <Badge variant={config.variant} className={`flex items-center gap-1 ${config.color}`}>
                <Icon className="h-3 w-3" />
                {typeof status === 'string' ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
            </Badge>
        );
    };

    return (
        <TooltipProvider>
            <AppLayout
                title="My Modules"
                renderHeader={() => (
                    <div className="flex items-center justify-between">
                        {/* Header */}
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">My Modules</h1>
                            <p className="text-sm text-gray-600">Manage your company modules and subscriptions</p>
                        </div>
                    </div>
                )}>
                <div className="container mx-auto py-8 space-y-6">

                    {/* Filters */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Search Modules
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="flex gap-2" onSubmit={e => e.preventDefault()}>
                                <Input
                                    placeholder="Search modules..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="flex-1"
                                />
                            </form>
                        </CardContent>
                    </Card>

                    {/* Modules Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">My Modules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[120px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredModules.map((module) => (
                                            <TableRow key={module.id}>
                                                <TableCell className="font-medium">{module.name}</TableCell>
                                                <TableCell>{module.description || '-'}</TableCell>
                                                <TableCell>{getStatusBadge(module.status)}</TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem>
                                                                <Eye className="h-4 w-4 mr-2" /> View Details
                                                            </DropdownMenuItem>
                                                            {module.status === 'inactive' ? (
                                                                <DropdownMenuItem onClick={() => handleActivate(module.id)}>
                                                                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" /> Activate
                                                                </DropdownMenuItem>
                                                            ) : (
                                                                <DropdownMenuItem onClick={() => handleDeactivate(module.id)}>
                                                                    <XCircle className="h-4 w-4 mr-2 text-gray-600" /> Deactivate
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </AppLayout>
        </TooltipProvider>
    );
}
