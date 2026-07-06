import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import GuestPageHero from '@/Components/Website/GuestPageHero';
import GuestFlowShell from '@/Components/Website/GuestFlowShell';
import GuestStatusResult, { statusNextMessage } from '@/Components/Website/GuestStatusResult';
import { GuestFlowType } from '@/Components/Website/GuestFlowIllustration';
import { Card, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { AlertCircle, Search } from 'lucide-react';

type StatusKind = 'inquiry' | 'quote' | 'ticket' | 'project';

interface Props {
  layoutTitle: string;
  heroTitle: string;
  heroDescription: string;
  flowType: GuestFlowType;
  statusKind: StatusKind;
  error?: string;
  resultTitle?: string;
  reference?: string;
  status?: string;
  statusLabel?: string;
  fields?: Array<{ label: string; value: React.ReactNode }>;
  checkAnotherHref: string;
  checkAnotherLabel?: string;
}

export default function GuestStatusView({
  layoutTitle,
  heroTitle,
  heroDescription,
  flowType,
  statusKind,
  error,
  resultTitle,
  reference,
  status,
  statusLabel,
  fields = [],
  checkAnotherHref,
  checkAnotherLabel = 'Check another',
}: Props) {
  return (
    <GuestLayout title={layoutTitle}>
      <Head title={layoutTitle} />
      <GuestPageHero
        title={heroTitle}
        description={heroDescription}
        icon={<Search className="h-6 w-6" />}
        flowType={flowType}
      />

      <GuestFlowShell
        flowType={flowType}
        steps={['Enter reference', 'View live status', 'Follow up if needed']}
        currentStep={reference ? 2 : error ? 0 : 1}
        title="Status details"
        description="Your latest update from our team."
      >
        {error && (
          <Card className="border-destructive/50 shadow-lg">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {reference && status && (
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <GuestStatusResult
                title={resultTitle ?? 'Your request'}
                reference={reference}
                status={status}
                statusLabel={statusLabel}
                fields={fields}
                nextMessage={statusNextMessage(status, statusKind)}
              />
              <Button asChild variant="outline" className="mt-6 w-full">
                <Link href={checkAnotherHref}>{checkAnotherLabel}</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </GuestFlowShell>
    </GuestLayout>
  );
}
