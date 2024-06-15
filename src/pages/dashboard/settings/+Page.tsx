import ProtectedRoute from '@/components/common/protected-route';
import { useAuthContext } from '@/stores/auth.context';
import { VoidProps } from 'solid-js';

type SettingsPageProps = {};

export default function SettingsPage(props: VoidProps<SettingsPageProps>) {
  const { user } = useAuthContext();

  return (
    <ProtectedRoute>
      <div class="flex flex-col gap-y-4 py-8">Settings Page: {user()?.username}</div>
    </ProtectedRoute>
  );
}
