import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { AlertCircle } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Props {
  ticket?: Record<string, unknown>;
  error?: string;
}

export default function TicketStatus({ ticket, error }: Props) {
  const route = useRoute();

  return (
    <GuestLayout title="Ticket Status">
      <Head title="Ticket Status" />
      <GuestPageHero title="Support ticket status" description="Current status of your support request." />

      <div className="mx-auto max-w-lg px-4 py-12">
        {error && (
          <Card className="border-destructive/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {ticket && (
          <Card>
            <CardHeader>
              <CardTitle>{String(ticket.subject)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Ticket" value={String(ticket.ticket_number)} />
              <Row label="Category" value={String(ticket.category)} />
              <Row label="Status" value={String(ticket.status)} />
              <Row label="Priority" value={String(ticket.priority)} />
              {ticket.assigned_to && <Row label="Assigned to" value={String(ticket.assigned_to)} />}
            </CardContent>
          </Card>
        )}

        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href={route('guest.support.ticket.status-form')}>Check another ticket</Link>
        </Button>
      </div>
    </GuestLayout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border pb-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize">{value.replace(/_/g, ' ')}</span>
    </div>
  );
}
