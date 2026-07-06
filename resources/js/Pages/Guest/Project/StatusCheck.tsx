import GuestStatusLookup from '@/Components/Website/GuestStatusLookup';
import useRoute from '@/Hooks/useRoute';

export default function StatusCheck() {
  const route = useRoute();

  return (
    <GuestStatusLookup
      title="Check Project Status"
      description="Look up your project consultation using your reference number."
      submitUrl={route('guest.project.status')}
      flowType="project"
      steps={['Enter reference number', 'View consultation status', 'Follow up with our team']}
    />
  );
}
