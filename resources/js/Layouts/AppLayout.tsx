import React, { PropsWithChildren } from 'react';
import { Head } from '@inertiajs/react';
import useTypedPage from '@/Hooks/useTypedPage';
import Banner from '@/Components/Banner';
import Sidebar from '@/Components/Sidebar';
import TopNav from '@/Components/TopNav';
import BreadcrumbNavigation from '@/Components/BreadcrumbNavigation';
import AppProvider from '@/Providers/AppProvider';
import { Toaster } from '@/Components/ui/sonner';

interface Props {
  title: string;
  renderHeader?(): JSX.Element;
}

export default function AppLayout({
  title,
  renderHeader,
  children,
}: PropsWithChildren<Props>) {
  const page = useTypedPage();

  // Get settings from Inertia shared props
  const settings = page.props.settings || {};

  return (
    <AppProvider>
      <div className="min-h-screen bg-background">
        <Head title={title} />
        {/* <Banner /> */}

        {/* Sidebar Navigation */}
        <Sidebar settings={settings} />

        {/* Main Content Area */}
        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top Navigation */}
          <TopNav settings={settings} />

          {/* Page Heading */}
          {renderHeader && (
            <header className="bg-card shadow">
              <div className=" mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {renderHeader()}
                {/* Breadcrumb Navigation */}
              <BreadcrumbNavigation className="mb-6" />
              </div>
            </header>
          )}

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6">
            <div className="">
              
              {children}
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </AppProvider>
  );
}
