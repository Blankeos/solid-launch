import { trpcClient } from '@/lib/trpc-client';
import {
  createContext,
  createSignal,
  FlowComponent,
  onMount,
  useContext,
  type Accessor,
} from 'solid-js';

import { useData } from 'vike-solid/useData';

// ===========================================================================
// Context
// ===========================================================================

export type AuthContextValue = {
  /**
   * The user that is currently logged in.
   * This will be null if the user is not logged in.
   *
   * SSR-hydrateable. In the `+data` load function, you can:
   * ```
   * export async function data(pageContext: PageContext) {
   *    const { request, response } = pageContext;
   *    const trpcClient = initTRPCSSRClient(
   *        request.header(),
   *        response.headers
   *    );
   *    const result = await trpcClient.currentUser.query();
   *
   *    return {
   *      user: result.user
   *    }
   * }
   * ```
   */
  user: Accessor<{ id: string; username: string } | null>;
  loading: Accessor<boolean>;
  login: (username: string, password: string) => Promise<ReturnType<AuthContextValue['user']>>;
  logout: () => Promise<{ success: boolean }>;
  register: (username: string, password: string) => Promise<ReturnType<AuthContextValue['user']>>;
};

const AuthContext = createContext({
  user: () => null,
  loading: () => false,
  login: async (username: string, password: string) => null,
  logout: async () => ({ success: false }),
  register: async (username: string, password: string) => null,
} as AuthContextValue);

// ===========================================================================
// Hook
// ===========================================================================
export const useAuthContext = () => useContext(AuthContext);

// ===========================================================================
// Provider
// ===========================================================================
export const AuthContextProvider: FlowComponent = (props) => {
  // Opt-in hydration
  const data = useData<{ user: { id: string; username: string } }>();

  const [user, setUser] = createSignal<ReturnType<AuthContextValue['user']>>(data?.user ?? null);
  const [loading, setLoading] = createSignal<boolean>(false);

  async function register(username: string, password: string) {
    const result = await trpcClient.register.mutate({
      username: username,
      password: password,
    });

    if (result.user) {
      setUser(result.user);
      return result.user;
    }

    return null;
  }

  async function login(username: string, password: string) {
    const result = await trpcClient.login.mutate({
      username: username,
      password: password,
    });

    if (result.user) {
      setUser(result.user);
      return result.user;
    }

    return null;
  }

  async function logout() {
    const result = await trpcClient.logout.query();
    if (result.success) {
      setUser(null);
      return { success: true };
    }

    return { success: false };
  }

  // Gets the current user at the start of the app.
  onMount(async () => {
    // If already hydrated, don't refetch the current user..
    if (user()) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const result = await trpcClient.currentUser.query();
    if (result.user) {
      setUser(result.user);
      setLoading(false);
      return result.user;
    }

    setUser(null);
    setLoading(false);
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};
