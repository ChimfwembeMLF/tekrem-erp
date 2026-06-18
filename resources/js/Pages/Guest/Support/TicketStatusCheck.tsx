import GuestStatusLookup from '@/Components/Website/GuestStatusLookup';

export default function TicketStatusCheck() {
  return (
    <GuestStatusLookup
      title="Check Ticket Status"
      description="Track your support ticket using your ticket number."
      submitUrl="/guest/support/ticket/status"
      fieldKey="ticket_number"
      fieldLabel="Ticket Number"
      fieldPlaceholder="e.g. TKT-2024-001"
    />
  );
}
