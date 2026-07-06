import GuestStatusLookup from '@/Components/Website/GuestStatusLookup';
import useRoute from '@/Hooks/useRoute';

export default function TicketStatusCheck() {
  const route = useRoute();

  return (
    <GuestStatusLookup
      title="Check Ticket Status"
      description="Track your support ticket using your ticket number."
      submitUrl={route('guest.support.ticket.status')}
      fieldKey="ticket_number"
      fieldLabel="Ticket Number"
      fieldPlaceholder="e.g. TKT-2024-001"
      flowType="ticket"
      steps={['Enter ticket number', 'View ticket status', 'Follow up if needed']}
    />
  );
}
