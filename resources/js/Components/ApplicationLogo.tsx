import React from 'react';
import useTypedPage from '@/Hooks/useTypedPage';
import { cn } from '@/lib/utils';
import Logo from '../../../public/favicon.svg';

interface ApplicationLogoProps {
  className?: string;
}

export default function ApplicationLogo({ className }: ApplicationLogoProps) {
  const page = useTypedPage();
  const organization = (page.props as {
    organization?: { logo_url?: string | null; display_name?: string; name?: string };
  }).organization;

  if (organization?.logo_url) {
    return (
      <img
        src={organization.logo_url}
        className={cn('h-12 max-w-[180px] object-contain', className)}
        alt={organization.display_name || organization.name || 'Organization logo'}
      />
    );
  }

  return <img src={Logo} className={cn('', className)} alt="Logo" />;
}
