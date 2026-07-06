import GuestStatusLookup from '@/Components/Website/GuestStatusLookup';
import useRoute from '@/Hooks/useRoute';

export default function StatusCheck() {
  const route = useRoute();

  return (
    <GuestStatusLookup
      title="Check Quote Status"
      description="Look up your quote request using your reference number."
      submitUrl={route('guest.quote.status')}
      flowType="quote"
      steps={['Enter reference number', 'View quote status', 'Accept or follow up']}
    />
  );
}
