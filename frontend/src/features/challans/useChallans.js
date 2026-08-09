import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

function buildQs(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  return qs.toString() ? `?${qs.toString()}` : '';
}

export function useChallans(filters = {}) {
  return useQuery({
    queryKey: ['challans', filters],
    queryFn: () => api.get(`/challans${buildQs(filters)}`),
  });
}

export function useChallan(id) {
  return useQuery({
    queryKey: ['challans', id],
    queryFn: () => api.get(`/challans/${id}`),
    enabled: !!id,
  });
}

export function useCreateChallan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/challans', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challans'] }),
  });
}

export function useUpdateChallan(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(`/challans/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['challans'] }),
  });
}

export function useConfirmChallan(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/challans/${id}/confirm`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challans'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCancelChallan(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/challans/${id}/cancel`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challans'] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
