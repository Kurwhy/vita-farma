import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Plus } from 'lucide-react';
import { PageHeader, Panel, PanelHeader } from '../components/ui/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { Badge, ResepStatusBadge } from '../components/ui/Badge';
import { useResepList } from '../hooks/useData';
import { usePageMeta } from '../hooks/usePageMeta';
import { PER_PAGE, JENIS_RESEP_LABEL } from '../lib/constants';
import { formatDate } from '../lib/dates';

const primaryLink =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-brand-700 px-4 text-small font-semibold text-white hover:bg-brand-800';

export default function ResepListPage() {
  usePageMeta('Resep');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useResepList(page);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    if (data && page > data.last_page) setPage(data.last_page);
  }, [data, page]);

  return (
    <>
      <PageHeader
        title="Daftar Resep"
        description="Catatan resep dokter beserta status penebusannya."
        actions={
          <Link to="/resep/baru" className={primaryLink}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Catat resep
          </Link>
        }
      />

      {isLoading ? (
        <LoadingState rows={6} label="Memuat daftar resep" />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={refetch} />
      ) : (
        <Panel className="overflow-hidden">
          <PanelHeader
            icon={ClipboardList}
            title="Daftar resep"
            description="Catatan resep dokter dan status penebusannya."
            actions={<Badge variant="neutral">{total} resep</Badge>}
          />
          {total === 0 ? (
            <EmptyState
              title="Belum ada resep"
              description="Catat resep dokter agar penebusan obat tercatat per resep."
              action={
                <Link to="/resep/baru" className={primaryLink}>
                  Catat resep
                </Link>
              }
            />
          ) : (
            <>
              <Table minWidth="900px">
                <THead>
                  <TR height="compact">
                    <TH>Kode resep</TH>
                    <TH>Tanggal</TH>
                    <TH>Nama pasien</TH>
                    <TH>Nama dokter</TH>
                    <TH>Jenis</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((resep) => (
                    <TR key={resep.id}>
                      <TD>
                        <Link
                          to={`/resep/${resep.id}`}
                          className="font-semibold text-ink hover:text-brand-700 hover:underline nums"
                        >
                          {resep.kode_resep}
                        </Link>
                      </TD>
                      <TD className="whitespace-nowrap">{formatDate(resep.tanggal)}</TD>
                      <TD>{resep.nama_pasien}</TD>
                      <TD>{resep.nama_dokter}</TD>
                      <TD className="whitespace-nowrap">{JENIS_RESEP_LABEL[resep.jenis]}</TD>
                      <TD>
                        <ResepStatusBadge status={resep.status} />
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
