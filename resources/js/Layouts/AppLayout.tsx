import React, { PropsWithChildren } from 'react';
import { Head } from '@inertiajs/react';
import useTypedPage from '@/Hooks/useTypedPage';
import Sidebar from '@/Components/Sidebar';
import TopNav from '@/Components/TopNav';
import BreadcrumbNavigation from '@/Components/BreadcrumbNavigation';
import AppProvider from '@/Providers/AppProvider';
import SupportChatWidget from '@/Components/Support/SupportChatWidget';
import SupportStaffAlertsListener from '@/Components/Support/SupportStaffAlertsListener';
import ShopGuestMerge from '@/Components/Shop/ShopGuestMerge';

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

        {/* Sidebar Navigation */}
        <Sidebar settings={settings} />

        {/* Main Content Area */}
        <div className="md:pl-64 flex flex-col flex-1">
          {/* Top Navigation */}
          <TopNav settings={settings} />

          {(page.props as { organization?: { onboarding?: { completed?: boolean; progress?: number; url?: string }; needs_payment?: boolean; is_on_trial?: boolean; trial_ends_at?: string | null; billing_url?: string; plan?: { name: string } | null; role?: string } }).organization?.onboarding &&
            !(page.props as { organization?: { onboarding?: { completed?: boolean } } }).organization?.onboarding?.completed &&
            ['owner', 'admin'].includes((page.props as any).organization?.role ?? '') && (
            <div className="border-b border-blue-500/30 bg-blue-500/10 px-4 py-2 text-center text-sm md:px-6">
              <span className="text-blue-900 dark:text-blue-100">
                Company onboarding {(page.props as any).organization.onboarding.progress ?? 0}% complete —{' '}
                <a
                  href={(page.props as any).organization.onboarding.url}
                  className="font-semibold underline underline-offset-2"
                >
                  Submit required information
                </a>
              </span>
            </div>
          )}

          {(page.props as { organization?: { needs_payment?: boolean; is_on_trial?: boolean; trial_ends_at?: string | null; billing_url?: string; plan?: { name: string } | null } }).organization?.needs_payment && (
            <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-sm md:px-6">
              <span className="text-amber-900 dark:text-amber-100">
                Subscription payment required —{' '}
                <a
                  href={(page.props as any).organization.billing_url}
                  className="font-semibold underline underline-offset-2"
                >
                  Pay with PawaPay
                </a>
              </span>
            </div>
          )}

          {(page.props as { organization?: { is_on_trial?: boolean; trial_ends_at?: string | null; billing_url?: string; plan?: { name: string } | null } }).organization?.is_on_trial &&
            !(page.props as { organization?: { needs_payment?: boolean } }).organization?.needs_payment && (
            <div className="border-b border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-center text-sm md:px-6">
              <span className="text-emerald-900 dark:text-emerald-100">
                {(page.props as any).organization.plan?.name ?? 'Trial'} plan — trial ends{' '}
                {(page.props as any).organization.trial_ends_at
                  ? new Date((page.props as any).organization.trial_ends_at).toLocaleDateString()
                  : 'soon'}
                .{' '}
                <a
                  href={(page.props as any).organization.billing_url}
                  className="font-semibold underline underline-offset-2"
                >
                  View billing
                </a>
              </span>
            </div>
          )}

          {/* Page Heading */}
          {renderHeader && (
            <header className="bg-card shadow">
              <div className=" mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {renderHeader()}
              </div>
            </header>
          )}

          {/* Page Content */}
          <main className="flex-1 p-4 md:p-6">
            <BreadcrumbNavigation className="mb-4" />
            <div className="">
              {children}
            </div>
          </main>
        </div>
      </div>
      {page.props.auth?.user && <SupportStaffAlertsListener />}
      {page.props.auth?.user && <SupportChatWidget />}
      {page.props.auth?.user && <ShopGuestMerge />}
    </AppProvider>
  );
}
