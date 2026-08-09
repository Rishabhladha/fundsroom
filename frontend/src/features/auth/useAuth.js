import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// useAuth — TanStack Query mutation for login
// ─────────────────────────────────────────────────────────────────────────────

export function useLogin() {
  const { login } = useAuthStore();

  return useMutation({
    mutationFn: ({ email, password }) =>
      api.post('/auth/login', { email, password }),
    onSuccess: (data) => {
      // Persist user + token to Zustand (→ localStorage via persist middleware)
      login(data.user, data.token);
    },
  });
}
