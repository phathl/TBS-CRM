
import { authRepo } from './auth.repository';
import { Role } from '../../types';

export const authService = {
  async login(email: string, password: string) {
    const { data, error } = await authRepo.signIn(email, password);
    if (error) throw error;

    if (data.user) {
      const profile = await this.getCurrentProfile(data.user.id);
      return { user: data.user, profile };
    }
    return { user: null, profile: null };
  },

  async logout() {
    return await authRepo.signOut();
  },

  async getCurrentProfile(userId: string) {
    const { data, error } = await authRepo.getProfile(userId);
    if (error) {
      console.warn("Profile not found, using default role");
      return { role: Role.VIEWER, fullName: 'User' };
    }
    return data;
  }
};
