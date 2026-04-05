import React from 'react';
import TekremLogo from '../../../public/logo.png';
import TekremLogoBlue from '../../../public/logo-blue.png';

export default function ApplicationMark() {
  return (
    <div>
      {/* Light mode */}
      <img
        src={TekremLogoBlue}
        className="w-24 lg:w-40 block dark:hidden"
        alt="Logo"
      />

      {/* Dark mode */}
      <img
        src={TekremLogo}
        className="w-24 lg:w-40 hidden dark:block"
        alt="Logo"
      />
    </div>
  );
}