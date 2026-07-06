import GuestStatusLookup from '@/Components/Website/GuestStatusLookup';
import useRoute from '@/Hooks/useRoute';

export default function StatusCheck() {
  const route = useRoute();

  return (
    <GuestStatusLookup
      title="Check Inquiry Status"
      description="Enter your reference number to see the latest update on your inquiry."
      submitUrl={route('guest.inquiry.status')}
      flowType="inquiry"
      steps={['Enter reference number', 'View inquiry status', 'Follow up if needed']}
    />
  );
}
