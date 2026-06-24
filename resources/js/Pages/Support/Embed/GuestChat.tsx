import React from 'react';
import { Head } from '@inertiajs/react';
import GuestChatWidget from '@/Components/GuestChat/GuestChatWidget';
import AppProvider from '@/Providers/AppProvider';

interface Props {
  source: string;
  theme?: string;
  primary_color?: string;
}

export default function GuestChatEmbed({ source, theme = 'light' }: Props) {
  return (
    <AppProvider>
      <Head title="Chat" />
      <GuestChatWidget embedded source={source} theme={theme} />
    </AppProvider>
  );
}
