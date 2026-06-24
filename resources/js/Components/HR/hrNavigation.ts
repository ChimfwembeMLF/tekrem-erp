import {
  LayoutDashboard,
  Briefcase,
  UserPlus,
  UserMinus,
  Users,
  Building,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  GraduationCap,
  Settings,
  BarChart3,
  ExternalLink,
  type LucideIcon,
} from 'lucide-react';
import useRoute from '@/Hooks/useRoute';
import useTranslate from '@/Hooks/useTranslate';

export type HrNavItem = {
  label: string;
  href: string;
  pattern: string;
  icon: LucideIcon;
};

export type HrNavGroup = {
  label: string;
  items: HrNavItem[];
};

export function useHrNavigation(): { groups: HrNavGroup[]; isActive: (pattern: string) => boolean } {
  const route = useRoute();
  const { t } = useTranslate();

  const groups: HrNavGroup[] = [
    {
      label: t('hr.overview', 'Overview'),
      items: [
        {
          label: t('hr.dashboard', 'Dashboard'),
          href: route('hr.dashboard'),
          pattern: 'hr.dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      label: t('hr.talent', 'Talent'),
      items: [
        {
          label: t('hr.recruitment', 'Recruitment'),
          href: route('hr.recruitment.index'),
          pattern: 'hr.recruitment.*',
          icon: Briefcase,
        },
        {
          label: t('hr.onboarding', 'Onboarding'),
          href: route('hr.onboarding.index'),
          pattern: 'hr.onboarding.*',
          icon: UserPlus,
        },
        {
          label: t('hr.offboarding', 'Offboarding'),
          href: route('hr.offboarding.index'),
          pattern: 'hr.offboarding.*',
          icon: UserMinus,
        },
      ],
    },
    {
      label: t('hr.people', 'People'),
      items: [
        {
          label: t('hr.employees', 'Employees'),
          href: route('hr.employees.index'),
          pattern: 'hr.employees.*',
          icon: Users,
        },
        {
          label: t('hr.departments', 'Departments'),
          href: route('hr.departments.index'),
          pattern: 'hr.departments.*',
          icon: Building,
        },
        {
          label: t('hr.teams', 'Teams'),
          href: route('hr.teams.index'),
          pattern: 'hr.teams.*',
          icon: Users,
        },
      ],
    },
    {
      label: t('hr.time_pay', 'Time & Pay'),
      items: [
        {
          label: t('hr.attendance', 'Attendance'),
          href: route('hr.attendance.index'),
          pattern: 'hr.attendance.*',
          icon: Clock,
        },
        {
          label: t('hr.leave', 'Leave'),
          href: route('hr.leave.index'),
          pattern: 'hr.leave.*',
          icon: Calendar,
        },
        {
          label: t('hr.payroll', 'Payroll'),
          href: route('hr.payroll.index'),
          pattern: 'hr.payroll.*',
          icon: DollarSign,
        },
      ],
    },
    {
      label: t('hr.development', 'Development'),
      items: [
        {
          label: t('hr.performance', 'Performance'),
          href: route('hr.performance.index'),
          pattern: 'hr.performance.*',
          icon: TrendingUp,
        },
        {
          label: t('hr.training', 'Training'),
          href: route('hr.training.index'),
          pattern: 'hr.training.*',
          icon: GraduationCap,
        },
      ],
    },
    {
      label: t('hr.settings', 'Settings'),
      items: [
        {
          label: t('hr.setup', 'Setup'),
          href: route('hr.setup.index'),
          pattern: 'hr.setup.*',
          icon: Settings,
        },
        {
          label: t('hr.leave_types', 'Leave types'),
          href: route('hr.leave-types.index'),
          pattern: 'hr.leave-types.*',
          icon: Calendar,
        },
        {
          label: t('hr.reports', 'Reports'),
          href: route('hr.analytics.reports'),
          pattern: 'hr.analytics.*',
          icon: BarChart3,
        },
        {
          label: t('hr.career_portal', 'Careers'),
          href: route('careers.index'),
          pattern: 'careers.*',
          icon: ExternalLink,
        },
      ],
    },
  ];

  const isActive = (pattern: string) => Boolean(route().current(pattern));

  return { groups, isActive };
}
