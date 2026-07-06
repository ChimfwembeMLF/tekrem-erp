import React from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Badge } from '@/Components/ui/badge';
import { ArrowLeft, Link2, Loader2, Save, ShoppingCart } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface AccountOption {
  id: number;
  name: string;
  account_code: string | null;
  type: string;
}

interface ClientOption {
  id: number;
  name: string;
  email: string | null;
}

interface CommerceSettings {
  auto_post_to_finance: boolean;
  revenue_account_id: number | null;
  vat_account_id: number | null;
  cash_account_id: number | null;
  walk_in_client_id: number | null;
  auto_zra: boolean;
  zra_auto_approve: boolean;
  is_configured: boolean;
}

interface Props {
  settings: CommerceSettings;
  accounts: AccountOption[];
  clients: ClientOption[];
}

function accountLabel(account: AccountOption): string {
  return account.account_code ? `${account.account_code} — ${account.name}` : account.name;
}

export default function CommerceFinanceSettings({ settings, accounts, clients }: Props) {
  const route = useRoute();

  const { data, setData, put, processing, transform } = useForm({
    auto_post_to_finance: settings.auto_post_to_finance,
    revenue_account_id: settings.revenue_account_id ? String(settings.revenue_account_id) : '',
    vat_account_id: settings.vat_account_id ? String(settings.vat_account_id) : '',
    cash_account_id: settings.cash_account_id ? String(settings.cash_account_id) : '',
    walk_in_client_id: settings.walk_in_client_id ? String(settings.walk_in_client_id) : '',
    auto_zra: settings.auto_zra,
    zra_auto_approve: settings.zra_auto_approve,
  });

  transform((form) => ({
    auto_post_to_finance: form.auto_post_to_finance,
    revenue_account_id: form.revenue_account_id ? Number(form.revenue_account_id) : null,
    vat_account_id: form.vat_account_id ? Number(form.vat_account_id) : null,
    cash_account_id: form.cash_account_id ? Number(form.cash_account_id) : null,
    walk_in_client_id: form.walk_in_client_id ? Number(form.walk_in_client_id) : null,
    auto_zra: form.auto_zra,
    zra_auto_approve: form.zra_auto_approve,
  }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    put(route('settings.finance.commerce.update'), {
      preserveScroll: true,
    });
  };

  return (
    <AppLayout
      title="Commerce Finance"
      renderHeader={() => (
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.visit(route('settings.finance.index'))}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Commerce → Finance</h2>
          </div>
          {settings.is_configured ? (
            <Badge className="bg-emerald-600">Active</Badge>
          ) : (
            <Badge variant="outline">Not configured</Badge>
          )}
        </div>
      )}
    >
      <Head title="Commerce Finance Settings" />

      <div className="mx-auto max-w-3xl space-y-6 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              POS & shop revenue posting
            </CardTitle>
            <CardDescription>
              When enabled, paid POS and online shop orders automatically create Finance invoices, payments, and
              ledger entries. MoMo sales use the PawaPay clearing account when configured.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-6">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="auto_post">Auto-post paid sales to Finance</Label>
                  <p className="text-sm text-muted-foreground">Master toggle for POS and ecommerce orders.</p>
                </div>
                <Switch
                  id="auto_post"
                  checked={data.auto_post_to_finance}
                  onCheckedChange={(checked) => setData('auto_post_to_finance', checked)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Revenue account (credit)</Label>
                  <Select value={data.revenue_account_id} onValueChange={(v) => setData('revenue_account_id', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={String(account.id)}>
                          {accountLabel(account)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cash / card account (debit)</Label>
                  <Select value={data.cash_account_id} onValueChange={(v) => setData('cash_account_id', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={String(account.id)}>
                          {accountLabel(account)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>VAT payable account (optional)</Label>
                  <Select value={data.vat_account_id || 'none'} onValueChange={(v) => setData('vat_account_id', v === 'none' ? '' : v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Same as revenue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Credit tax to revenue account</SelectItem>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={String(account.id)}>
                          {accountLabel(account)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Walk-in customer (POS without client)</Label>
                  <Select
                    value={data.walk_in_client_id || 'auto'}
                    onValueChange={(v) => setData('walk_in_client_id', v === 'auto' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto-create walk-in client" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-create walk-in client</SelectItem>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={String(client.id)}>
                          {client.name}
                          {client.email ? ` (${client.email})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto_zra">Auto-submit invoices to ZRA</Label>
                    <p className="text-sm text-muted-foreground">Requires ZRA configuration and valid invoice data.</p>
                  </div>
                  <Switch
                    id="auto_zra"
                    checked={data.auto_zra}
                    onCheckedChange={(checked) => setData('auto_zra', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="zra_auto_approve">ZRA auto-approve when supported</Label>
                  </div>
                  <Switch
                    id="zra_auto_approve"
                    checked={data.zra_auto_approve}
                    onCheckedChange={(checked) => setData('zra_auto_approve', checked)}
                    disabled={!data.auto_zra}
                  />
                </div>
              </div>

              <Button type="submit" disabled={processing} className="w-full sm:w-auto">
                {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save settings
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
