
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import { authService } from '../modules/auth/auth.service';
import { Role } from '../types';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Kiểm tra session hiện tại
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const userProfile = await authService.getCurrentProfile(session.user.id);
        setProfile(userProfile);
      }
      setLoading(false);
    };

    initAuth();

    // 2. Lắng nghe thay đổi trạng thái Auth (Realtime)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const userProfile = await authService.getCurrentProfile(session.user.id);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading, isAuthenticated: !!user };
}
