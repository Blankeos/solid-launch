import ProtectedRoute from '@/components/common/protected-route';
import { useClientSize } from '@/hooks/use-client-size';
import { useWindowSize } from '@/hooks/use-window-size';
import { useAuthContext } from '@/stores/auth.context';

export default function DashboardPage() {
  const { user } = useAuthContext();

  const { height, width } = useWindowSize();

  const { height: textAreaHeight, width: textAreaWidth, clientRef: textAreaRef } = useClientSize();

  return (
    <ProtectedRoute>
      <div class="flex flex-col gap-y-4 py-8">
        Dashboard: {user()?.username}
        <div>
          Window Size: {width()} x {height()}
        </div>
        <div>Client Size of this textarea:</div>
        <textarea
          ref={textAreaRef}
          class="resize rounded-md border p-2"
          value={`${textAreaWidth()} x ${textAreaHeight()}`}
        ></textarea>
      </div>
    </ProtectedRoute>
  );
}
