import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

function buildQs(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  return qs.toString() ? `?${qs.toString()}` : '';
}

export function useProducts(filters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => api.get(`/products${buildQs(filters)}`),
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => api.get(`/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/products', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct(id) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.patch(`/products/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useStockMovements(productId, filters = {}) {
  return useQuery({
    queryKey: ['movements', productId, filters],
    queryFn: () => api.get(`/products/${productId}/movements${buildQs(filters)}`),
    enabled: !!productId,
  });
}

export function useAddMovement(productId) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post(`/products/${productId}/movements`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movements', productId] });
      qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
