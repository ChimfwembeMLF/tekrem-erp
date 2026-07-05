import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ModuleDashboardShell, { ModuleStatCard } from '@/Components/Dashboard/ModuleDashboardShell';
import EcommerceModuleNav from '@/Components/Ecommerce/EcommerceModuleNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { formatZmw } from '@/lib/formatCurrency';

interface Props {
  stats: {
    total_orders: number;
    total_revenue: number;
    paid_revenue: number;
    pending_orders: number;
    cancelled_orders: number;
    average_order_value: number;
  };
  monthly: Array<{ label: string; orders: number; revenue: number }>;
  topProducts: Array<{ product_id: number; name: string; units_sold: number; revenue: number }>;
  paymentBreakdown: Array<{ method: string; count: number; total: number }>;
}

const PIE_COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export default function EcommerceAnalytics({ stats, monthly, topProducts, paymentBreakdown }: Props) {
  return (
    <ModuleDashboardShell
      title="Shop analytics"
      description="Online store performance and trends"
      workspaceLabel="Ecommerce workspace"
      heroAccent="from-emerald-500/15 via-emerald-500/5 to-secondary/10"
      moduleNav={<EcommerceModuleNav />}
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ModuleStatCard label="Total orders" value={stats.total_orders} />
        <ModuleStatCard label="Revenue" value={formatZmw(stats.total_revenue)} />
        <ModuleStatCard label="Paid (MoMo)" value={formatZmw(stats.paid_revenue)} />
        <ModuleStatCard label="Avg order value" value={formatZmw(stats.average_order_value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ModuleStatCard label="Pending fulfillment" value={stats.pending_orders} variant={stats.pending_orders ? 'warning' : 'default'} />
        <ModuleStatCard label="Cancelled" value={stats.cancelled_orders} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Orders & revenue (12 months)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value, name) => name === 'revenue' ? formatZmw(Number(value)) : value} />
                <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#3B82F6" strokeWidth={2} name="Orders" />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Payment methods</CardTitle></CardHeader>
          <CardContent>
            {paymentBreakdown.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No payment data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={paymentBreakdown} dataKey="total" nameKey="method" cx="50%" cy="50%" outerRadius={90} label={({ method }) => method}>
                    {paymentBreakdown.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatZmw(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Top products by revenue</CardTitle></CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No product sales yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(240, topProducts.length * 36)}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => formatZmw(v)} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatZmw(Number(value))} />
                <Bar dataKey="revenue" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </ModuleDashboardShell>
  );
}
