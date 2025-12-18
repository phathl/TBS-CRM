
import { supabase } from '../../lib/supabase/client';

export const authRepo = {
  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  async getProfile(userId: string) {
    // Truy vấn thông tin phân quyền từ bảng profiles
    const { data, error } = await supabase
      .from('profiles')
      .select('*, employees(*)')
      .eq('id', userId)
      .single();
    
    return { data, error };
  },

  async getSession() {
    return await supabase.auth.getSession();
  }
};
