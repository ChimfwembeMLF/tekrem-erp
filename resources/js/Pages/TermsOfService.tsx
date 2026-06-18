import React from 'react';
import LegalPageShell from '@/Components/Website/LegalPageShell';

interface Props {
  terms: string;
  lastUpdated?: string;
}

export default function TermsOfService({ terms, lastUpdated }: Props) {
  return (
    <LegalPageShell
      pageKey="terms"
      title="Terms of Service"
      description="The rules and guidelines for using our website, products, and services."
      badge="Legal"
      badgeIcon="📄"
      content={terms}
      lastUpdated={lastUpdated}
    />
  );
}
