import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/Components/ui/tooltip';

export default function ModuleDetails({ module, addons }) {
    return (
        <AppLayout>
            <Head title={module.name + ' Details'} />
            <div className="max-w-3xl mx-auto py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>{module.name}</CardTitle>
                        <div className="text-gray-500 text-sm mt-1">{module.description}</div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4">
                            <span className="font-semibold">Price:</span> ZMW {module.price}
                        </div>
                        <div className="mb-4">
                            <span className="font-semibold">Status:</span> {module.is_active ? 'Active' : 'Inactive'}
                        </div>
                        {addons && addons.length > 0 && (
                            <div className="mb-4">
                                <span className="font-semibold">Add-ons:</span>
                                <ul className="list-disc ml-6 mt-2">
                                    {addons.map(addon => (
                                        <li key={addon.id} className="mb-1">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="font-medium text-blue-700 cursor-pointer">{addon.name}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <div className="text-xs max-w-xs">{addon.description}</div>
                                                        <div className="text-xs mt-1 text-gray-400">ZMW {addon.price}</div>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <Button className="mt-4">Purchase Module</Button>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
