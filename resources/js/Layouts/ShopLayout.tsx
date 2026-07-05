import React, { PropsWithChildren } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import ShopSheetProvider from '@/Components/Shop/ShopSheetProvider';
import ShopGuestMerge from '@/Components/Shop/ShopGuestMerge';

interface Props extends PropsWithChildren {
  title: string;
  cartCount?: number;
}

export default function ShopLayout({ title, cartCount = 0, children }: Props) {
  return (
    <GuestLayout title={title}>
      <ShopSheetProvider initialCartCount={cartCount}>
        <ShopGuestMerge />
        {children}
      </ShopSheetProvider>
    </GuestLayout>
  );
}
