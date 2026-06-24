import React, { PropsWithChildren } from 'react';
import { ThemeProvider } from '@/Components/ThemeProvider';
import { Toaster } from '@/Components/ui/sonner';
import FlashToaster from '@/Components/FlashToaster';
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
      <ThemeProvider defaultTheme="system" storageKey="Tekrem-ui-theme">
        <FlashToaster />
        <Toaster position="top-right" richColors closeButton />
        {children}
      </ThemeProvider>
    </I18nextProvider>
  );
}
