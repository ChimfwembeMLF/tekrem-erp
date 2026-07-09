import React from 'react';
import { Link } from '@inertiajs/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/Components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/Components/ui/collapsible';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  MessageSquare,
  Menu,
  ChevronDown,
  ChevronRight,
  Settings,
  Cog,
  ImageIcon,
  BarChart3,
  DollarSign,
  CreditCard,
  Receipt,
  Wallet,
  TrendingUp,
  PieChart,
  Tag,
  FileText,
  HelpCircle,
  BookOpen,
  LifeBuoy,
  Ticket,
  Layout,
  Link2,
  Folder,
  Palette,
  Bot,
  Brain,
  Zap,
  FolderOpen,
  CheckSquare,
  Kanban,
  User,
  Building,
  Calendar,
  Clock,
  GraduationCap,
  Shield,
  Key,
  UserCog,
  Plus,
  Smartphone,
  Package,
  Truck,
  ShoppingCart,
  Store,
  ScanLine,
  Briefcase,
  UserMinus,
  ExternalLink,
  MessageCircle,
  Heart,
  ShoppingBag,
  Building2,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';
import useRoute from '@/Hooks/useRoute';
import useActiveRoute from '@/Hooks/useActiveRoute';
import usePermissions from '@/Hooks/usePermissions';
import useOrganizationModules from '@/Hooks/useOrganizationModules';
import useTranslate from '@/Hooks/useTranslate';
import useTypedPage from '@/Hooks/useTypedPage';
import ApplicationMark from '@/Components/ApplicationMark';
import { cn } from '@/lib/utils';


interface SidebarProps {
  settings: Record<string, any>;
}

type NavSection = { type: 'section'; label: string };
type NavLink = {
  type: 'link';
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  requirePermission?: string;
};
type NavEntry = NavSection | NavLink;

