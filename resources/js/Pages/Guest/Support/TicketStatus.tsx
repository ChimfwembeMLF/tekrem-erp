import React from 'react';
import GuestStatusView from '@/Components/Website/GuestStatusView';
import useRoute from '@/Hooks/useRoute';

interface Props {
  ticket?: Record<string, unknown>;
  error?: string;
}

export default function TicketStatus({ ticket, error }: Props) {
  const route = useRoute();

  return (
    <GuestStatusView
      layoutTitle="Ticket Status"
      heroTitle="Support ticket status"
      heroDescription="Current status of your support request."
      flowType="ticket"
      statusKind="ticket"
      error={error}
      resultTitle={ticket ? String(ticket.subject) : undefined}
      reference={ticket ? String(ticket.ticket_number) : undefined}
      status={ticket ? String(ticket.status) : undefined}
      fields={
        ticket
          ? [
              { label: 'Category', value: String(ticket.category).replace(/_/g, ' ') },
              { label: 'Priority', value: String(ticket.priority) },
              ...(ticket.assigned_to
                ? [{ label: 'Assigned to', value: String(ticket.assigned_to) }]
                : []),
            ]
          : []
      }
      checkAnotherHref={route('guest.support.ticket.status-form')}
      checkAnotherLabel="Check another ticket"
    />
  );
}
