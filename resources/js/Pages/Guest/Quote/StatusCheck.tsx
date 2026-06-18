import GuestStatusLookup from '@/Components/Website/GuestStatusLookup';

export default function StatusCheck() {
  return (
    <GuestStatusLookup
      title="Check Quote Status"
      description="Look up your quote request using your reference number."
      submitUrl="/guest/quote/status"
    />
  );
}
