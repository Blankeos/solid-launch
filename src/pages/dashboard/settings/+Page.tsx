import ProtectedRoute from '@/components/common/protected-route';
import { useAuthContext } from '@/stores/auth.context';
import getTitle from '@/utils/get-title';
import { useMetadata } from 'vike-metadata-solid';

export default function SettingsPage() {
  useMetadata({
    title: getTitle('Settings'),
  });

  const { user } = useAuthContext();

  return (
    <ProtectedRoute>
      <div class="flex flex-col gap-y-4 py-8">Settings Page: {user()?.username}</div>
    </ProtectedRoute>
  );
}
