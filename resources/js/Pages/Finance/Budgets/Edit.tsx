import React from 'react';
import { useForm, Link } from '@inertiajs/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Textarea } from '@/Components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Calendar, DollarSign, Building, Target } from 'lucide-react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';
import { FinanceFormShell } from '@/Components/Module/moduleFormWrappers';
import { toast } from 'sonner';

export default function Edit({
  budget,
  accounts,
  categories,
  periodTypes,
  statuses,
}: any) {
  const { t } = useTranslate();
  const route = useRoute();

  const { data, setData, put, processing, errors } = useForm({
    account_id: String(budget.account_id),
    category_id: budget.category_id ? String(budget.category_id) : '',
    name: budget.name,
    description: budget.description || '',
    amount: String(budget.amount),
    period_type: budget.period_type,
    start_date: budget.start_date,
    end_date: budget.end_date,
    status: budget.status,
  });

  const calculateEndDate = (start: string, type: string) => {
    if (!start) return '';

    const d = new Date(start);
    if (isNaN(d.getTime())) return '';

    const map: Record<string, number> = {
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      yearly: 365,
    };

    d.setDate(d.getDate() + (map[type] || 30));
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    put(route('finance.budgets.update', budget.id), {
      onSuccess: () =>
        toast.success(t('finance.budget_updated', 'Budget updated')),
      onError: () =>
        toast.error(t('common.error_occurred', 'Something went wrong')),
    });
  };

  return (
    <FinanceFormShell
      title="Edit Budget"
      backHref={route('finance.budgets.show', budget.id)}
      backLabel="Back"
      onSubmit={handleSubmit}
      processing={processing}
      submitLabel="Update"
      maxWidth="4xl"
    >
      <Card>
        <CardHeader>
          <CardTitle>Budget Details</CardTitle>
          <CardDescription>Update budget configuration</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">

          <div className="grid md:grid-cols-2 gap-4">

            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label>Amount</Label>
              <Input
                type="number"
                value={data.amount}
                onChange={(e) => setData('amount', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Account</Label>
              <Select
                value={data.account_id}
                onValueChange={(v) => setData('account_id', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((a: any) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={data.category_id}
                onValueChange={(v) =>
                  setData('category_id', v === '' ? '' : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {categories.map((c: any) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={data.start_date}
                onChange={(e) => {
                  const v = e.target.value;
                  setData('start_date', v);
                  setData('end_date', calculateEndDate(v, data.period_type));
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={data.end_date}
                onChange={(e) => setData('end_date', e.target.value)}
              />
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              asChild
            >
              <Link href={route('finance.budgets.show', budget.id)}>
                Cancel
              </Link>
            </Button>

            <Button type="submit" disabled={processing}>
              {processing ? 'Saving...' : 'Update Budget'}
            </Button>
          </div>

        </CardContent>
      </Card>
    </FinanceFormShell>
  );
}