import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { AlertCircle } from 'lucide-react';
import useRoute from '@/Hooks/useRoute';

interface Props {
  inquiry?: Record<string, unknown>;
  error?: string;
}

export default function Status({ inquiry, error }: Props) {
  const route = useRoute();

  return (
    <GuestLayout title="Project Status">
      <Head title="Project Status" />
      <GuestPageHero title="Project consultation status" description="Track your project inquiry." />

      <div className="mx-auto max-w-lg px-4 py-12">
        {error && (
          <Card className="border-destructive/50">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {inquiry && (
          <Card>
            <CardHeader>
              <CardTitle>{String(inquiry.project_title ?? 'Project inquiry')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row label="Reference" value={String(inquiry.reference_number)} />
              <Row label="Type" value={String(inquiry.project_type)} />
              <Row label="Status" value={String(inquiry.status)} />
              <Row label="Priority" value={String(inquiry.priority)} />
              {inquiry.assigned_to && <Row label="Assigned to" value={String(inquiry.assigned_to)} />}
            </CardContent>
          </Card>
        )}

        <Button asChild variant="outline" className="mt-6 w-full">
          <Link href={route('guest.project.status-form')}>Check another project</Link>
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
