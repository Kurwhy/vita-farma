import { Clock, PackageSearch } from 'lucide-react';
import { PageHeader, Panel, PanelHeader } from '../components/ui/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { useStokData } from '../hooks/useData';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatNumber } from '../lib/format';
import { formatDate } from '../lib/dates';

export default function StokPage() {
  usePageMeta('Stok');
  const { data, isLoading, isError, error, refetch } = useStokData();
  const rows = data?.data ?? [];
  const expiredBatches = data?.batch_expired ?? [];

  return (
    <>
      <PageHeader
        title="Lihat Stok"
        description="Stok total, stok siap jual, dan stok expired dihitung dari seluruh batch obat."
      />

      {isLoading ? (
        <LoadingState rows={8} label="Memuat data stok" />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={refetch} />
      ) : (
        <div className="space-y-4">
          <Panel className="overflow-hidden">
            <PanelHeader
              icon={PackageSearch}
              title="Ringkasan stok per obat"
              description="Stok expired tidak dihitung sebagai persediaan siap jual."
              actions={<Badge variant="neutral">{formatNumber(rows.length)} obat</Badge>}
            />
            <Table minWidth="820px">
              <THead>
                <TR height="compact">
                  <TH>Obat</TH>
                  <TH>Kode</TH>
                  <TH align="right">Stok total</TH>
                  <TH align="right">Stok siap jual</TH>
                  <TH align="right">Stok expired</TH>
                  <TH align="right">Stok minimum</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((row) => {
                  const low =
                    Number(row.stok_minimum) > 0 && row.stok_siap_jual <= Number(row.stok_minimum);
                  return (
                    <TR key={row.id}>
                      <TD>
                        <p className="font-medium text-ink">{row.nama_obat}</p>
                      </TD>
                      <TD numeric className="text-muted">
                        {row.kode_obat}
                      </TD>
                      <TD align="right" numeric>
                        {formatNumber(row.stok_total)}
                      </TD>
                      <TD align="right" numeric>
                        <span className={low ? 'font-semibold text-warning' : 'font-semibold'}>
                          {formatNumber(row.stok_siap_jual)}
                        </span>
                        {low ? <span className="sr-only">, menyentuh stok minimum</span> : null}
                      </TD>
                      <TD align="right" numeric>
                        <span
                          className={row.stok_expired > 0 ? 'font-semibold text-danger' : 'text-muted'}
                        >
                          {formatNumber(row.stok_expired)}
                        </span>
                      </TD>
                      <TD align="right" numeric>
                        {formatNumber(row.stok_minimum)}
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader
              icon={Clock}
              title="Batch expired"
              description="Batch ini tetap tercatat, tetapi tidak dapat dijual."
              iconClassName="border-red-200 bg-red-50 text-danger"
              actions={<Badge variant="danger">{formatNumber(expiredBatches.length)} batch</Badge>}
            />
            {expiredBatches.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Tidak ada batch expired"
                description="Semua batch tercatat masih berlaku atau sudah habis."
              />
            ) : (
              <Table minWidth="760px">
                <THead>
                  <TR height="compact">
                    <TH>Obat</TH>
                    <TH>Nomor batch</TH>
                    <TH>Tanggal expired</TH>
                    <TH align="right">Qty</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <TBody>
                  {expiredBatches.map((batch) => (
                    <TR key={batch.id}>
                      <TD>
                        <p className="font-medium text-ink">{batch.obat?.nama_obat}</p>
                        <p className="text-micro text-muted nums">{batch.obat?.kode_obat}</p>
                      </TD>
                      <TD numeric>{batch.nomor_batch}</TD>
                      <TD className="whitespace-nowrap">{formatDate(batch.tanggal_expired)}</TD>
                      <TD align="right" numeric>
                        {formatNumber(batch.qty)} {batch.obat?.satuan}
                      </TD>
                      <TD>
                        <Badge variant="danger">Expired, tidak dapat dijual</Badge>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}
