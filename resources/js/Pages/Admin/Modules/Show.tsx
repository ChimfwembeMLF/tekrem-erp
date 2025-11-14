import AppLayout from '@/Layouts/AppLayout';
import React from 'react';
import useTranslate from '@/Hooks/useTranslate';
import useRoute from '@/Hooks/useRoute';

export default function Show() {
  const { t } = useTranslate();
  const route = useRoute();
  return (
    <AppLayout
      title={t('admin.module_details', 'Module Details')}
      renderHeader={() => (
        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
          {t('admin.module_details', 'Module Details')}
        </h2>
      )}
    >
      {/* Add module details here if needed */}
    </AppLayout>
  );
}
