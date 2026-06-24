import React, { ComponentProps, PropsWithChildren } from 'react';
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

export type HrFormAccent = ModuleFormAccent;

export function HrFormShell(props: Omit<ComponentProps<typeof ModuleFormShell>, 'workspaceLabel' | 'footerHint'>) {
  return (
    <ModuleFormShell
      workspaceLabel="HR workspace"
      footerHint="Changes are saved to your HR records when you submit."
      {...props}
    />
  );
}

export const HrFormSection = ModuleFormSection;
export const HrFormGrid = ModuleFormGrid;
export const HrFormField = ModuleFormField;
export const HrFormActions = ModuleFormActions;
export const HrFormTabList = ModuleFormTabList;
export const HrFormTab = ModuleFormTab;
export const HrFormHint = ModuleFormHint;
