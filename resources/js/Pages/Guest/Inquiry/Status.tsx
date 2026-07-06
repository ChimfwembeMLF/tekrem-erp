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
      layoutTitle="Inquiry Status"
      heroTitle="Inquiry status"
      heroDescription="Track the progress of your submission."
      flowType="inquiry"
      statusKind="inquiry"
      error={error}
      resultTitle={inquiry ? String(inquiry.subject ?? 'Inquiry') : undefined}
      reference={inquiry ? String(inquiry.reference_number) : undefined}
      status={inquiry ? String(inquiry.status) : undefined}
      fields={
        inquiry
          ? [
              { label: 'Type', value: String(inquiry.type).replace(/_/g, ' ') },
              { label: 'Urgency', value: String(inquiry.urgency) },
              ...(inquiry.assigned_to
                ? [{ label: 'Assigned to', value: String(inquiry.assigned_to) }]
                : []),
            ]
          : []
      }
      checkAnotherHref={route('guest.inquiry.status-form')}
      checkAnotherLabel="Check another inquiry"
    />
  );
}
