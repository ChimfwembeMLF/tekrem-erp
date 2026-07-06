import useTypedPage from '@/Hooks/useTypedPage';

export type OrganizationModule =
  | 'commerce'
  | 'inventory'
  | 'sales'
  | 'pos'
  | 'crm'
  | 'finance'
  | 'projects'
  | 'hr'
  | 'support'
  | 'ai';

/** UI keys used on dashboard cards / grouped nav areas */
export type OrganizationModuleKey =
  | OrganizationModule
  | 'procurement'
  | 'ecommerce'
  | 'momo';

const KEY_MODULES: Record<string, OrganizationModule[]> = {
  crm: ['crm'],
  finance: ['finance'],
  projects: ['projects'],
  hr: ['hr'],
  support: ['support'],
  inventory: ['inventory'],
  procurement: ['inventory'],
  sales: ['sales'],
  pos: ['pos'],
  ecommerce: ['commerce'],
  commerce: ['commerce'],
  ai: ['ai'],
  momo: ['finance'],
};

export default function useOrganizationModules() {
  const page = useTypedPage();
  const organization = (page.props as {
    organization?: {
      plan?: { enabled_modules?: string[]; name?: string } | null;
      enabled_modules?: string[];
    };
  }).organization;

  const roles = ((page.props as { auth?: { user?: { roles?: string[] } } }).auth?.user?.roles ?? []) as string[];
  const isSuperUser = roles.includes('super_user');

  const enabledModules = organization?.enabled_modules
    ?? organization?.plan?.enabled_modules
    ?? [];

  const hasModule = (module: OrganizationModule | string): boolean => {
    if (isSuperUser) {
      return true;
    }

    if (!organization?.plan && enabledModules.length === 0) {
      return true;
    }

    return enabledModules.includes(module);
  };

  const hasAnyModule = (modules: string[]): boolean => modules.some((module) => hasModule(module));

  const hasUiKey = (key: OrganizationModuleKey | string): boolean => {
    const modules = KEY_MODULES[key] ?? [key as OrganizationModule];

    return hasAnyModule(modules);
  };

  return {
    enabledModules,
    planName: organization?.plan?.name ?? null,
    hasModule,
    hasAnyModule,
    hasUiKey,
    isSuperUser,
  };
}