export default function Sidebar({ settings }: SidebarProps) {
  const route = useRoute();
  const { isActive } = useActiveRoute();
  const page = useTypedPage();
  const { t } = useTranslate();
  const { hasAnyRole, hasAnyPermission } = usePermissions();
  const { hasModule } = useOrganizationModules();

  // Permission + plan module access
  const hasCrmAccess = (): boolean => hasAnyPermission(['view crm']) && hasModule('crm');

  const hasFinanceAccess = (): boolean => hasAnyPermission(['view finance']) && hasModule('finance');

  const hasProjectsAccess = (): boolean => hasAnyPermission(['view projects']) && hasModule('projects');

  const hasHrAccess = (): boolean => hasAnyPermission(['view hr']) && hasModule('hr');

  const hasSupportAccess = (): boolean => hasAnyPermission(['view support']) && hasModule('support');

  const hasAiAccess = (): boolean => hasAnyPermission(['view ai']) && hasModule('ai');

  const hasInventoryAccess = (): boolean => hasAnyPermission(['view inventory']) && hasModule('inventory');
  const hasProcurementAccess = (): boolean => hasAnyPermission(['view procurement']) && hasModule('inventory');
  const hasSalesAccess = (): boolean => hasAnyPermission(['view sales orders']) && hasModule('sales');
  const hasPosAccess = (): boolean => hasAnyPermission(['access pos']) && hasModule('pos');
  const hasEcommerceAccess = (): boolean => hasAnyPermission(['view ecommerce']) && hasModule('commerce');

  const renderNavEntries = (entries: NavEntry[], keyPrefix: string) =>
    entries.map((entry, idx) => {
      if (entry.type === 'section') {
        return (
          <p
            key={`${keyPrefix}-section-${idx}`}
            className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground first:pt-1"
          >
            {entry.label}
          </p>
        );
      }

      if (entry.requirePermission && !hasAnyPermission([entry.requirePermission])) {
        return null;
      }

      return (
        <Link
          key={entry.href}
          href={entry.href}
          className={cn(
            'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
            entry.active
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-foreground/70 hover:text-foreground hover:bg-accent',
          )}
        >
          {entry.icon}
          {entry.label}
        </Link>
      );
    });

  // Define navigation items
  const navItems = [
    {
      href: route('dashboard'),
      label: t('navigation.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />, 
      active: route().current('dashboard')
    },
    // ...(hasHrAccess() ? [{
    //   href: route('hr.dashboard'),
    //   label: t('hr.people_ops', 'People'),
    //   icon: <Users className="h-5 w-5" />,
    //   active: route().current('hr.*'),
    // }] : []),
    // ...((page.props as { staffPortal?: unknown }).staffPortal ? [{
    //   href: route('staff.dashboard'),
    //   label: t('staff.my_hr', 'My HR'),
    //   icon: <User className="h-5 w-5" />,
    //   active: route().current('staff.*'),
    // }] : []),
  ];

  // CRM navigation — grouped by workflow
  const crmNav: NavEntry[] = hasCrmAccess() ? [
    { type: 'section', label: t('crm.overview', 'Overview') },
    {
      type: 'link',
      href: route('crm.dashboard'),
      label: t('crm.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('crm.dashboard'),
    },
    { type: 'section', label: t('crm.pipeline', 'Pipeline') },
    {
      type: 'link',
      href: route('crm.clients.index'),
      label: t('crm.clients', 'Clients'),
      icon: <Users className="h-5 w-5" />,
      active: route().current('crm.clients.*'),
    },
    {
      type: 'link',
      href: route('crm.leads.index'),
      label: t('crm.leads', 'Leads'),
      icon: <UserPlus className="h-5 w-5" />,
      active: route().current('crm.leads.*'),
    },
    { type: 'section', label: t('crm.engagement', 'Engagement') },
    {
      type: 'link',
      href: route('crm.communications.index'),
      label: t('crm.communications', 'Communications'),
      icon: <MessageSquare className="h-5 w-5" />,
      active: route().current('crm.communications.*'),
    },
    {
      type: 'link',
      href: route('crm.livechat.index'),
      label: t('crm.chat', 'Chat'),
      icon: <MessageCircle className="h-5 w-5" />,
      active: route().current('crm.livechat.*'),
    },
    { type: 'section', label: t('crm.insights', 'Insights') },
    {
      type: 'link',
      href: route('crm.analytics.dashboard'),
      label: t('crm.analytics', 'Analytics'),
      icon: <BarChart3 className="h-5 w-5" />,
      active: route().current('crm.analytics.*'),
    },
    ...(hasHrAccess() ? [
      { type: 'section' as const, label: t('hr.talent', 'Talent') },
      {
        type: 'link' as const,
        href: route('hr.recruitment.index'),
        label: t('hr.recruitment', 'Recruitment'),
        icon: <Briefcase className="h-5 w-5" />,
        active: route().current('hr.recruitment.*'),
      },
      {
        type: 'link' as const,
        href: route('hr.onboarding.index'),
        label: t('hr.onboarding', 'Onboarding'),
        icon: <UserPlus className="h-5 w-5" />,
        active: route().current('hr.onboarding.*'),
      },
    ] : []),
  ] : [];

  // Finance navigation — grouped by function
  const financeNav: NavEntry[] = hasFinanceAccess() ? [
    { type: 'section', label: t('finance.overview', 'Overview') },
    {
      type: 'link',
      href: route('finance.dashboard'),
      label: t('finance.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('finance.dashboard'),
    },
    { type: 'section', label: t('finance.core', 'Core') },
    {
      type: 'link',
      href: route('finance.accounts.index'),
      label: t('finance.accounts', 'Accounts'),
      icon: <Wallet className="h-5 w-5" />,
      active: route().current('finance.accounts.*'),
    },
    {
      type: 'link',
      href: route('finance.transactions.index'),
      label: t('finance.transactions', 'Transactions'),
      icon: <CreditCard className="h-5 w-5" />,
      active: route().current('finance.transactions.*'),
    },
    { type: 'section', label: t('finance.billing', 'Billing') },
    {
      type: 'link',
      href: route('finance.invoices.index'),
      label: t('finance.invoices', 'Invoices'),
      icon: <Receipt className="h-5 w-5" />,
      active: route().current('finance.invoices.*'),
    },
    {
      type: 'link',
      href: route('finance.payments.index'),
      label: t('finance.payments', 'Payments'),
      icon: <DollarSign className="h-5 w-5" />,
      active: route().current('finance.payments.*'),
    },
    {
      type: 'link',
      href: route('finance.quotations.index'),
      label: t('finance.quotations', 'Quotations'),
      icon: <FileText className="h-5 w-5" />,
      active: route().current('finance.quotations.*'),
    },
    { type: 'section', label: t('finance.planning', 'Planning') },
    {
      type: 'link',
      href: route('finance.expenses.index'),
      label: t('finance.expenses', 'Expenses'),
      icon: <TrendingUp className="h-5 w-5" />,
      active: route().current('finance.expenses.*'),
    },
    {
      type: 'link',
      href: route('finance.budgets.index'),
      label: t('finance.budgets', 'Budgets'),
      icon: <PieChart className="h-5 w-5" />,
      active: route().current('finance.budgets.*'),
    },
    {
      type: 'link',
      href: route('finance.categories.index'),
      label: t('finance.categories', 'Categories'),
      icon: <Tag className="h-5 w-5" />,
      active: route().current('finance.categories.*'),
    },
    { type: 'section', label: t('finance.compliance', 'Compliance & Banking') },
    {
      type: 'link',
      href: route('finance.momo.dashboard'),
      label: t('finance.momo', 'Mobile Money'),
      icon: <Smartphone className="h-5 w-5" />,
      active: route().current('finance.momo.*'),
    },
    {
      type: 'link',
      href: route('finance.zra.dashboard'),
      label: t('finance.zra', 'ZRA Smart Invoice'),
      icon: <Shield className="h-5 w-5" />,
      active: route().current('finance.zra.*'),
    },
    {
      type: 'link',
      href: route('finance.reconciliation.index'),
      label: t('finance.reconciliation', 'Bank Reconciliation'),
      icon: <Building className="h-5 w-5" />,
      active: route().current('finance.reconciliation.*'),
    },
    { type: 'section', label: t('finance.insights', 'Insights') },
    {
      type: 'link',
      href: route('finance.reports.index'),
      label: t('finance.reports', 'Reports'),
      icon: <BarChart3 className="h-5 w-5" />,
      active: route().current('finance.reports.*'),
    },
    ...(hasHrAccess() ? [
      { type: 'section' as const, label: t('hr.time_pay', 'People & Pay') },
      {
        type: 'link' as const,
        href: route('hr.payroll.index'),
        label: t('hr.payroll', 'Payroll'),
        icon: <DollarSign className="h-5 w-5" />,
        active: route().current('hr.payroll.*'),
      },
      {
        type: 'link' as const,
        href: route('hr.leave.index'),
        label: t('hr.leave', 'Leave'),
        icon: <Calendar className="h-5 w-5" />,
        active: route().current('hr.leave.*'),
      },
    ] : []),
  ] : [];

  const inventoryNav: NavEntry[] = hasInventoryAccess() ? [
    { type: 'section', label: t('inventory.overview', 'Overview') },
    { type: 'link', href: route('inventory.dashboard'), label: t('inventory.dashboard', 'Dashboard'), icon: <LayoutDashboard className="h-5 w-5" />, active: route().current('inventory.dashboard') },
    { type: 'section', label: t('inventory.catalog', 'Catalog') },
    { type: 'link', href: route('inventory.products.index'), label: t('inventory.products', 'Products'), icon: <Package className="h-5 w-5" />, active: route().current('inventory.products.*') },
    { type: 'link', href: route('inventory.warehouses.index'), label: t('inventory.warehouses', 'Warehouses'), icon: <Building className="h-5 w-5" />, active: route().current('inventory.warehouses.*') },
  ] : [];

  const procurementNav: NavEntry[] = hasProcurementAccess() ? [
    { type: 'section', label: t('procurement.overview', 'Overview') },
    { type: 'link', href: route('procurement.dashboard'), label: t('procurement.dashboard', 'Dashboard'), icon: <LayoutDashboard className="h-5 w-5" />, active: route().current('procurement.dashboard') },
    { type: 'section', label: t('procurement.supply', 'Supply') },
    { type: 'link', href: route('procurement.suppliers.index'), label: t('procurement.suppliers', 'Suppliers'), icon: <Truck className="h-5 w-5" />, active: route().current('procurement.suppliers.*') },
    { type: 'link', href: route('procurement.purchase-orders.index'), label: t('procurement.purchase_orders', 'Purchase Orders'), icon: <FileText className="h-5 w-5" />, active: route().current('procurement.purchase-orders.*') },
  ] : [];

  const salesNav: NavEntry[] = hasSalesAccess() ? [
    { type: 'section', label: t('sales.overview', 'Overview') },
    { type: 'link', href: route('sales.dashboard'), label: t('sales.dashboard', 'Dashboard'), icon: <LayoutDashboard className="h-5 w-5" />, active: route().current('sales.dashboard') },
    { type: 'section', label: t('sales.orders', 'Orders') },
    { type: 'link', href: route('sales.orders.index'), label: t('sales.all_orders', 'All Orders'), icon: <ShoppingCart className="h-5 w-5" />, active: route().current('sales.orders.*') },
  ] : [];

  const posNav: NavEntry[] = hasPosAccess() ? [
    { type: 'link', href: route('pos.index'), label: t('pos.dashboard', 'Registers'), icon: <ScanLine className="h-5 w-5" />, active: route().current('pos.index') || route().current('pos.terminal') },
    ...(hasAnyPermission(['manage pos registers']) ? [{ type: 'link' as const, href: route('pos.registers.index'), label: t('pos.terminals', 'Terminals'), icon: <ScanLine className="h-5 w-5" />, active: route().current('pos.registers.*') }] : []),
  ] : [];

  const ecommerceNav: NavEntry[] = hasEcommerceAccess() ? [
    { type: 'link', href: route('ecommerce.dashboard'), label: t('ecommerce.dashboard', 'Store Admin'), icon: <Store className="h-5 w-5" />, active: route().current('ecommerce.dashboard') },
    { type: 'link', href: route('ecommerce.orders.index'), label: t('ecommerce.orders', 'Orders'), icon: <Package className="h-5 w-5" />, active: route().current('ecommerce.orders.*') },
    { type: 'link', href: route('ecommerce.shipping.index'), label: t('ecommerce.shipping', 'Shipping'), icon: <Truck className="h-5 w-5" />, active: route().current('ecommerce.shipping.*') },
    { type: 'link', href: route('ecommerce.coupons.index'), label: t('ecommerce.coupons', 'Coupons'), icon: <Tag className="h-5 w-5" />, active: route().current('ecommerce.coupons.*') },
    { type: 'link', href: route('ecommerce.reviews.index'), label: t('ecommerce.reviews', 'Reviews'), icon: <MessageSquare className="h-5 w-5" />, active: route().current('ecommerce.reviews.*') },
    { type: 'link', href: route('ecommerce.settings.edit'), label: t('ecommerce.settings', 'Storefront'), icon: <ImageIcon className="h-5 w-5" />, active: route().current('ecommerce.settings.*') },
    { type: 'link', href: route('shop.index'), label: t('ecommerce.storefront', 'View Storefront'), icon: <Link2 className="h-5 w-5" />, active: false },
  ] : [];

  // Support navigation — grouped by function
  const supportNav: NavEntry[] = hasSupportAccess() ? [
    { type: 'section', label: t('support.overview', 'Overview') },
    {
      type: 'link',
      href: route('support.dashboard'),
      label: t('support.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('support.dashboard'),
    },
    { type: 'section', label: t('support.tickets_section', 'Tickets') },
    {
      type: 'link',
      href: route('support.tickets.index'),
      label: t('support.tickets', 'Tickets'),
      icon: <Ticket className="h-5 w-5" />,
      active: route().current('support.tickets.*'),
    },
    { type: 'section', label: t('support.knowledge', 'Knowledge') },
    {
      type: 'link',
      href: route('support.knowledge-base.index'),
      label: t('support.knowledge_base', 'Knowledge Base'),
      icon: <BookOpen className="h-5 w-5" />,
      active: route().current('support.knowledge-base.*'),
    },
    {
      type: 'link',
      href: route('support.faq.index'),
      label: t('support.faq', 'FAQ'),
      icon: <HelpCircle className="h-5 w-5" />,
      active: route().current('support.faq.*'),
    },
    {
      type: 'link',
      href: route('support.bot-knowledge.index'),
      label: t('support.bot_knowledge', 'Bot Knowledge'),
      icon: <Bot className="h-5 w-5" />,
      active: route().current('support.bot-knowledge.*'),
    },
    { type: 'section', label: t('support.configuration', 'Configuration') },
    {
      type: 'link',
      href: route('support.categories.index'),
      label: t('support.categories', 'Categories'),
      icon: <Tag className="h-5 w-5" />,
      active: route().current('support.categories.*'),
    },
    {
      type: 'link',
      href: route('support.ticket-sources.index'),
      label: t('support.sources', 'External Sources'),
      icon: <Link2 className="h-5 w-5" />,
      active: route().current('support.ticket-sources.*'),
    },
    { type: 'section', label: t('support.insights', 'Insights') },
    {
      type: 'link',
      href: route('support.analytics.dashboard'),
      label: t('support.analytics', 'Analytics'),
      icon: <BarChart3 className="h-5 w-5" />,
      active: route().current('support.analytics.*'),
    },
  ] : [];

  // Projects navigation — grouped by workflow (project work uses in-project tabs)
  const projectsNav: NavEntry[] = hasProjectsAccess() ? [
    { type: 'section', label: t('projects.overview', 'Overview') },
    {
      type: 'link',
      href: route('projects.dashboard'),
      label: t('projects.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('projects.dashboard'),
    },
    { type: 'section', label: t('projects.work', 'Work') },
    {
      type: 'link',
      href: route('projects.index'),
      label: t('projects.projects', 'All Projects'),
      icon: <FolderOpen className="h-5 w-5" />,
      active: route().current('projects.index') || route().current('projects.create'),
    },
    {
      type: 'link',
      href: route('projects.my-tasks'),
      label: t('projects.my_tasks', 'My Tasks'),
      icon: <CheckSquare className="h-5 w-5" />,
      active: route().current('projects.my-tasks'),
    },
    { type: 'section', label: t('projects.library', 'Library') },
    {
      type: 'link',
      href: route('projects.templates.index'),
      label: t('projects.templates', 'Templates'),
      icon: <Layout className="h-5 w-5" />,
      active: route().current('projects.templates.*'),
    },
    {
      type: 'link',
      href: route('projects.tags.index'),
      label: t('projects.tags', 'Tags'),
      icon: <Tag className="h-5 w-5" />,
      active: route().current('projects.tags.*'),
    },
    { type: 'section', label: t('projects.insights', 'Insights') },
    {
      type: 'link',
      href: route('projects.analytics'),
      label: t('projects.analytics', 'Analytics'),
      icon: <BarChart3 className="h-5 w-5" />,
      active: route().current('projects.analytics'),
    },
    { type: 'section', label: t('projects.configuration', 'Configuration') },
    {
      type: 'link',
      href: route('projects.setup.index'),
      label: t('projects.settings', 'Settings'),
      icon: <Settings className="h-5 w-5" />,
      active: route().current('projects.setup.*'),
      requirePermission: 'manage-project-settings',
    },
    ...(hasHrAccess() ? [
      { type: 'section' as const, label: t('hr.people', 'People') },
      {
        type: 'link' as const,
        href: route('hr.teams.index'),
        label: t('hr.teams', 'Teams'),
        icon: <Users className="h-5 w-5" />,
        active: route().current('hr.teams.*'),
      },
      {
        type: 'link' as const,
        href: route('hr.performance.index'),
        label: t('hr.performance', 'Performance'),
        icon: <TrendingUp className="h-5 w-5" />,
        active: route().current('hr.performance.*'),
      },
    ] : []),
  ] : [];

  // HR navigation — grouped by lifecycle
  const hrNav: NavEntry[] = hasHrAccess() ? [
    { type: 'section' as const, label: t('hr.overview', 'Overview') },
    {
      type: 'link' as const,
      href: route('hr.dashboard'),
      label: t('hr.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('hr.dashboard'),
    },
    { type: 'section' as const, label: t('hr.talent', 'Talent') },
    {
      type: 'link' as const,
      href: route('hr.recruitment.index'),
      label: t('hr.recruitment', 'Recruitment'),
      icon: <Briefcase className="h-5 w-5" />,
      active: route().current('hr.recruitment.*'),
    },
    {
      type: 'link' as const,
      href: route('hr.onboarding.index'),
      label: t('hr.onboarding', 'Onboarding'),
      icon: <UserPlus className="h-5 w-5" />,
      active: route().current('hr.onboarding.*'),
    },
    {
      type: 'link' as const,
      href: route('hr.offboarding.index'),
      label: t('hr.offboarding', 'Offboarding'),
      icon: <UserMinus className="h-5 w-5" />,
      active: route().current('hr.offboarding.*'),
    },
    {
      type: 'link' as const,
      href: route('careers.index'),
      label: t('hr.career_portal', 'Career portal'),
      icon: <ExternalLink className="h-5 w-5" />,
      active: false,
    },
    { type: 'section' as const, label: t('hr.people', 'People') },
    {
      type: 'link' as const,
      href: route('hr.employees.index'),
      label: t('hr.employees', 'Employees'),
      icon: <Users className="h-5 w-5" />,
      active: route().current('hr.employees.*'),
    },
    {
      type: 'link' as const,
      href: route('hr.departments.index'),
      label: t('hr.departments', 'Departments'),
      icon: <Building className="h-5 w-5" />,
      active: route().current('hr.departments.*'),
    },
    {
      type: 'link' as const,
      href: route('hr.teams.index'),
      label: t('hr.teams', 'Teams'),
      icon: <Users className="h-5 w-5" />,
      active: route().current('hr.teams.*'),
    },
    { type: 'section' as const, label: t('hr.time_pay', 'Time & Pay') },
    {
      type: 'link' as const,
      href: route('hr.attendance.index'),
      label: t('hr.attendance', 'Attendance'),
      icon: <Clock className="h-5 w-5" />,
      active: route().current('hr.attendance.*'),
    },
    {
      type: 'link' as const,
      href: route('hr.leave.index'),
      label: t('hr.leave', 'Leave'),
      icon: <Calendar className="h-5 w-5" />,
      active: route().current('hr.leave.*'),
    },
    {
      type: 'link' as const,
      href: route('hr.payroll.index'),
      label: t('hr.payroll', 'Payroll'),
      icon: <DollarSign className="h-5 w-5" />,
      active: route().current('hr.payroll.*'),
    },
    { type: 'section' as const, label: t('hr.development', 'Development') },
    {
      type: 'link' as const,
      href: route('hr.performance.index'),
      label: t('hr.performance', 'Performance'),
      icon: <TrendingUp className="h-5 w-5" />,
      active: route().current('hr.performance.*'),
    },
    {
      type: 'link' as const,
      href: route('hr.training.index'),
      label: t('hr.training', 'Training'),
      icon: <GraduationCap className="h-5 w-5" />,
      active: route().current('hr.training.*'),
    },
    { type: 'section' as const, label: t('hr.settings', 'Settings') },
    {
      type: 'link' as const,
      href: route('hr.setup.index'),
      label: t('hr.setup', 'HR Setup'),
      icon: <Settings className="h-5 w-5" />,
      active: route().current('hr.setup.*'),
    },
    {
      type: 'link' as const,
      href: route('hr.leave-types.index'),
      label: t('hr.leave_types', 'Leave types'),
      icon: <Calendar className="h-5 w-5" />,
      active: route().current('hr.leave-types.*'),
    },
    {
      type: 'link' as const,
      href: route('hr.analytics.reports'),
      label: t('hr.reports', 'Reports'),
      icon: <BarChart3 className="h-5 w-5" />,
      active: route().current('hr.analytics.*'),
    },
  ] : [];

  // AI navigation — grouped by platform area
  const aiNav: NavEntry[] = hasAiAccess() ? [
    { type: 'section', label: t('ai.overview', 'Overview') },
    {
      type: 'link',
      href: route('ai.dashboard'),
      label: t('ai.dashboard', 'Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('ai.dashboard'),
    },
    { type: 'section', label: t('ai.platform', 'Platform') },
    {
      type: 'link',
      href: route('ai.services.index'),
      label: t('ai.services', 'Services'),
      icon: <Settings className="h-5 w-5" />,
      active: route().current('ai.services.*'),
    },
    {
      type: 'link',
      href: route('ai.models.index'),
      label: t('ai.models', 'Models'),
      icon: <Brain className="h-5 w-5" />,
      active: route().current('ai.models.*'),
    },
    { type: 'section', label: t('ai.content', 'Content') },
    {
      type: 'link',
      href: route('ai.conversations.index'),
      label: t('ai.conversations', 'Conversations'),
      icon: <MessageSquare className="h-5 w-5" />,
      active: route().current('ai.conversations.*'),
    },
    {
      type: 'link',
      href: route('ai.prompt-templates.index'),
      label: t('ai.prompt_templates', 'Templates'),
      icon: <FileText className="h-5 w-5" />,
      active: route().current('ai.prompt-templates.*'),
    },
    { type: 'section', label: t('ai.insights', 'Insights') },
    {
      type: 'link',
      href: route('ai.analytics.dashboard'),
      label: t('ai.analytics', 'Analytics'),
      icon: <BarChart3 className="h-5 w-5" />,
      active: route().current('ai.analytics.*'),
    },
  ] : [];

  // Platform navigation — super_user only
  const platformNav: NavEntry[] = hasAnyRole(['super_user']) ? [
    { type: 'section', label: t('platform.title', 'Platform') },
    {
      type: 'link',
      href: route('admin.platform.organizations.index'),
      label: t('platform.organizations', 'Organizations'),
      icon: <Building2 className="h-5 w-5" />,
      active: route().current('admin.platform.organizations.*'),
    },
    {
      type: 'link',
      href: route('admin.platform.plans.index'),
      label: t('platform.plans', 'Billing plans'),
      icon: <CreditCard className="h-5 w-5" />,
      active: route().current('admin.platform.plans.*'),
    },
  ] : [];

  // Admin navigation — grouped by access area
  const adminNav: NavEntry[] = hasAnyRole(['admin', 'super_user']) ? [
    { type: 'section', label: t('admin.access', 'Access Control') },
    {
      type: 'link',
      href: route('admin.users.index'),
      label: t('admin.users', 'User Management'),
      icon: <UserCog className="h-5 w-5" />,
      active: route().current('admin.users.*'),
    },
    {
      type: 'link',
      href: route('admin.roles.index'),
      label: t('admin.roles', 'Role Management'),
      icon: <Shield className="h-5 w-5" />,
      active: route().current('admin.roles.*'),
    },
    {
      type: 'link',
      href: route('admin.permissions.index'),
      label: t('admin.permissions', 'Permission Management'),
      icon: <Key className="h-5 w-5" />,
      active: route().current('admin.permissions.*'),
    },
    { type: 'section', label: t('admin.system', 'System') },
    {
      type: 'link',
      href: route('admin.modules.index'),
      label: t('admin.modules', 'Module Management'),
      icon: <Package className="h-5 w-5" />,
      active: route().current('admin.modules.*'),
    },
    ...(hasHrAccess() ? [
      { type: 'section' as const, label: t('hr.people', 'People') },
      {
        type: 'link' as const,
        href: route('hr.employees.index'),
        label: t('hr.employees', 'Employees'),
        icon: <Users className="h-5 w-5" />,
        active: route().current('hr.employees.*'),
      },
      {
        type: 'link' as const,
        href: route('hr.departments.index'),
        label: t('hr.departments', 'Departments'),
        icon: <Building className="h-5 w-5" />,
        active: route().current('hr.departments.*'),
      },
    ] : []),
  ] : [];

  // Customer navigation — grouped by portal area
  const customerNav: NavEntry[] = hasAnyRole(['customer']) ? [
    { type: 'section', label: t('customer.overview', 'Overview') },
    {
      type: 'link',
      href: route('customer.dashboard'),
      label: t('customer.dashboard', 'My Dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      active: route().current('customer.dashboard'),
    },
    ...(hasModule('support') ? [
      { type: 'section' as const, label: t('customer.support_section', 'Support') },
      {
        type: 'link' as const,
        href: route('customer.support.index'),
        label: t('customer.support', 'My Tickets'),
        icon: <Ticket className="h-5 w-5" />,
        active: route().current('customer.support.index') || route().current('customer.support.show'),
      },
      {
        type: 'link' as const,
        href: route('customer.support.create'),
        label: t('customer.support.create', 'Create Ticket'),
        icon: <Plus className="h-5 w-5" />,
        active: route().current('customer.support.create'),
      },
      {
        type: 'link' as const,
        href: route('customer.support.knowledge-base.index'),
        label: t('customer.knowledge_base', 'Knowledge Base'),
        icon: <BookOpen className="h-5 w-5" />,
        active: route().current('customer.support.knowledge-base.*'),
      },
      {
        type: 'link' as const,
        href: route('customer.support.faq'),
        label: t('customer.faq', 'FAQ'),
        icon: <HelpCircle className="h-5 w-5" />,
        active: route().current('customer.support.faq'),
      },
    ] : []),
    { type: 'section', label: t('customer.shop_section', 'Shop') },
    ...(hasModule('commerce') ? [
      {
        type: 'link' as const,
        href: route('shop.orders'),
        label: t('customer.shop_orders', 'Shop orders'),
        icon: <ShoppingBag className="h-5 w-5" />,
        active: route().current('shop.orders'),
      },
      {
        type: 'link' as const,
        href: route('shop.wishlist'),
        label: t('customer.wishlist', 'Wishlist'),
        icon: <Heart className="h-5 w-5" />,
        active: route().current('shop.wishlist'),
      },
      {
        type: 'link' as const,
        href: route('shop.tracking'),
        label: t('customer.track_shipment', 'Track shipment'),
        icon: <Truck className="h-5 w-5" />,
        active: route().current('shop.tracking*'),
      },
      {
        type: 'link' as const,
        href: route('shop.index'),
        label: t('customer.browse_shop', 'Browse shop'),
        icon: <Package className="h-5 w-5" />,
        active: route().current('shop.index') || route().current('shop.show'),
      },
    ] : []),
  ] : [];

  // Settings navigation — grouped by area
  const settingsNav: NavEntry[] = hasAnyRole(['admin']) ? [
    { type: 'section', label: t('settings.general_section', 'General') },
    {
      type: 'link',
      href: route('settings.index'),
      label: t('settings.general', 'General Settings'),
      icon: <Cog className="h-5 w-5" />,
      active: route().current('settings.index'),
    },
    ...(hasModule('finance') ? [{
      type: 'link' as const,
      href: route('settings.finance.index'),
      label: t('settings.finance', 'Finance Settings'),
      icon: <DollarSign className="h-5 w-5" />,
      active: route().current('settings.finance.*'),
    }] : []),
    { type: 'section', label: t('settings.system', 'System') },
    {
      type: 'link',
      href: route('settings.notifications'),
      label: t('settings.notifications', 'Notifications'),
      icon: <MessageSquare className="h-5 w-5" />,
      active: route().current('settings.notifications'),
    },
    {
      type: 'link',
      href: route('settings.advanced'),
      label: t('settings.advanced', 'Advanced Settings'),
      icon: <Shield className="h-5 w-5" />,
      active: route().current('settings.advanced'),
    },
    ...(hasHrAccess() ? [
      { type: 'section' as const, label: t('hr.settings', 'People') },
      {
        type: 'link' as const,
        href: route('hr.setup.index'),
        label: t('hr.setup', 'HR Setup'),
        icon: <Settings className="h-5 w-5" />,
        active: route().current('hr.setup.*'),
      },
      {
        type: 'link' as const,
        href: route('hr.analytics.reports'),
        label: t('hr.reports', 'HR Reports'),
        icon: <BarChart3 className="h-5 w-5" />,
        active: route().current('hr.analytics.*'),
      },
    ] : []),
  ] : [];


  // Sidebar content component to avoid duplication
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3">
        <ApplicationMark />
        {/* <span className="font-bold text-xl">{settings.site_name || 'Tekrem ERP'}</span> */}
      </div>

      <div className="mt-6 flex flex-col gap-1 px-2 overflow-y-auto flex-1">
        {/* Main Navigation */}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
              item.active
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}

        {/* CRM Navigation - Only visible to admin and staff */}
        {hasCrmAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('crm.*') || route().current('hr.recruitment.*') || route().current('hr.onboarding.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                <span>{t('crm.title', 'CRM')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {renderNavEntries(crmNav, 'crm')}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Finance Navigation - Only visible to users with finance permission */}
        {hasFinanceAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('finance.*') || route().current('hr.payroll.*') || route().current('hr.leave.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5" />
                <span>{t('finance.title', 'Finance')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {renderNavEntries(financeNav, 'finance')}
            </CollapsibleContent>
          </Collapsible>
        )}

        {hasInventoryAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn("w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors", route().current('inventory.*') ? "bg-primary/10 text-primary font-semibold" : "text-foreground/70 hover:text-foreground hover:bg-accent")}>
              <div className="flex items-center gap-3"><Package className="h-5 w-5" /><span>{t('inventory.title', 'Inventory')}</span></div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">{renderNavEntries(inventoryNav, 'inventory')}</CollapsibleContent>
          </Collapsible>
        )}

        {hasProcurementAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn("w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors", route().current('procurement.*') ? "bg-primary/10 text-primary font-semibold" : "text-foreground/70 hover:text-foreground hover:bg-accent")}>
              <div className="flex items-center gap-3"><Truck className="h-5 w-5" /><span>{t('procurement.title', 'Procurement')}</span></div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">{renderNavEntries(procurementNav, 'procurement')}</CollapsibleContent>
          </Collapsible>
        )}

        {hasSalesAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn("w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors", route().current('sales.*') ? "bg-primary/10 text-primary font-semibold" : "text-foreground/70 hover:text-foreground hover:bg-accent")}>
              <div className="flex items-center gap-3"><ShoppingCart className="h-5 w-5" /><span>{t('sales.title', 'Sales')}</span></div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">{renderNavEntries(salesNav, 'sales')}</CollapsibleContent>
          </Collapsible>
        )}

        {hasPosAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn("w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors", route().current('pos.*') ? "bg-primary/10 text-primary font-semibold" : "text-foreground/70 hover:text-foreground hover:bg-accent")}>
              <div className="flex items-center gap-3"><ScanLine className="h-5 w-5" /><span>{t('pos.title', 'POS')}</span></div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">{renderNavEntries(posNav, 'pos')}</CollapsibleContent>
          </Collapsible>
        )}

        {hasEcommerceAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn("w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors", route().current('ecommerce.*') ? "bg-primary/10 text-primary font-semibold" : "text-foreground/70 hover:text-foreground hover:bg-accent")}>
              <div className="flex items-center gap-3"><Store className="h-5 w-5" /><span>{t('ecommerce.title', 'Ecommerce')}</span></div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">{renderNavEntries(ecommerceNav, 'ecommerce')}</CollapsibleContent>
          </Collapsible>
        )}

        {/* Projects Navigation - Only visible to users with projects permission */}
        {hasProjectsAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('projects.*') || route().current('agile.*') || route().current('hr.teams.*') || route().current('hr.performance.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5" />
                <span>{t('projects.title', 'Projects')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {renderNavEntries(projectsNav, 'projects')}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* HR Navigation - Only visible to users with hr permission */}
        {hasHrAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('hr.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5" />
                <span>{t('hr.title', 'HR')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {renderNavEntries(hrNav, 'hr')}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Support Navigation - Only visible to users with support permission */}
        {hasSupportAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('support.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <LifeBuoy className="h-5 w-5" />
                <span>{t('support.title', 'Support')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {renderNavEntries(supportNav, 'support')}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* AI Navigation - Only visible to users with ai permission */}
        {hasAiAccess() && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('ai.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5" />
                <span>{t('ai.title', 'AI')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {renderNavEntries(aiNav, 'ai')}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Platform Navigation - super_user only */}
        {hasAnyRole(['super_user']) && (
          <Collapsible className="mt-4 pt-4 border-t border-border">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('admin.platform.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5" />
                <span>{t('platform.title', 'Platform')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {renderNavEntries(platformNav, 'platform')}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Admin Navigation - Only visible to admin users */}
        {hasAnyRole(['admin', 'super_user']) && (
          <Collapsible className="mt-4 pt-4 border-t border-border">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('admin.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <UserCog className="h-5 w-5" />
                <span>{t('admin.title', 'Administration')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {renderNavEntries(adminNav, 'admin')}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Settings Navigation - Only visible to admin users */}
        {hasAnyRole(['admin']) && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('settings.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5" />
                <span>{t('settings.title', 'Settings')}</span>
              </div>
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {renderNavEntries(settingsNav, 'settings')}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Customer Navigation - Only visible to customers */}
        {hasAnyRole(['customer']) && (
          <Collapsible className="mt-2">
            <CollapsibleTrigger className={cn(
              "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors",
              route().current('customer.*')
                ? "bg-primary/10 text-primary font-semibold"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}>
              <div className="flex items-center gap-3">
                <User className="h-5 w-5" />
                <span>{t('customer.title', 'Customer Portal')}</span>
              </div>
              <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-4 mt-1 space-y-1">
              {renderNavEntries(customerNav, 'customer')}
            </CollapsibleContent>
          </Collapsible>
        )}

      </div>
      {(page.props as { organization?: { plan?: { name?: string } } }).organization?.plan?.name && (
        <div className="mx-2 mb-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {(page.props as { organization?: { plan?: { name?: string } } }).organization?.plan?.name}
          </span>
          {' '}plan
        </div>
      )}
      <div className="h-4"></div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-10">
        <div className="flex flex-col flex-grow border-r border-border bg-background h-screen overflow-y-auto">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar (Drawer) — fixed in header row */}
      <div className="fixed left-0 top-0 z-50 flex h-16 items-center px-3 sm:px-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 sm:w-[350px]">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
