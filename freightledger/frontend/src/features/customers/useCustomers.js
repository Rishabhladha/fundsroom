import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

// ─────────────────────────────────────────────────────────────────────────────
// Customer query hooks — TanStack Query wrapping the /api/customers endpoints
// ─────────────────────────────────────────────────────────────────────────────

// Build query string from filter params
function buildQs(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  return qs.toString() ? `?${qs.toString()}` : '';
}

// List customers with filters + pagination
export function useCustomers(filters = {}) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: () => api.get(`/customers${buildQs(filters)}`),
  });
}

// Single customer
export function useCustomer(id) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: () => api.get(`/customers/${id}`),
    enabled: !!id,
  });
}

// Create customer
export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/customers', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['customers'] }),
  });
}

// Update customer
export function useUpdateCustomer(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(`/customers/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}

// Follow-ups for a customer
export function useFollowUps(customerId) {
  return useQuery({
    queryKey: ['follow-ups', customerId],
    queryFn: () => api.get(`/customers/${customerId}/follow-ups`),
    enabled: !!customerId,
  });
}

// Add a follow-up note
export function useAddFollowUp(customerId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (note) => api.post(`/customers/${customerId}/follow-ups`, { note }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['follow-ups', customerId] }),
  });
}
