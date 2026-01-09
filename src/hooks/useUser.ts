import { useAuth } from '@/contexts/AuthContext';

export function useUser() {
  const { user, session, loading, isDemoUser } = useAuth();

  // Para demo user, siempre es premium (testing)
  // Para Supabase user, verifica subscription_status
  const isPremium = isDemoUser || (user?.user_metadata &&
    'subscription_status' in user.user_metadata &&
    user.user_metadata.subscription_status === 'premium'
  );

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isPremium,
  };
}

