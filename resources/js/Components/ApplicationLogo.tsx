import React from 'react';
import Logo from '../../../public/logo.svg';
export default function ApplicationLogo({ className }: { className?: string }) {
  return (
    <img src={Logo} className={` ${className}`} />
  );
}
