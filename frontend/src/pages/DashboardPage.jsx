import { Link } from 'react-router-dom';
import { ArrowRight, CircleCheck, TriangleAlert, Wallet } from 'lucide-react';
import { PageHeader, Panel, PanelHeader } from '../components/ui/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { useDashboardData } from '../hooks/useData';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatDateLong, todayISO } from '../lib/dates';
import { formatNumber, formatRupiah } from '../lib/format';

const secondaryLink =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control border border-line bg-white px-4 text-small font-semibold text-ink transition-colors hover:border-brand-300 hover:bg-brand-50';

export default function DashboardPage() {
  usePageMeta('Dashboard');
  const { data, isLoading, isError, error, refetch } = useDashboardData();

  return (
    <>
      <PageHeader
        title="Dashboard"
        description={`Ringkasan operasional apotek, ${formatDateLong(todayISO())}.`}
      />

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <LoadingState rows={4} label="Memuat ringkasan transaksi" />
          <LoadingState rows={6} label="Memuat peringatan stok minimum" />
        </div>
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={refetch} />
      ) : (
        <div className="grid items-start gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <div className="rounded-card border border-brand-900 bg-brand-900 p-6 text-white">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between xl:flex-col xl:items-stretch">
              <div className="min-w-0">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-small font-medium text-brand-200">Total penjualan hari ini</p>
                  <Wallet className="h-5 w-5 shrink-0 text-brand-300" aria-hidden="true" />
                </div>
                <p className="mt-3 text-[32px] font-bold leading-tight tracking-[-0.03em] nums">
                  {formatRupiah(data.total_penjualan)}
                </p>
              </div>

              <div className="border-t border-white/10 pt-5 sm:border-t-0 sm:pt-0 sm:text-right xl:border-t xl:pt-5 xl:text-left">
                <p className="text-micro font-medium text-brand-300">Transaksi hari ini</p>
                <p className="mt-1 text-subtitle text-white nums">
                  {formatNumber(data.jumlah_transaksi)} transaksi
                </p>
                <Link
                  to="/transaksi"
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-white px-4 text-small font-semibold text-brand-900 transition-colors hover:bg-brand-50 sm:w-auto xl:w-full"
                >
                  Lihat transaksi
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          <Panel className="overflow-hidden">
            <PanelHeader
              icon={TriangleAlert}
              title="Peringatan stok minimum"
              description="Stok siap jual yang menyentuh batas aman."
              iconClassName="border-amber-200 bg-amber-50 text-warning"
              actions={
                <>
                  {data.stok_minimum.length > 0 ? (
                    <Badge variant="warning">
                      {formatNumber(data.stok_minimum.length)} obat
                    </Badge>
                  ) : null}
                  <Link to="/stok" className={secondaryLink}>
                    Lihat semua stok
                  </Link>
                </>
              }
            />

            {data.stok_minimum.length === 0 ? (
              <EmptyState
                icon={CircleCheck}
                title="Seluruh obat masih di atas stok minimum"
                description="Tidak ada obat yang menyentuh batas aman saat ini."
              />
            ) : (
              <>
                <div className="lg:hidden">
                  <ul className="divide-y divide-line">
                    {data.stok_minimum.slice(0, 6).map((row) => (
                      <li key={row.id} className="px-5 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="flex items-start gap-2 text-small font-semibold text-ink">
                              <TriangleAlert
                                className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                                aria-hidden="true"
                              />
                              <span>{row.nama_obat}</span>
                            </p>
                            <p className="mt-0.5 pl-6 text-micro text-muted nums">
                              {row.kode_obat}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-small font-semibold text-warning nums">
                              {formatNumber(row.stok_siap_jual)} {row.satuan}
                            </p>
                            <p className="text-micro text-muted">Siap jual</p>
                          </div>
                        </div>
                        <p className="mt-1 pl-6 text-micro text-muted nums">
                          Minimum {formatNumber(row.stok_minimum)} {row.satuan}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="hidden lg:block">
                  <Table minWidth="560px">
                    <THead>
                      <TR height="compact">
                        <TH>Nama obat</TH>
                        <TH>Kode obat</TH>
                        <TH align="right">Stok siap jual</TH>
                        <TH align="right">Stok minimum</TH>
                      </TR>
                    </THead>
                    <TBody>
                      {data.stok_minimum.slice(0, 6).map((row) => (
                        <TR key={row.id}>
                          <TD>
                            <span className="flex items-center gap-2">
                              <TriangleAlert
                                className="h-4 w-4 shrink-0 text-warning"
                                aria-hidden="true"
                              />
                              <span className="font-medium">{row.nama_obat}</span>
                            </span>
                          </TD>
                          <TD numeric className="text-muted">
                            {row.kode_obat}
                          </TD>
                          <TD align="right" numeric>
                            <span className="font-semibold text-warning">
                              {formatNumber(row.stok_siap_jual)}
                            </span>
                          </TD>
                          <TD align="right" numeric>
                            {formatNumber(row.stok_minimum)}
                          </TD>
                        </TR>
                      ))}
                    </TBody>
                  </Table>
                </div>

                {data.stok_minimum.length > 6 ? (
                  <p className="border-t border-line px-5 py-3 text-small text-muted">
                    Menampilkan 6 peringatan teratas. Buka halaman stok untuk melihat seluruh obat.
                  </p>
                ) : null}
              </>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
