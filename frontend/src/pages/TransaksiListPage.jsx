import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ReceiptText } from 'lucide-react';
import { PageHeader, Panel, PanelHeader } from '../components/ui/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { Badge } from '../components/ui/Badge';
import { useTransaksiList } from '../hooks/useData';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatDateTime } from '../lib/dates';
import { PER_PAGE } from '../lib/constants';
import { formatNumber, formatRupiah } from '../lib/format';

export default function TransaksiListPage() {
  usePageMeta('Transaksi');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useTransaksiList(page);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    if (data && page > data.last_page) setPage(data.last_page);
  }, [data, page]);

  return (
    <>
      <PageHeader
        title="Daftar Transaksi"
        description="Transaksi penjualan dan penebusan resep, diurutkan dari yang terbaru."
      />

      {isLoading ? (
        <LoadingState rows={6} label="Memuat daftar transaksi" />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={refetch} />
      ) : (
        <Panel className="overflow-hidden">
          <PanelHeader
            icon={ReceiptText}
            title="Daftar transaksi"
            description="Penjualan kasir dan penebusan resep terbaru."
            actions={<Badge variant="neutral">{formatNumber(total)} transaksi</Badge>}
          />
          {total === 0 ? (
            <EmptyState
              title="Belum ada transaksi"
              description="Transaksi penjualan dan penebusan resep akan tampil di sini."
            />
          ) : (
            <>
              <Table minWidth="760px">
                <THead>
                  <TR height="compact">
                    <TH>Kode transaksi</TH>
                    <TH>Tanggal</TH>
                    <TH align="right">Total</TH>
                    <TH>Kode resep</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((transaksi) => (
                    <TR key={transaksi.id}>
                      <TD>
                        <Link
                          to={`/transaksi/${transaksi.id}`}
                          className="font-semibold text-ink hover:text-brand-700 hover:underline nums"
                        >
                          {transaksi.kode_transaksi}
                        </Link>
                      </TD>
                      <TD className="whitespace-nowrap">{formatDateTime(transaksi.tanggal)}</TD>
                      <TD align="right" numeric className="font-semibold">
                        {formatRupiah(transaksi.total)}
                      </TD>
                      <TD numeric className={transaksi.resep_kode ? 'text-ink' : 'text-muted'}>
                        {transaksi.resep_kode || '-'}
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
              <Pagination page={page} perPage={PER_PAGE} total={total} onChange={setPage} />
            </>
          )}
        </Panel>
      )}
    </>
  );
}
