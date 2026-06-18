import React from 'react';
import LegalPageShell from '@/Components/Website/LegalPageShell';

interface Props {
  policy: string;
  lastUpdated?: string;
}

export default function PrivacyPolicy({ policy, lastUpdated }: Props) {
  return (
    <LegalPageShell
      pageKey="privacy"
      title="Privacy Policy"
      description="How we collect, use, and protect your personal information when you use our services."
      badge="Legal"
      badgeIcon="🛡️"
      content={policy}
      lastUpdated={lastUpdated}
    />
  );
}
