import { useMemo } from 'react';
import { useTypedPage } from '@/Hooks/useTypedPage';

interface Company {
  id: number;
  name: string;
  active_modules: string[];
  // ...other fields as needed
}

export function useActiveModules() {
  const page = useTypedPage();
  const company = page.props.company as Company;
  return useMemo(() => (company?.active_modules || []), [company]);
}

export function hasModule(moduleSlug: string) {
  const modules = useActiveModules();
  return modules.includes(moduleSlug);
}
