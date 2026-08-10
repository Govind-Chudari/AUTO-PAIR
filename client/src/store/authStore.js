import { create } from 'zustand';
import api from '../services/api';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  isLoading: false,
  error: null,

  // ─── LOGIN ────────────────────────────────
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  // ─── REGISTER ─────────────────────────────
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', userData);
      const { user, accessToken, refreshToken } = data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed.';
      set({ isLoading: false, error: message });
      return { success: false, message };
    }
  },

  // ─── LOGOUT ───────────────────────────────
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Silent fail — still clear local state
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({ user: null, isAuthenticated: false });
  },

  // ─── REFRESH USER DATA ────────────────────
  refreshUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      const user = data.data;
      localStorage.setItem('user', JSON.stringify(user));
      set({ user });
    } catch {
      // Token may be invalid
    }
  },

  // ─── CLEAR ERROR ──────────────────────────
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
