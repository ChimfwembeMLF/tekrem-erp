import React from 'react';
import { Link } from '@inertiajs/react';
import { router } from '@inertiajs/core';
import { 
  User, 
  Settings, 
  LogOut, 
  Globe, 
  Check, 
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
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
import { Team } from '@/types';
import NotificationComponent from '@/Components/NotificationComponent';
import StaffClockWidget from '@/Components/HR/StaffClockWidget';

interface TopNavProps {
  settings: Record<string, any>;
}

export default function TopNav({ settings }: TopNavProps) {
  const route = useRoute();
  const { t, i18n, currentLanguage } = useTranslate();
  const page = useTypedPage();

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

  const user = page.props.auth?.user;
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .filter(Boolean)
        .map((part: string) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center border-b bg-background pl-14 pr-3 sm:pl-16 sm:pr-4 md:px-6 md:pl-[calc(256px+24px)]">
      <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
        <StaffClockWidget />

        {(page.props as { staffPortal?: { dashboard_url: string; pending_team_leaves?: number } }).staffPortal && (
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link href={(page.props as any).staffPortal.dashboard_url}>
              My HR
              {(page.props as any).staffPortal.pending_team_leaves > 0 && (
                <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {(page.props as any).staffPortal.pending_team_leaves}
                </span>
              )}
            </Link>
          </Button>
        )}

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="hidden h-9 w-9 shrink-0 sm:inline-flex"
              title={t('common.language', 'Language')}
            >
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

        <NotificationComponent />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 shrink-0 rounded-full p-0"
              title={user?.name ?? 'Account'}
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.profile_photo_url} alt={user?.name ?? 'User'} />
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                {user?.email && (
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={route('profile.show')} className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            {(page.props as { staffPortal?: { dashboard_url: string } }).staffPortal && (
              <DropdownMenuItem asChild>
                <Link href={(page.props as any).staffPortal.dashboard_url} className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>My HR</span>
                </Link>
              </DropdownMenuItem>
            )}

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
    </header>
  );
}
