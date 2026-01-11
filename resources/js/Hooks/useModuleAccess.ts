import { useActiveModules } from './useActiveModules';

export function useModuleAccess(moduleSlug: string) {
  const modules = useActiveModules();
  if (!modules.includes(moduleSlug)) {
    return {
      hasAccess: false,
      error: 'You do not have access to this module. Please check your subscription.'
    };
  }
  return { hasAccess: true };
}
