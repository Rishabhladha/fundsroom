import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

function buildQs(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') qs.set(k, v);
  });
  return qs.toString() ? `?${qs.toString()}` : '';
}

export function usePayments(filters = {}) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => api.get(`/payments${buildQs(filters)}`),
  });
}

export function useRecordPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.post('/payments', data),
    onSuccess: (data, variables) => {
      qc.invalidateQueries({ queryKey: ['payments'] });
      // Invalidate the specific challan and customer ledger
      qc.invalidateQueries({ queryKey: ['challans', variables.challanId] });
      qc.invalidateQueries({ queryKey: ['customers'] }); // for ledger and balances
    },
  });
}
