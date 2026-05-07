import { create } from 'zustand';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  // Initialize auth on app start — rehydrate from localStorage
  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isInitialized: true, isLoading: false });
      return;
    }
    try {
      set({ isLoading: true });
      const { data } = await authService.getProfile();
      set({
        user: data.data.user,
        token,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
      });
    } catch {
      localStorage.removeItem('token');
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      });
    }
  },

  login: async (credentials) => {
    try {
      set({ isLoading: true });
      const { data } = await authService.login(credentials);
      const { user, token } = data.data;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      toast.success(`Welcome back, ${user.name}!`);
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  },

  register: async (userData) => {
    try {
      set({ isLoading: true });
      const { data } = await authService.register(userData);
      const { user, token } = data.data;
      localStorage.setItem('token', token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      toast.success('Account created successfully!');
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
    toast.success('Logged out successfully');
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
