import { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, Search, ShoppingCart, TriangleAlert, X } from 'lucide-react';
import { PageHeader, Panel } from '../components/ui/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Inputs';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { useKasirObat } from '../hooks/useData';
import { useCreatePenjualan } from '../hooks/useMutations';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatDate } from '../lib/dates';
import { formatNumber, formatRupiah, parseInteger } from '../lib/format';
import { allocateFEFO } from '../lib/stock';

export default function KasirPage() {
  usePageMeta('Kasir Penjualan');
  const { notify } = useToast();
  const createSale = useCreatePenjualan();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [uang, setUang] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isFetching, isError, error, refetch } = useKasirObat(search);
  const obatList = data?.data ?? [];

  const cartRows = useMemo(() => {
    return cart.map((line) => {
      const qty = Number(line.jumlah) || 0;
      const batches = line.obat.batch_tersedia || [];
      const allocation = allocateFEFO(line.obat.id, qty, batches);
      const subtotal = qty > 0 ? Number(line.obat.harga_jual) * qty : 0;
      return { ...line, qty, allocation, subtotal };
    });
  }, [cart]);

  const total = cartRows.reduce((sum, row) => sum + row.subtotal, 0);
  const uangValue = parseInteger(uang);
  const kembalian = uangValue !== null && uangValue >= total ? uangValue - total : 0;

  const addToCart = (obat) => {
    const siapJual = Number(obat.stok_siap_jual) || 0;
    if (siapJual <= 0) return;

    const existing = cart.find((line) => line.obat.id === obat.id);

    if (existing && (Number(existing.jumlah) || 0) + 1 > siapJual) {
      notify('Jumlah sudah mencapai stok siap jual obat ini.', 'info');
      return;
    }

    setFormError('');
    setErrors({});

    if (existing) {
      setCart((current) =>
        current.map((line) =>
          line.obat.id === obat.id ? { ...line, obat, jumlah: (Number(line.jumlah) || 0) + 1 } : line,
        ),
      );
      return;
    }

    setCart((current) => [...current, { obat, jumlah: 1 }]);
  };

  const updateQty = (obatId, value) => {
    setCart((current) =>
      current.map((line) => (line.obat.id === obatId ? { ...line, jumlah: value } : line)),
    );
    setErrors({});
    setFormError('');
  };

  const stepQty = (row, delta) => {
    const max = Number(row.obat.stok_siap_jual) || 0;
    const next = Math.min(max, Math.max(1, row.qty + delta));
    updateQty(row.obat.id, next);
  };

  const removeLine = (obatId) => {
    setCart((current) => current.filter((line) => line.obat.id !== obatId));
    setErrors({});
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};

    if (!cart.length) {
      setFormError('Keranjang masih kosong.');
      return;
    }

    for (const row of cartRows) {
      if (row.qty < 1) {
        nextErrors[`qty-${row.obat.id}`] = 'Jumlah minimal 1.';
      } else if (row.qty > Number(row.obat.stok_siap_jual)) {
        nextErrors[`qty-${row.obat.id}`] =
          `Maksimal ${formatNumber(row.obat.stok_siap_jual)} ${row.obat.satuan}.`;
      }
    }

    if (uang === '') {
      nextErrors.uang = 'Uang diterima wajib diisi.';
    } else if (uangValue === null) {
      nextErrors.uang = 'Uang diterima harus bilangan bulat.';
    } else if (uangValue < total) {
      nextErrors.uang = 'Uang diterima minimal sama dengan total.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setFormError('');

    try {
      const result = await createSale.mutateAsync({
        items: cartRows.map((row) => ({ obat_id: row.obat.id, jumlah: row.qty })),
        uang_diterima: uangValue,
      });
      notify(
        `Transaksi ${result.kode_transaksi} tersimpan. Kembalian ${formatRupiah(result.kembalian)}.`,
      );
      setCart([]);
      setUang('');
      setErrors({});
      setFormError('');
    } catch (requestError) {
      const message = requestError.message || 'Penjualan tidak dapat disimpan.';
      setFormError(message);
      notify(message, 'error');
    }
  };

  return (
    <>
      <PageHeader
        title="Kasir Penjualan"
        description="Cari obat jadi, atur jumlah, lalu selesaikan penjualan."
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <Panel className="overflow-hidden">
          <div className="border-b border-line p-4 sm:p-5">
            <label htmlFor="cari-obat" className="text-small font-semibold text-ink">
              Cari obat
            </label>
            <div className="relative mt-2">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <Input
                id="cari-obat"
                type="search"
                placeholder="Ketik nama atau kode obat"
                className="pl-10"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-micro text-muted">
              <p>Hanya obat jadi dengan stok siap jual yang dapat ditambahkan.</p>
              <p className="nums">
                {isFetching && !isLoading ? 'Memperbarui...' : `${obatList.length} obat`}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="p-4">
              <LoadingState rows={6} label="Memuat daftar obat kasir" />
            </div>
          ) : isError ? (
            <div className="p-4">
              <ErrorState message={error?.message} onRetry={refetch} />
            </div>
          ) : obatList.length === 0 ? (
            <EmptyState
              title={search ? 'Obat tidak ditemukan' : 'Belum ada obat jadi'}
              description={
                search
                  ? 'Periksa ejaan nama atau kode obat, lalu coba lagi.'
                  : 'Tambahkan obat jadi dan batch terlebih dahulu.'
              }
            />
          ) : (
            <ul className="max-h-[580px] divide-y divide-line overflow-y-auto scroll-thin xl:max-h-[calc(100vh-320px)]">
              {obatList.map((obat) => {
                const siapJual = Number(obat.stok_siap_jual) || 0;
                const habis = siapJual <= 0;

                return (
                  <li key={obat.id}>
                    <button
                      type="button"
                      onClick={() => addToCart(obat)}
                      disabled={habis}
                      className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-brand-50/60 disabled:bg-white disabled:hover:bg-white"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-small font-semibold text-ink">{obat.nama_obat}</p>
                        <p className="mt-0.5 text-micro text-muted nums">
                          {obat.kode_obat} · {formatRupiah(obat.harga_jual)} / {obat.satuan}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        {habis ? (
                          <Badge variant="neutral">Habis</Badge>
                        ) : (
                          <>
                            <p className="text-small font-semibold text-ink nums">
                              {formatNumber(siapJual)}
                            </p>
                            <p className="text-micro text-muted">siap jual</p>
                          </>
                        )}
                      </div>
                      {!habis ? (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control border border-line bg-surface text-brand-700 transition-colors group-hover:border-brand-600 group-hover:bg-brand-700 group-hover:text-white">
                          <Plus className="h-4 w-4" aria-hidden="true" />
                        </span>
                      ) : (
                        <span className="h-9 w-9 shrink-0" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel className="overflow-hidden xl:sticky xl:top-20">
          <div className="flex items-center justify-between gap-3 bg-brand-900 px-4 py-4 text-white">
            <div className="flex items-center gap-2.5">
              <ShoppingCart className="h-[18px] w-[18px] text-brand-200" aria-hidden="true" />
              <h2 className="text-subtitle text-white">Keranjang</h2>
            </div>
            {cart.length ? (
              <span className="rounded-control border border-white/15 bg-white/10 px-2 py-0.5 text-micro font-semibold text-white">
                {cart.length} baris
              </span>
            ) : null}
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {cartRows.length === 0 ? (
              <EmptyState
                icon={ShoppingCart}
                title="Keranjang masih kosong"
                description="Tekan baris obat pada daftar untuk menambahkan."
              />
            ) : (
              <ul className="divide-y divide-line">
                {cartRows.map((row) => {
                  const qtyError = errors[`qty-${row.obat.id}`];
                  const allocation = row.allocation;

                  return (
                    <li key={row.obat.id} className="px-4 py-3.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-small font-semibold text-ink">{row.obat.nama_obat}</p>
                          <p className="mt-0.5 text-micro text-muted nums">
                            {formatRupiah(row.obat.harga_jual)} / {row.obat.satuan}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLine(row.obat.id)}
                          aria-label={`Hapus ${row.obat.nama_obat} dari keranjang`}
                          className="-mr-2 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-muted hover:bg-red-50 hover:text-danger"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => stepQty(row, -1)}
                            disabled={row.qty <= 1}
                            aria-label={`Kurangi jumlah ${row.obat.nama_obat}`}
                            className="flex h-11 w-11 items-center justify-center rounded-control border border-line text-ink transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-40"
                          >
                            <Minus className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={row.obat.stok_siap_jual}
                            step="1"
                            value={row.jumlah}
                            onChange={(event) => updateQty(row.obat.id, event.target.value)}
                            aria-label={`Jumlah ${row.obat.nama_obat}`}
                            aria-invalid={qtyError ? true : undefined}
                            className={`h-11 w-16 rounded-control border bg-white text-center text-small font-semibold text-ink nums ${
                              qtyError
                                ? 'border-danger'
                                : 'border-line hover:border-brand-300'
                            } focus:border-brand-600 focus:ring-4 focus:ring-brand-100/70`}
                          />
                          <button
                            type="button"
                            onClick={() => stepQty(row, 1)}
                            disabled={row.qty >= Number(row.obat.stok_siap_jual)}
                            aria-label={`Tambah jumlah ${row.obat.nama_obat}`}
                            className="flex h-11 w-11 items-center justify-center rounded-control border border-line text-ink transition-colors hover:border-brand-300 hover:bg-brand-50 disabled:pointer-events-none disabled:opacity-40"
                          >
                            <Plus className="h-4 w-4" aria-hidden="true" />
                          </button>
                        </div>
                        <p className="text-small font-semibold text-ink nums">
                          {formatRupiah(row.subtotal)}
                        </p>
                      </div>

                      {qtyError ? (
                        <p className="mt-1.5 text-small text-danger" role="alert">
                          {qtyError}
                        </p>
                      ) : null}

                      {row.qty > 0 ? (
                        allocation?.ok ? (
                          <div className="mt-2.5 rounded-control border border-line bg-surface px-3 py-2">
                            <p className="text-micro font-semibold text-muted">Pembagian batch FEFO</p>
                            <ul className="mt-1 space-y-0.5">
                              {allocation.allocations.map((part) => (
                                <li
                                  key={part.batch.id}
                                  className="flex items-center justify-between gap-3 text-micro text-ink nums"
                                >
                                  <span>
                                    {part.batch.nomor_batch} · exp{' '}
                                    {formatDate(part.batch.tanggal_expired)}
                                  </span>
                                  <span>
                                    {formatNumber(part.qty)} {row.obat.satuan}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="mt-2 flex items-start gap-1.5 text-micro text-warning">
                            <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            Stok siap jual tidak mencukupi. Tersedia{' '}
                            {formatNumber(allocation?.available ?? 0)} {row.obat.satuan}.
                          </p>
                        )
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="space-y-4 border-t border-line bg-surface px-4 py-4">
              <div className="flex items-end justify-between gap-3">
                <p className="text-small font-medium text-muted">Total</p>
                <p className="text-title font-bold tracking-[-0.02em] nums">{formatRupiah(total)}</p>
              </div>

              <Field label="Uang diterima" htmlFor="uang-diterima" required error={errors.uang}>
                <Input
                  id="uang-diterima"
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={uang}
                  onChange={(event) => {
                    setUang(event.target.value);
                    setErrors({});
                    setFormError('');
                  }}
                  invalid={Boolean(errors.uang)}
                  disabled={cartRows.length === 0}
                  className="text-right nums"
                />
              </Field>

              <div className="flex items-center justify-between border-t border-line pt-3">
                <p className="text-small font-medium text-muted">Kembalian</p>
                <p className="text-subtitle font-semibold nums" aria-live="polite">
                  {formatRupiah(kembalian)}
                </p>
              </div>

              {formError ? (
                <p role="alert" className="text-small text-danger">
                  {formError}
                </p>
              ) : null}

              <Button
                type="submit"
                className="w-full"
                loading={createSale.isPending}
                disabled={cartRows.length === 0}
              >
                Simpan penjualan
              </Button>
            </div>
          </form>
        </Panel>
      </div>
    </>
  );
}
