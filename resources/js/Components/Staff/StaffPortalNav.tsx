import React from 'react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import useRoute from '@/Hooks/useRoute';
import { LayoutDashboard, Calendar, Clock, Receipt, User, Users } from 'lucide-react';

const items = [
  { label: 'Home', route: 'staff.dashboard', pattern: 'staff.dashboard', icon: LayoutDashboard },
  { label: 'Leave', route: 'staff.leave.index', pattern: 'staff.leave.*', icon: Calendar },
  { label: 'Attendance', route: 'staff.attendance.index', pattern: 'staff.attendance.*', icon: Clock },
  { label: 'Payslips', route: 'staff.payslips.index', pattern: 'staff.payslips.*', icon: Receipt },
  { label: 'Profile', route: 'staff.profile.edit', pattern: 'staff.profile.*', icon: User },
];

export default function StaffPortalNav({ showTeam = false }: { showTeam?: boolean }) {
  const route = useRoute();

  const navItems = showTeam
    ? [...items, { label: 'My team', route: 'staff.team.index', pattern: 'staff.team.*', icon: Users }]
    : items;

  return (
    <nav className="overflow-x-auto rounded-xl border border-border/60 bg-card/80 p-2 shadow-sm">
      <div className="flex min-w-max gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = route().current(item.pattern);

          return (
            <Link
              key={item.route}
              href={route(item.route)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
