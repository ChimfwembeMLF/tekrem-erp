import React from 'react';
import GuestStatusView from '@/Components/Website/GuestStatusView';
import useRoute from '@/Hooks/useRoute';

interface Props {
  inquiry?: Record<string, unknown>;
  error?: string;
}

export default function Status({ inquiry, error }: Props) {
  const route = useRoute();

  return (
    <GuestStatusView
      layoutTitle="Project Status"
      heroTitle="Project consultation status"
      heroDescription="Track your project inquiry."
      flowType="project"
      statusKind="project"
      error={error}
      resultTitle={inquiry ? String(inquiry.project_title ?? 'Project inquiry') : undefined}
      reference={inquiry ? String(inquiry.reference_number) : undefined}
      status={inquiry ? String(inquiry.status) : undefined}
      fields={
        inquiry
          ? [
              { label: 'Type', value: String(inquiry.project_type).replace(/_/g, ' ') },
              { label: 'Priority', value: String(inquiry.priority) },
              ...(inquiry.assigned_to
                ? [{ label: 'Assigned to', value: String(inquiry.assigned_to) }]
                : []),
            ]
          : []
      }
      checkAnotherHref={route('guest.project.status-form')}
      checkAnotherLabel="Check another project"
    />
  );
}
