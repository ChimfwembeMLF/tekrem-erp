import React, { useEffect, useState } from 'react';
import { Head } from '@inertiajs/react';
import RegistrationWizard from './RegistrationWizard';

export default function Register() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    fetch('/api/packages')
      .then(res => res.json())
      .then(data => {
        setPackages(data.packages || []);
        setLoading(false);
        // Preselect package from query param
        const urlParams = new URLSearchParams(window.location.search);
        const packageSlug = urlParams.get('package');
        if (packageSlug) {
          const pkg = (data.packages || []).find(p => p.slug === packageSlug);
          if (pkg) setSelectedPackage(pkg);
        }
      });
  }, []);

  if (loading) return <div className="py-10 text-center">Loading packages...</div>;

  return (
    <div className="w-full mx-auto py-10">
      <Head title="Register" />
      <RegistrationWizard packages={packages} preselectedPackage={selectedPackage} />
    </div>
  );
}
