import React from 'react';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import { 
  User, 
  Settings, 
  LogOut, 
  Globe, 
  Check, 
  ChevronDown,
  Bell,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from '@/Components/ui/dropdown-menu';
import useRoute from '@/Hooks/useRoute';
import useTranslate from '@/Hooks/useTranslate';
import useTypedPage from '@/Hooks/useTypedPage';
import { ThemeToggle } from '@/Components/ThemeProvider';
import { Team, Company } from '@/types';
import { Building } from 'lucide-react';
import NotificationComponent from '@/Components/NotificationComponent';
import ApplicationLogo from './ApplicationLogo';

interface TopNavProps {
  settings: Record<string, any>;
}

export default function TopNav({ settings }: TopNavProps) {
  const route = useRoute();
  const { t, i18n, currentLanguage } = useTranslate();
  const page = useTypedPage();

  // Show cart button for admin/super_user
  const isAdmin = page.props.auth?.user?.roles?.includes('admin') || page.props.auth?.user?.roles?.includes('super_user');

  function switchToTeam(e: React.FormEvent, team: Team) {
    e.preventDefault();
    router.put(
      route('current-team.update'),
      {
        team_id: team.id,
      },
      {
        preserveState: false,
      },
    );
  }

  function logout(e: React.FormEvent) {
    e.preventDefault();
    router.post(route('logout'));
  }

    // Company context (for multi-tenancy)

  const companies: Company[] = page.props.auth?.user?.companies || [];
  const currentCompanyId = page.props.current_company_id || null;
  const currentCompany = companies.find((c) => c.id === currentCompanyId);

  const handleSwitchCompany = (companyId: number) => {
    router.put('/admin/companies/switch', { company_id: companyId }, { preserveState: false });
  };
  return (
    <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 md:pl-[calc(256px+24px)]">  
      {/* Page Title */}
      <div className="flex-1">
        {/* <h1 className="text-lg font-semibold">{settings.site_name || 'TekRem ERP'}</h1> */}
      </div>

      {/* Cart quick access for admin */}
      {isAdmin && (
        <Button variant="ghost" size="icon" onClick={() => router.visit('/admin/modules/cart')} className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-600" />
          <span className="sr-only">Cart</span>
        </Button>
      )}

      {/* Company Switcher (if admin and multiple companies) */}
      {companies.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-600" />
              <span>{currentCompany ? currentCompany.name : 'Select Company'}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Switch Company</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {companies.map((company) => (
              <DropdownMenuItem
                key={company.id}
                onClick={() => handleSwitchCompany(company.id)}
                className={company.id === currentCompanyId ? 'font-bold text-blue-700' : ''}
              >
                {company.name}
                {company.id === currentCompanyId && <Check className="ml-2 h-4 w-4" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="flex items-center gap-1">
              <Globe className="h-5 w-5" />
              <span className="sr-only">{t('common.language', 'Language')}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t('common.language', 'Language')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={currentLanguage}
              onValueChange={(value) => i18n.changeLanguage(value)}
            >
              <DropdownMenuRadioItem value="en">
                <div className="flex items-center">
                  {currentLanguage === 'en' && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  <span>English</span>
                </div>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="bem">
                <div className="flex items-center">
                  {currentLanguage === 'bem' && (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  <span>Bemba</span>
                </div>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <NotificationComponent />

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {page.props.jetstream.managesProfilePhotos ? (
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={page.props.auth.user?.profile_photo_url}
                  alt={page.props.auth.user?.name}
                />
              </Button>
            ) : (
              <Button variant="ghost" className="flex items-center gap-1">
                {page.props.auth.user?.name}
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Manage Account</DropdownMenuLabel>

            <DropdownMenuItem asChild>
              <Link href={route('profile.show')} className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>

            {page.props.jetstream.hasApiFeatures && (
              <DropdownMenuItem asChild>
                <Link href={route('api-tokens.index')} className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>API Tokens</span>
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <button
                className="w-full flex items-center"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log Out</span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
