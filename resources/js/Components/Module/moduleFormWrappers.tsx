import React, { ComponentProps } from 'react';
import {
  ModuleFormShell,
  ModuleFormSection,
  ModuleFormGrid,
  ModuleFormField,
  ModuleFormActions,
  ModuleFormTabList,
  ModuleFormTab,
  ModuleFormHint,
  type ModuleFormAccent,
} from '@/Components/Module/ModuleFormLayout';

type ShellProps = Omit<ComponentProps<typeof ModuleFormShell>, 'workspaceLabel' | 'footerHint' | 'accent'> & {
  accent?: ModuleFormAccent;
};

function createModuleFormShell(workspaceLabel: string, defaultAccent: ModuleFormAccent, footerHint: string) {
  return function ModuleFormShellWrapper(props: ShellProps) {
    return (
      <ModuleFormShell
        workspaceLabel={workspaceLabel}
        footerHint={footerHint}
        accent={props.accent ?? defaultAccent}
        {...props}
      />
    );
  };
}

export const CrmFormShell = createModuleFormShell(
  'CRM workspace',
  'crm',
  'Changes are saved to your CRM records when you submit.',
);
export const FinanceFormShell = createModuleFormShell(
  'Finance workspace',
  'finance',
  'Changes are saved to your finance records when you submit.',
);
export const ProjectsFormShell = createModuleFormShell(
  'Projects workspace',
  'projects',
  'Changes are saved to your project when you submit.',
);
export const SupportFormShell = createModuleFormShell(
  'Support workspace',
  'support',
  'Changes are saved to your support records when you submit.',
);
export const AIFormShell = createModuleFormShell(
  'AI workspace',
  'ai',
  'Changes are saved to your AI configuration when you submit.',
);
export const InventoryFormShell = createModuleFormShell(
  'Inventory workspace',
  'commerce',
  'Changes are saved to your inventory records when you submit.',
);
export const SalesFormShell = createModuleFormShell(
  'Sales workspace',
  'commerce',
  'Changes are saved to your sales records when you submit.',
);
export const ProcurementFormShell = createModuleFormShell(
  'Procurement workspace',
  'default',
  'Changes are saved to your procurement records when you submit.',
);
export const AdminFormShell = createModuleFormShell(
  'Admin workspace',
  'org',
  'Changes are saved to system settings when you submit.',
);
export const StaffFormShell = createModuleFormShell(
  'My HR',
  'people',
  'Your request will be submitted for review when you save.',
);
export const EcommerceFormShell = createModuleFormShell(
  'Ecommerce workspace',
  'commerce',
  'Changes are saved to your storefront configuration when you submit.',
);

export {
  ModuleFormSection,
  ModuleFormGrid,
  ModuleFormField,
  ModuleFormActions,
  ModuleFormTabList,
  ModuleFormTab,
  ModuleFormHint,
};
