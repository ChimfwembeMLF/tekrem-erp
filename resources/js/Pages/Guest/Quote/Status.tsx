import React from 'react';
import GuestStatusView from '@/Components/Website/GuestStatusView';
import useRoute from '@/Hooks/useRoute';

interface Props {
  quoteRequest?: Record<string, unknown>;
  error?: string;
}

export default function Status({ quoteRequest, error }: Props) {
  const route = useRoute();

  const fields = quoteRequest
    ? [
        { label: 'Service', value: String(quoteRequest.service_type).replace(/-/g, ' ') },
        { label: 'Priority', value: String(quoteRequest.priority) },
        ...(quoteRequest.quoted_amount != null
          ? [
              {
                label: 'Quoted amount',
                value: `${quoteRequest.quoted_currency ?? 'ZMW'} ${quoteRequest.quoted_amount}`,
              },
            ]
          : []),
        ...(quoteRequest.assigned_to
          ? [{ label: 'Assigned to', value: String(quoteRequest.assigned_to) }]
          : []),
      ]
    : [];

  return (
    <GuestStatusView
      layoutTitle="Quote Status"
      heroTitle="Quote status"
      heroDescription="See where your quote request stands."
      flowType="quote"
      statusKind="quote"
      error={error}
      resultTitle={quoteRequest ? `Quote ${quoteRequest.reference_number}` : undefined}
      reference={quoteRequest ? String(quoteRequest.reference_number) : undefined}
      status={quoteRequest ? String(quoteRequest.status) : undefined}
      fields={fields}
      checkAnotherHref={route('guest.quote.status-form')}
      checkAnotherLabel="Check another quote"
    />
  );
}
