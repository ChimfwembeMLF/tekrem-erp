import React from 'react';
import useTypedPage from '@/Hooks/useTypedPage';
import { cn } from '@/lib/utils';
import TekremLogo from '../../../public/logo.png';
import TekremLogoBlue from '../../../public/logo-blue.png';

interface ApplicationMarkProps {
  className?: string;
}

export default function ApplicationMark({ className }: ApplicationMarkProps) {
  const page = useTypedPage();
  const organization = (page.props as {
    organization?: { logo_url?: string | null; display_name?: string; name?: string };
  }).organization;

  if (organization?.logo_url) {
    return (
      <img
        src={organization.logo_url}
        className={cn('h-10 max-w-[160px] object-contain lg:max-w-[200px]', className)}
        alt={organization.display_name || organization.name || 'Organization logo'}
      />
    );
  }

  return (
    <div className={className}>
      <img
        src={TekremLogoBlue}
        className="w-24 lg:w-40 block dark:hidden"
        alt="Logo"
      />
      <img
        src={TekremLogo}
        className="w-24 lg:w-40 hidden dark:block"
        alt="Logo"
      />
    </div>
  );
}
