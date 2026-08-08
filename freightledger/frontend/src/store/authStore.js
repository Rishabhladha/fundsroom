import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Zustand store for auth state — persisted to localStorage
// Used by api.js to inject the Bearer token into every request

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,   // { id, name, email, role, is_active }
      token: null,  // JWT string

      login: (user, token) => set({ user, token }),

      logout: () => set({ user: null, token: null }),

      updateUser: (updates) =>
        set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    {
      name: 'auth-store', // localStorage key — must match what api.js reads
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
