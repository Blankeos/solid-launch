import ProtectedRoute from '@/components/common/protected-route';
import { useAuthContext } from '@/stores/auth.context';
import getTitle from '@/utils/get-title';
import { VoidProps } from 'solid-js';
import { useMetadata } from 'vike-metadata-solid';

type SettingsPageProps = {};

export default function SettingsPage(props: VoidProps<SettingsPageProps>) {
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
