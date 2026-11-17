import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiRequest, buildQuery } from '../lib/api';

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiRequest('/dashboard'),
  });
}

export function useKasirObat(search) {
  return useQuery({
    queryKey: ['stok', 'kasir', search],
    queryFn: () => apiRequest(`/stok${buildQuery({ jenis: 'jadi', search })}`),
    placeholderData: keepPreviousData,
    staleTime: 10 * 1000,
  });
}

export function useStokData() {
  return useQuery({
    queryKey: ['stok', 'report'],
    queryFn: () => apiRequest('/stok'),
    staleTime: 10 * 1000,
  });
}

export function useObatList(page) {
  return useQuery({
    queryKey: ['obat', 'list', page],
    queryFn: () => apiRequest(`/obat${buildQuery({ page })}`),
  });
}

export function useSemuaObat(jenis) {
  return useQuery({
    queryKey: ['obat', 'options', jenis],
    queryFn: async () => {
      const data = await apiRequest(`/obat${buildQuery({ jenis, per_page: 100 })}`);
      return data.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useObatDetail(id) {
  return useQuery({
    queryKey: ['obat', 'detail', id],
    queryFn: async () => {
      const [obat, batch] = await Promise.all([
        apiRequest(`/obat/${id}`),
        apiRequest(`/obat/${id}/batch`),
      ]);
      return { obat, batch: batch.data };
    },
  });
}

export function useResepList(page) {
  return useQuery({
    queryKey: ['resep', 'list', page],
    queryFn: () => apiRequest(`/resep${buildQuery({ page })}`),
  });
}

export function useResepDetail(id) {
  return useQuery({
    queryKey: ['resep', 'detail', id],
    queryFn: () => apiRequest(`/resep/${id}`),
  });
}

export function useTransaksiList(page) {
  return useQuery({
    queryKey: ['transaksi', 'list', page],
    queryFn: () => apiRequest(`/transaksi${buildQuery({ page })}`),
  });
}

export function useTransaksiDetail(id) {
  return useQuery({
    queryKey: ['transaksi', 'detail', id],
    queryFn: () => apiRequest(`/transaksi/${id}`),
  });
}

export function usePenggunaList() {
  return useQuery({
    queryKey: ['pengguna'],
    queryFn: async () => {
      const data = await apiRequest('/pengguna');
      return data.data;
    },
  });
}
