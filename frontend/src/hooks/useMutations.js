import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';

function useInvalidate() {
  const queryClient = useQueryClient();
  return (keys) => {
    keys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
  };
}

export function useCreateObat() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload) => apiRequest('/obat', { method: 'POST', body: payload }),
    onSuccess: () => invalidate([['obat'], ['stok'], ['dashboard']]),
  });
}

export function useUpdateObat() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, ...payload }) =>
      apiRequest(`/obat/${id}`, { method: 'PUT', body: payload }),
    onSuccess: () => invalidate([['obat'], ['stok'], ['dashboard']]),
  });
}

export function useAddBatch() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ obatId, ...payload }) =>
      apiRequest(`/obat/${obatId}/batch`, { method: 'POST', body: payload }),
    onSuccess: () => invalidate([['obat'], ['stok'], ['dashboard']]),
  });
}

export function useCreateResep() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload) => apiRequest('/resep', { method: 'POST', body: payload }),
    onSuccess: () => invalidate([['resep']]),
  });
}

export function useTebusResep() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, uang_diterima }) =>
      apiRequest(`/resep/${id}/tebus`, {
        method: 'POST',
        body: { uang_diterima },
      }),
    onSuccess: () => invalidate([['resep'], ['stok'], ['transaksi'], ['dashboard']]),
  });
}

export function useCreatePenjualan() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload) => apiRequest('/transaksi/penjualan', { method: 'POST', body: payload }),
    onSuccess: () => invalidate([['stok'], ['transaksi'], ['dashboard']]),
  });
}

export function useCreateUser() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (payload) => apiRequest('/pengguna', { method: 'POST', body: payload }),
    onSuccess: () => invalidate([['pengguna']]),
  });
}

export function useUpdateUserRole() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, role }) =>
      apiRequest(`/pengguna/${id}`, { method: 'PUT', body: { role } }),
    onSuccess: () => invalidate([['pengguna']]),
  });
}

export function useDeactivateUser() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id }) => apiRequest(`/pengguna/${id}/nonaktif`, { method: 'PATCH' }),
    onSuccess: () => invalidate([['pengguna']]),
  });
}
