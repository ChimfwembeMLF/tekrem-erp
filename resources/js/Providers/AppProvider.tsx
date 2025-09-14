import React, { PropsWithChildren } from 'react';
import { ThemeProvider } from '@/Components/ThemeProvider';
import { Toaster } from 'sonner';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

interface AppProviderProps {
  // Add any additional props here
}

export default function AppProvider({ 
  children 
}: PropsWithChildren<AppProviderProps>) {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider defaultTheme="light" storageKey="tekrem-ui-theme">
        <Toaster position="top-right" />
        {children}
      </ThemeProvider>
    </I18nextProvider>
  );
}
