import { create } from 'zustand';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  telegram?: string;
  role: 'client' | 'admin' | 'super_admin';
  status: 'active' | 'blocked';
  email_verified: boolean;
  workspace: {
    name: string;
    slug: string;
  };
  subscription: {
    status: string;
    plan_slug?: string;
  };
  credits_remaining: number;
  meta_connection: {
    status: 'not_connected' | 'connected' | 'expired';
    ad_account_id?: string;
    page_id?: string;
    bm_id?: string;
  };
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!localStorage.getItem('lp_access_token'),
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setTokens: (access, refresh) => {
    localStorage.setItem('lp_access_token', access);
    localStorage.setItem('lp_refresh_token', refresh);
    set({ isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('lp_access_token');
    localStorage.removeItem('lp_refresh_token');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
