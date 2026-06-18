import GuestStatusLookup from '@/Components/Website/GuestStatusLookup';

export default function StatusCheck() {
  return (
    <GuestStatusLookup
      title="Check Project Status"
      description="Look up your project consultation using your reference number."
      submitUrl="/guest/project/status"
    />
  );
}
