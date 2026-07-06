import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import {
  LayoutDashboard,
  ShoppingCart,
  Smartphone,
  Wallet,
  Package,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import useRoute from '@/Hooks/useRoute';

const tabs = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    title: 'One workspace for your whole business',
    description: 'Role-based modules, live KPIs, and quick actions — filtered by your plan.',
    highlights: ['Multi-module sidebar', 'Trial & billing banners', 'Org switcher'],
  },
  {
    id: 'pos',
    label: 'POS',
    icon: Smartphone,
    title: 'Counter sales with stock & MoMo',
    description: 'Ring up sales, issue stock, and collect PawaPay at the till.',
    highlights: ['Register sessions', 'Walk-in & MoMo pay', 'Printable receipts'],
  },
  {
    id: 'shop',
    label: 'Online shop',
    icon: ShoppingCart,
    title: 'Ecommerce tied to inventory',
    description: 'Product catalogue, checkout, shipping, and order tracking in one flow.',
    highlights: ['Guest checkout', 'PawaPay checkout', 'Order fulfilment'],
  },
  {
    id: 'finance',
    label: 'Finance & ZRA',
    icon: Wallet,
    title: 'Invoices, MoMo, and Smart Invoice',
    description: 'Accounts, quotations, PawaPay collections, and ZRA compliance built in.',
    highlights: ['Chart of accounts', 'PawaPay billing', 'ZRA submissions'],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    title: 'Stock that follows sales & POs',
    description: 'Warehouses, levels, movements, and procurement receipts stay in sync.',
    highlights: ['Multi-warehouse', 'Sales reservations', 'Goods received'],
  },
] as const;

type TabId = (typeof tabs)[number]['id'];

function MockChrome({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-2xl shadow-primary/5">
      <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
        <span className="ml-3 truncate text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex min-h-[280px] bg-background">{children}</div>
    </div>
  );
}

function MockSidebar({ items }: { items: string[] }) {
  return (
    <div className="hidden w-36 shrink-0 border-r bg-muted/30 p-3 sm:block">
      <div className="mb-4 h-6 w-20 rounded bg-primary/20" />
      {items.map((item, i) => (
        <div
          key={item}
          className={cn(
            'mb-2 h-7 rounded-md px-2 text-[10px] leading-7',
            i === 0 ? 'bg-primary/15 font-semibold text-primary' : 'text-muted-foreground',
          )}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function MockDashboard() {
  return (
    <MockChrome label="app.tekrem.test/dashboard">
      <MockSidebar items={['Dashboard', 'Sales', 'Inventory', 'Finance', 'POS']} />
      <div className="flex-1 p-4">
        <div className="mb-4 h-5 w-32 rounded bg-foreground/10" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
          {['Revenue', 'Orders', 'Stock alerts'].map((k) => (
            <div key={k} className="rounded-lg border bg-card p-3">
              <p className="text-[10px] text-muted-foreground">{k}</p>
              <p className="mt-1 text-lg font-bold text-foreground">—</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border bg-card p-3">
          <div className="h-3 w-24 rounded bg-muted" />
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 rounded bg-muted/60" />
            ))}
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

function MockPos() {
  return (
    <MockChrome label="POS — Main register">
      <div className="grid flex-1 grid-cols-2 gap-0">
        <div className="border-r p-3">
          <div className="grid grid-cols-2 gap-2">
            {['Product A', 'Product B', 'Product C', 'Product D'].map((p) => (
              <div key={p} className="rounded-lg border bg-card p-2 text-center text-[10px]">
                <div className="mx-auto mb-1 h-8 w-8 rounded bg-primary/10" />
                {p}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-muted/20 p-3">
          <p className="text-xs font-semibold">Cart</p>
          <div className="mt-2 space-y-2">
            <div className="h-6 rounded bg-card" />
            <div className="h-6 rounded bg-card" />
          </div>
          <div className="mt-4 rounded-lg bg-primary/10 p-2 text-center text-sm font-bold text-primary">
            Pay with MoMo
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

function MockShop() {
  return (
    <MockChrome label="Shop — checkout">
      <div className="flex-1 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border bg-card p-2">
              <div className="mb-2 aspect-square rounded bg-muted" />
              <div className="h-2 w-3/4 rounded bg-muted" />
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs">
          Checkout · PawaPay · ZMW
        </div>
      </div>
    </MockChrome>
  );
}

function MockFinance() {
  return (
    <MockChrome label="Finance — invoices & MoMo">
      <MockSidebar items={['Dashboard', 'Invoices', 'MoMo', 'ZRA', 'Reports']} />
      <div className="flex-1 p-4">
        <div className="mb-3 flex gap-2">
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-700 dark:text-emerald-400">
            PawaPay connected
          </span>
          <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] text-blue-700 dark:text-blue-400">
            ZRA ready
          </span>
        </div>
        <div className="space-y-2">
          {['INV-202607-0001', 'INV-202607-0002'].map((inv) => (
            <div key={inv} className="flex items-center justify-between rounded-lg border bg-card px-3 py-2 text-[11px]">
              <span className="font-mono">{inv}</span>
              <span className="text-emerald-600">Paid</span>
            </div>
          ))}
        </div>
      </div>
    </MockChrome>
  );
}

function MockInventory() {
  return (
    <MockChrome label="Inventory — stock levels">
      <MockSidebar items={['Products', 'Warehouses', 'Movements', 'POs']} />
      <div className="flex-1 p-4">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-left text-muted-foreground">
              <th className="pb-2">SKU</th>
              <th className="pb-2">On hand</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['SKU-001', '142', 'OK'],
              ['SKU-002', '8', 'Low'],
              ['SKU-003', '0', 'Out'],
            ].map(([sku, qty, st]) => (
              <tr key={sku} className="border-t">
                <td className="py-2 font-mono">{sku}</td>
                <td className="py-2">{qty}</td>
                <td className="py-2">{st}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MockChrome>
  );
}

const mockViews: Record<TabId, React.ReactNode> = {
  dashboard: <MockDashboard />,
  pos: <MockPos />,
  shop: <MockShop />,
  finance: <MockFinance />,
  inventory: <MockInventory />,
};

export default function ErpProductShowcase() {
  const route = useRoute();
  const [active, setActive] = useState<TabId>('dashboard');
  const current = tabs.find((t) => t.id === active)!;

  return (
    <section className="relative overflow-hidden bg-background py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            Tekrem ERP
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            See the system before you sign up
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Explore modules your team will use daily — POS, shop, finance, inventory, and more.
            Start a free trial when you&apos;re ready.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
                  active === tab.id
                    ? 'border-primary bg-primary text-primary-foreground shadow-md'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:items-start">
          <div className="lg:col-span-7">{mockViews[active]}</div>
          <div className="lg:col-span-5">
            <h3 className="text-2xl font-bold text-foreground">{current.title}</h3>
            <p className="mt-3 text-muted-foreground">{current.description}</p>
            <ul className="mt-6 space-y-3">
              {current.highlights.map((h) => (
                <li key={h} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {h}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-gradient-to-r from-secondary to-primary">
                <Link href={route('erp.plans')}>
                  View plans & trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={route('login')}>Sign in to demo</Link>
              </Button>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Tip: replace these live previews with real screenshots in{' '}
              <code className="rounded bg-muted px-1">public/assets/product/</code> when ready.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
