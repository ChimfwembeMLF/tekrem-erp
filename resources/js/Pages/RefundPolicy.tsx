import React from 'react';
import LegalPageShell from '@/Components/Website/LegalPageShell';

interface Props {
  refund: string;
  lastUpdated?: string;
}

export default function RefundPolicy({ refund, lastUpdated }: Props) {
  return (
    <LegalPageShell
      pageKey="refund"
      title="Refund Policy"
      description="Our approach to refunds, eligibility, and how to request one."
      badge="Legal"
      badgeIcon="↩️"
      content={refund}
      lastUpdated={lastUpdated}
    />
  );
}
