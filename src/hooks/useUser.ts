import { useAuth } from '@/contexts/AuthContext';

export function useUser() {
  const { user, session, loading } = useAuth();

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isPremium: user?.user_metadata?.subscription_status === 'premium',
  };
}

