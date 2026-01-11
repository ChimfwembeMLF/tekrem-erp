import { usePage } from '@inertiajs/react';

export function useAvailableModules() {
  const { availableModules } = usePage().props as { availableModules: any[] };
  return availableModules || [];
}
