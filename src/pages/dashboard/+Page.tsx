import ProtectedRoute from '@/components/common/protected-route';
import { useAuthContext } from '@/stores/auth.context';

export default function DashboardPage() {
  const { user } = useAuthContext();

  return <ProtectedRoute>Dashboard: {user()?.username}</ProtectedRoute>;
}
