import React from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

interface Module {
  name: string;
  description: string;
}

interface Props {
  modules: Module[];
}

export default function Index({ modules }: Props) {
  return (
  <AppLayout title='Module Management'>
      <div className="container mx-auto py-8">
      <Head title="Modules" />
      <h1 className="text-2xl font-bold mb-6">System Modules</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <div
            key={module.name}
            className="bg-white rounded shadow p-6 hover:shadow-lg transition-shadow border border-gray-100"
          >
            <h2 className="text-xl font-semibold mb-2">{module.name}</h2>
            <p className="text-gray-600">{module.description}</p>
          </div>
        ))}
      </div>
    </div>
  </AppLayout>
  );
}
