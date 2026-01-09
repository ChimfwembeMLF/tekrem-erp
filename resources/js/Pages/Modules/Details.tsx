import React from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/Components/ui/tooltip';

export default function ModuleDetails({ module, addons }) {
    return (
        <AppLayout title={`Module Details - ${module.name}`}>
            <Head title={`Module Details - ${module.name}`} />
            <div className="min-h-screen bg-background text-foreground dark:bg-background dark:text-foreground">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-sm mb-3 text-muted-foreground">
                            <span>Modules</span>
                            <span>/</span>
                            <span className="font-medium">Details</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{module.name}</h1>
                        <p className="mt-2 text-muted-foreground">{module.description}</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Module Info */}
                            <Card className="border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground dark:bg-card dark:text-card-foreground">
                                <CardHeader className="border rounded-lg bg-gradient-to-br from-secondary to-primary text-primary-foreground dark:text-primary-foreground">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-bold">{module.name}</CardTitle>
                                            {module.description && <p className="text-sm">{module.description}</p>}
                                            {module.features && module.features.length > 0 && (
                                                <ul className="list-disc ml-6 mt-2 text-xs text-gray-200">
                                                    {module.features.map((f, i) => (
                                                        <li key={i}>{f}</li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">Base Price</div>
                                            <div className="text-2xl font-bold">ZMW {module.price?.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Add-ons */}
                            {addons && addons.length > 0 && (
                                <Card className="border-secondary/40 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground dark:bg-card dark:text-card-foreground">
                                    <CardHeader className="border-b border-secondary/40 bg-gradient-to-br from-secondary to-primary text-primary-foreground dark:text-primary-foreground">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">Available Add-ons</CardTitle>
                                        <p className="text-sm text-primary/60 dark:text-primary-foreground mt-1">Enhance your module with these optional features</p>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            {addons.map(addon => (
                                                <div key={addon.id} className="flex items-start gap-4 p-4 rounded-lg border-2 border-primary/20 bg-card hover:border-primary/30 hover:shadow-sm dark:border-card dark:bg-card hover:dark:border-primary/30">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <h4 className="font-semibold text-primary/90 dark:text-primary-foreground">{addon.name}</h4>
                                                                {addon.description && <p className="text-sm text-primary/60 dark:text-primary-foreground mt-1">{addon.description}</p>}
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <div className="font-bold text-primary/90 dark:text-primary-foreground">ZMW {addon.price?.toLocaleString()}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Company Formation Info */}
                            <Card className="border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground dark:bg-card dark:text-card-foreground">
                                <CardHeader className="border-b border-secondary/40 bg-gradient-to-br from-secondary to-primary text-primary-foreground dark:text-primary-foreground">
                                    <CardTitle className="text-lg font-bold">Company Formation</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        <div><span className="font-semibold">Name:</span> {company.name}</div>
                                        <div><span className="font-semibold">Slug:</span> {company.slug}</div>
                                        <div><span className="font-semibold">Timezone:</span> {company.timezone}</div>
                                        <div><span className="font-semibold">Locale:</span> {company.locale}</div>
                                        <div><span className="font-semibold">Primary Color:</span> {company.primary_color}</div>
                                        <div><span className="font-semibold">Secondary Color:</span> {company.secondary_color}</div>
                                        <div><span className="font-semibold">Settings:</span> <pre className="inline text-xs">{JSON.stringify(company.settings, null, 2)}</pre></div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Users Info */}
                            <Card className="border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground dark:bg-card dark:text-card-foreground">
                                <CardHeader className="border-b border-secondary/40 bg-gradient-to-br from-secondary to-primary text-primary-foreground dark:text-primary-foreground">
                                    <CardTitle className="text-lg font-bold">Company Users</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        {users.map(user => (
                                            <div key={user.id} className="border-b pb-2 mb-2">
                                                <div><span className="font-semibold">Name:</span> {user.name}</div>
                                                <div><span className="font-semibold">Email:</span> {user.email}</div>
                                                <div><span className="font-semibold">Role:</span> {user.role}</div>
                                                <div><span className="font-semibold">Permissions:</span> <pre className="inline text-xs">{JSON.stringify(user.permissions, null, 2)}</pre></div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Accounts Info */}
                            <Card className="border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground dark:bg-card dark:text-card-foreground">
                                <CardHeader className="border-b border-secondary/40 bg-gradient-to-br from-secondary to-primary text-primary-foreground dark:text-primary-foreground">
                                    <CardTitle className="text-lg font-bold">Company Accounts</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-2">
                                        {accounts.map(acc => (
                                            <div key={acc.id} className="border-b pb-2 mb-2">
                                                <div><span className="font-semibold">Name:</span> {acc.name}</div>
                                                <div><span className="font-semibold">Account Number:</span> {acc.account_number}</div>
                                                <div><span className="font-semibold">Bank:</span> {acc.bank_name}</div>
                                                <div><span className="font-semibold">Type:</span> {acc.type}</div>
                                                <div><span className="font-semibold">Currency:</span> {acc.currency}</div>
                                                <div><span className="font-semibold">Balance:</span> {acc.balance}</div>
                                                <div><span className="font-semibold">Active:</span> {acc.is_active ? 'Yes' : 'No'}</div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Summary & Billing */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6">
                                <Card className="border-secondary/40 shadow-lg bg-card text-card-foreground dark:bg-card dark:text-card-foreground">
                                    <CardHeader className="bg-gradient-to-br from-secondary to-primary text-primary-foreground dark:text-primary-foreground">
                                        <CardTitle className="text-lg font-bold">Billing & Status</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            {module.billing ? (
                                                <>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">Amount</span>
                                                        <span className="font-semibold">ZMW {module.billing.amount?.toLocaleString()}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-medium">Status</span>
                                                        <span className="font-semibold">{module.billing.status}</span>
                                                    </div>
                                                    {module.billing.invoice_number && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium">Invoice</span>
                                                            <a href={module.billing.invoice_link} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">#{module.billing.invoice_number}</a>
                                                        </div>
                                                    )}
                                                    {module.billing.payment_method && (
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-medium">Payment Method</span>
                                                            <span>{module.billing.payment_method.replace('_', ' ')}</span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">No billing info available.</div>
                                            )}
                                        </div>
                                        <Button className="w-full mt-6 bg-primary text-primary-foreground font-semibold py-4 text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground">
                                            Purchase Module
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Additional Info / Help */}
                                <div className="mt-4 p-4 bg-accent border border-accent-foreground/10 rounded-lg dark:bg-accent dark:text-accent-foreground">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-primary/60 dark:text-primary/50 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <div className="font-semibold mb-1 dark:text-primary-foreground">Need Help?</div>
                                            <p className="text-primary/70 dark:text-primary/50">Our support team is available 24/7 to assist you with your module or billing questions.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
