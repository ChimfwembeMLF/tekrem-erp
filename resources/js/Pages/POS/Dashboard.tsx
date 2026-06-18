import React, { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { Badge } from '@/Components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import useRoute from '@/Hooks/useRoute';
import ModuleDashboardShell, { ModuleStatCard, RecentRows } from '@/Components/Dashboard/ModuleDashboardShell';
import { Lock } from 'lucide-react';

interface Register { id: number; name: string; requires_pin?: boolean; warehouse: { name: string } }
interface Session { id: number; register: Register; user: { name: string }; opened_at: string }
interface Props {
  registers: Register[];
  openSessions: Session[];
  stats: { registers: number; open_sessions: number };
  canManageRegisters: boolean;
}

export default function PosDashboard({ registers, openSessions, stats, canManageRegisters }: Props) {
  const route = useRoute();
  const { errors } = usePage().props as { errors: Record<string, string> };
  const [openingRegister, setOpeningRegister] = useState<Register | null>(null);
  const [pin, setPin] = useState('');
  const [openingCash, setOpeningCash] = useState('0');

  const submitOpenSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!openingRegister) return;

    router.post(route('pos.sessions.open', openingRegister.id), {
      pin: pin || undefined,
      opening_cash: openingCash || 0,
    }, {
      onFinish: () => {
        setOpeningRegister(null);
        setPin('');
        setOpeningCash('0');
      },
    });
  };

  return (
    <ModuleDashboardShell
      title="Point of Sale"
      description="Registers, sessions, and checkout"
      actions={canManageRegisters ? (
        <Button asChild variant="outline">
          <Link href={route('pos.registers.index')}>Manage terminals</Link>
        </Button>
      ) : undefined}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <ModuleStatCard label="Active terminals" value={stats.registers} />
        <ModuleStatCard label="Open sessions" value={stats.open_sessions} variant={stats.open_sessions ? 'success' : 'default'} />
      </div>

      {errors.pin && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 text-sm text-destructive">{errors.pin}</CardContent>
        </Card>
      )}

      {errors.register && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6 text-sm text-destructive">{errors.register}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {registers.map((register) => (
          <Card key={register.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">{register.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{register.warehouse.name}</p>
                </div>
                {register.requires_pin && (
                  <Badge variant="outline" className="gap-1">
                    <Lock className="h-3 w-3" />
                    PIN
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button onClick={() => setOpeningRegister(register)}>Open session</Button>
              <Button variant="outline" asChild>
                <Link href={route('pos.terminal', register.id)}>Go to terminal</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {registers.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No active terminals yet.
            {canManageRegisters && (
              <div className="mt-4">
                <Button asChild><Link href={route('pos.registers.index')}>Create a terminal</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <RecentRows
        title="Open sessions"
        emptyMessage="No registers are currently open."
        rows={openSessions.map((session) => ({
          id: session.id,
          href: route('pos.terminal', session.register.id),
          primary: session.register.name,
          secondary: `${session.user.name} · opened ${new Date(session.opened_at).toLocaleString()}`,
        }))}
      />

      <Dialog open={!!openingRegister} onOpenChange={open => !open && setOpeningRegister(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Open session — {openingRegister?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitOpenSession} className="space-y-4">
            {openingRegister?.requires_pin && (
              <div>
                <Label>Terminal PIN</Label>
                <Input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder="Enter terminal PIN"
                  required
                  autoFocus
                />
              </div>
            )}
            <div>
              <Label>Opening cash float</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={openingCash}
                onChange={e => setOpeningCash(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpeningRegister(null)}>Cancel</Button>
              <Button type="submit">Open session</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </ModuleDashboardShell>
  );
}
