import React from 'react';
import AuthenticationCardLogo from '@/Components/AuthenticationCardLogo';
import { Head } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';

interface Props {
  refund: string;
}

export default function RefundPolicy({ refund }: Props) {
  return (
    <GuestLayout title="Refund Policy">
      <div className="font-sans text-gray-900 antialiased">
        <Head title="Refund Policy" />
        <div className="pt-4 bg-gray-100">
          <div className="min-h-screen flex flex-col items-center pt-6 sm:pt-0">
            <div>
              <AuthenticationCardLogo />
            </div>

            <div
              className="w-full sm:max-w-2xl mt-6 p-6 bg-white shadow-md overflow-hidden sm:rounded-lg prose"
              dangerouslySetInnerHTML={{ __html: refund }}
            />
          </div>
        </div>
      </div>
    </GuestLayout>
  );
}
