import React from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Components/ui/select';
import { CheckCircle2, Plus, X, CreditCard, Lock, ShieldCheck, Info } from 'lucide-react';

// Types
type Addon = { id: number; name: string; price: number; description?: string };
type Module = { id: number; name: string; price: number; description?: string };
type BillingAccount = { id: string; name: string; account_number: string; bank_name: string };

interface Props {
    module: Module;
    addons: Addon[];
    accounts: BillingAccount[];
}




const ModuleCheckout: React.FC<Props> = ({ module, addons, accounts: initialAccounts }) => {
    const [selectedAddons, setSelectedAddons] = React.useState<number[]>(() => addons.map(a => a.id));
    const [accounts, setAccounts] = React.useState<BillingAccount[]>(initialAccounts);
    const [selectedAccount, setSelectedAccount] = React.useState<string>(initialAccounts[0]?.id || '');
    const [showAddAccount, setShowAddAccount] = React.useState<boolean>(false);
    const [newAccount, setNewAccount] = React.useState<Omit<BillingAccount, 'id'>>({ name: '', account_number: '', bank_name: '' });
    const [isProcessing, setIsProcessing] = React.useState<boolean>(false);

    const handleAddonToggle = (addonId: number) => {
        setSelectedAddons(prev => prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]);
    };

    const handleCheckout = () => {
        setIsProcessing(true);
        router.post(`/admin/modules/${module.id}/purchase`, {
            addons: selectedAddons,
            billing_account_id: selectedAccount,
        });
    };

    const base = Number(module.price) || 0;
    const addonsTotal = addons.filter(a => selectedAddons.includes(a.id)).reduce((sum, a) => sum + Number(a.price || 0), 0);
    const subtotal = base + addonsTotal;
    const taxRate = 0.16;
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = subtotal + tax;

    const handleAddAccount = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const id = Date.now().toString();
        const account: BillingAccount = { ...newAccount, id };
        setAccounts(prev => [...prev, account]);
        setSelectedAccount(id);
        setNewAccount({ name: '', account_number: '', bank_name: '' });
        setShowAddAccount(false);
    };

    const selectedAccountDetails = accounts.find(acc => acc.id === selectedAccount);

    return (
        <AppLayout title={`Checkout - ${module.name}`}>
            <Head title={`Checkout - ${module.name}`} />
            <div className="min-h-screen bg-background text-foreground dark:bg-background dark:text-foreground">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 text-sm mb-3 text-muted-foreground">
                            <span>Modules</span>
                            <span>/</span>
                            <span className="font-medium">Checkout</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Complete Your Purchase</h1>
                        <p className="mt-2 text-muted-foreground">Review your order and select a payment method</p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">

                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* Module Card */}
                            <Card className="border-primary/90 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground dark:bg-card dark:text-card-foreground">
                                <CardHeader className="border rounded-lg border-gray-600 bg-gradient-to-r from-primary to-transparent text-primary-foreground dark:text-primary-foreground">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-xl font-bold">{module.name}</CardTitle>
                                            {module.description && <p className="text-sm">{module.description}</p>}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium">Base Price</div>
                                            <div className="text-2xl font-bold">ZMW {base.toLocaleString()}</div>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>

                            {/* Add-ons */}
                            {addons.length > 0 && (
                                <Card className="border-primary/90 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground dark:bg-card dark:text-card-foreground">
                                    <CardHeader className="border-b border-primary/90 bg-gradient-to-r from-primary to-transparent text-primary-foreground dark:text-primary-foreground">
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <Plus className="w-5 h-5 text-primary/60" />
                                            Available Add-ons
                                        </CardTitle>
                                        <p className="text-sm text-primary/60 dark:text-primary-foreground mt-1">Enhance your module with these optional features</p>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="space-y-3">
                                            {addons.map(addon => {
                                                const isSelected = selectedAddons.includes(addon.id);
                                                return (
                                                    <div
                                                        key={addon.id}
                                                        onClick={() => handleAddonToggle(addon.id)}
                                                        className={`
                                                            relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
                                                            ${isSelected
                                                                ? 'border-primary/50 bg-gray-300 shadow-sm dark:border-primary/50 dark:bg-primary/50'
                                                                : 'border-primary/20 bg-card hover:border-primary/30 hover:shadow-sm dark:border-card dark:bg-card hover:dark:border-primary/30'
                                                            }
                                                        `}
                                                    >
                                                        <div className={`
                                                            flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center transition-all duration-200
                                                            ${isSelected
                                                                ? 'bg-primary/60 border-primary/60 dark:bg-primary/60 dark:border-primary/60'
                                                                : 'bg-card border-primary/30 dark:bg-card dark:border-card-border '
                                                            }
                                                        `}>
                                                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-4">
                                                                <div>
                                                                    <h4 className="font-semibold text-primary/90 dark:text-primary-foreground">{addon.name}</h4>
                                                                    {addon.description && <p className="text-sm text-primary/60 dark:text-primary-foreground mt-1">{addon.description}</p>}
                                                                </div>
                                                                <div className="text-right flex-shrink-0">
                                                                    <div className="font-bold text-primary/90 dark:text-primary-foreground">ZMW {addon.price.toLocaleString()}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Billing Account Card */}
                            <Card className="border-primary/20 shadow-sm hover:shadow-md transition-shadow duration-300 bg-card text-card-foreground dark:bg-card dark:text-card-foreground">
                                <CardHeader className="border-b border-primary/90 bg-gradient-to-r from-primary to-transparent text-primary-foreground dark:text-primary-foreground">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-primary/600" />
                                        Payment Method
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-primary/70 dark:text-primary-foreground mb-2">Select Billing Account</label>
                                            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                                <SelectTrigger className="w-full border-primary/30 focus:border-primary/50 focus:ring-primary/50 dark:bg-input dark:text-input-foreground dark:border-input-border">
                                                    <SelectValue placeholder="Select billing account" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {accounts.map(acc => (
                                                        <SelectItem key={acc.id} value={acc.id}>
                                                            <div className="flex items-center gap-2">
                                                                <CreditCard className="w-4 h-4 text-primary/40" />
                                                                <span className="font-medium">{acc.name}</span>
                                                                <span className="text-primary/50 dark:text-primary-foreground">({acc.bank_name})</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {selectedAccountDetails && (
                                            <div className="bg-primary/50 rounded-lg p-4 border border-primary/20 dark:border-primary/50 dark:bg-primary dark:text-primary-foreground">
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <div className="text-primary/50 font-medium dark:text-primary-foreground">Account Name</div>
                                                        <div className="text-primary/90 font-semibold dark:text-primary-foreground mt-1">{selectedAccountDetails.name}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-primary/50 font-medium dark:text-primary-foreground">Bank</div>
                                                        <div className="text-primary/90 font-semibold dark:text-primary-foreground mt-1">{selectedAccountDetails.bank_name}</div>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <div className="text-primary/50 font-medium dark:text-primary-foreground">Account Number</div>
                                                        <div className="text-primary/90 font-mono font-semibold dark:text-primary-foreground mt-1">{selectedAccountDetails.account_number}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full border-secondary hover:bg-secondary/20 border-2 bg-card text-card-foreground dark:bg-card dark:text-card-foreground"
                                            onClick={() => setShowAddAccount(!showAddAccount)}
                                        >
                                            {showAddAccount ? (
                                                <>
                                                    <X className="w-4 h-4 mr-2" />
                                                    Cancel
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add New Account
                                                </>
                                            )}
                                        </Button>

                                        {showAddAccount && (
                                            <form onSubmit={handleAddAccount} className="space-y-3 pt-4 border-t border-primary/20 dark:border-primary/50">
                                                <div>
                                                    <label className="block text-sm font-medium text-primary/70 dark:text-primary-foreground mb-1">Account Name</label>
                                                    <Input
                                                        placeholder="e.g., Business Savings Account"
                                                        value={newAccount.name}
                                                        onChange={e => setNewAccount(a => ({ ...a, name: e.target.value }))}
                                                        className="border-primary/30 focus:border-blue-500 focus:ring-blue-500 dark:bg-input dark:text-input-foreground dark:border-input-border"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-primary/70 dark:text-primary-foreground mb-1">Account Number</label>
                                                    <Input
                                                        placeholder="Enter account number"
                                                        value={newAccount.account_number}
                                                        onChange={e => setNewAccount(a => ({ ...a, account_number: e.target.value }))}
                                                        className="border-primary/30 focus:border-blue-500 focus:ring-blue-500 dark:bg-input dark:text-input-foreground dark:border-input-border"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-primary/70 dark:text-primary-foreground mb-1">Bank Name</label>
                                                    <Input
                                                        placeholder="e.g., Zambia National Bank"
                                                        value={newAccount.bank_name}
                                                        onChange={e => setNewAccount(a => ({ ...a, bank_name: e.target.value }))}
                                                        className="border-primary/30 focus:border-blue-500 focus:ring-blue-500 dark:bg-input dark:text-input-foreground dark:border-input-border"
                                                        required
                                                    />
                                                </div>
                                                <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground">
                                                    <Plus className="w-4 h-4 mr-2" /> Save Account
                                                </Button>
                                            </form>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-6">
                                <Card className="border-secondary/40 shadow-lg bg-card text-card-foreground dark:bg-card dark:text-card-foreground">
                                    <CardHeader className="bg-gradient-to-br from-secondary to-primary text-primary-foreground dark:text-primary-foreground">
                                        <CardTitle className="text-lg font-bold">Order Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <div className="space-y-4">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <div className="font-medium text-primary/90 dark:text-primary-foreground">{module.name}</div>
                                                        <div className="text-xs text-primary/500 dark:text-primary-foreground mt-0.5">Base module</div>
                                                    </div>
                                                    <div className="font-semibold text-primary/90 dark:text-primary-foreground">ZMW {base.toLocaleString()}</div>
                                                </div>

                                                {selectedAddons.length > 0 && (
                                                    <div className="pt-3 border-t border-primary/20 dark:border-primary/50">
                                                        <div className="text-sm font-medium text-primary/70 dark:text-primary-foreground mb-2">Selected Add-ons ({selectedAddons.length})</div>
                                                        {addons.filter(a => selectedAddons.includes(a.id)).map(a => (
                                                            <div key={a.id} className="flex justify-between items-center py-1.5">
                                                                <div className="text-sm text-primary/60 dark:text-primary-foreground">{a.name}</div>
                                                                <div className="text-sm font-medium text-primary/90 dark:text-primary-foreground">ZMW {a.price.toLocaleString()}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Subtotal */}
                                            <div className="pt-4 border-t border-primary/20 dark:border-primary/50 flex justify-between items-center text-sm">
                                                <span className="text-primary/60 dark:text-primary-foreground">Subtotal</span>
                                                <span className="font-semibold text-primary/90 dark:text-primary-foreground">ZMW {subtotal.toLocaleString()}</span>
                                            </div>

                                            {/* Tax */}
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-primary/60 dark:text-primary-foreground">Tax (16% VAT)</span>
                                                    <Info className="w-3.5 h-3.5 text-primary/40 dark:text-primary-foreground" />
                                                </div>
                                                <span className="font-semibold text-primary/90 dark:text-primary-foreground">ZMW {tax.toLocaleString()}</span>
                                            </div>

                                            {/* Total */}
                                            <div className="pt-4 border-t-2 border-primary/30 dark:border-primary/50 flex justify-between items-center">
                                                <span className="text-lg font-bold text-primary/90 dark:text-primary-foreground">Total</span>
                                                <span className="text-2xl font-bold text-primary/60 dark:text-primary-foreground">ZMW {total.toLocaleString()}</span>
                                            </div>

                                            <Button
                                                className="w-full bg-primary text-primary-foreground font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground"
                                                onClick={handleCheckout}
                                                disabled={isProcessing || !selectedAccount}
                                            >
                                                {isProcessing ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock className="w-5 h-5 mr-2" />
                                                        Complete Purchase
                                                    </>
                                                )}
                                            </Button>

                                            {/* Security */}
                                            <div className="flex items-center justify-center gap-2 text-xs text-primary/50 dark:text-primary-foreground pt-2">
                                                <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                                                <span>Secure payment processing</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Additional Info */}
                                <div className="mt-4 p-4 bg-accent border border-accent-foreground/10 rounded-lg dark:bg-accent dark:text-accent-foreground">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-primary/60 dark:text-primary/50 flex-shrink-0 mt-0.5" />
                                        <div className="text-sm">
                                            <div className="font-semibold mb-1 dark:text-primary-foreground">Need Help?</div>
                                            <p className="text-primary/70 dark:text-primary/50">Our support team is available 24/7 to assist you with your purchase.</p>
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
};

export default ModuleCheckout;
