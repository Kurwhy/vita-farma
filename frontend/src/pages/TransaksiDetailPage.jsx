import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ClipboardList, ReceiptText } from 'lucide-react';
import { PageHeader, Panel, PanelHeader } from '../components/ui/PageHeader';
import { LoadingState, ErrorState } from '../components/ui/States';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { ResepStatusBadge, Badge } from '../components/ui/Badge';
import { useAuth } from '../context/AuthContext';
import { useTransaksiDetail } from '../hooks/useData';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatDate, formatDateTime } from '../lib/dates';
import { JENIS_RESEP_LABEL, ROLE_LABEL } from '../lib/constants';
import { formatRupiah } from '../lib/format';

export default function TransaksiDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useTransaksiDetail(id);
  usePageMeta(data?.transaksi?.kode_transaksi || 'Detail transaksi');

  if (isLoading) {
    return (
      <>
        <PageHeader title="Detail transaksi" description="Memuat rincian transaksi." />
        <LoadingState rows={6} label="Memuat detail transaksi" />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Detail transaksi" />
        <ErrorState message={error?.message} onRetry={refetch} />
      </>
    );
  }

  const { transaksi, items, resep, user: kasir } = data;
  const canOpenResep = ['admin', 'apoteker'].includes(user.role);

  return (
    <>
      <Link
        to="/transaksi"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-small font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar transaksi
      </Link>

      <PageHeader
        title={<span className="nums">{transaksi.kode_transaksi}</span>}
        description={formatDateTime(transaksi.tanggal)}
        actions={
          transaksi.resep_id ? (
            <Badge variant="brand">Transaksi penebusan resep</Badge>
          ) : (
            <Badge variant="neutral">Penjualan tanpa resep</Badge>
          )
        }
      />

      <div className="grid items-start gap-4 xl:grid-cols-3">
        <Panel className="overflow-hidden xl:col-span-2">
          <PanelHeader
            icon={ReceiptText}
            title="Item transaksi"
            description="Setiap item mencatat batch dan tanggal expired yang dipakai."
            actions={<Badge variant="neutral">{items.length} baris</Badge>}
          />
          <Table minWidth="700px">
            <THead>
              <TR height="compact">
                <TH>Obat</TH>
                <TH>Batch</TH>
                <TH>Tanggal expired</TH>
                <TH align="right">Qty</TH>
                <TH align="right">Harga satuan</TH>
                <TH align="right">Subtotal</TH>
              </TR>
            </THead>
            <TBody>
              {items.map((item) => (
                <TR key={item.id}>
                  <TD>
                    <p className="font-medium text-ink">{item.obat?.nama_obat}</p>
                    <p className="text-micro text-muted nums">{item.obat?.kode_obat}</p>
                  </TD>
                  <TD numeric>{item.batch?.nomor_batch}</TD>
                  <TD className="whitespace-nowrap">
                    {item.batch ? formatDate(item.batch.tanggal_expired) : '-'}
                  </TD>
                  <TD align="right" numeric>
                    {item.qty} {item.obat?.satuan}
                  </TD>
                  <TD align="right" numeric>
                    {formatRupiah(item.harga_satuan)}
                  </TD>
                  <TD align="right" numeric className="font-semibold">
                    {formatRupiah(item.subtotal)}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </Panel>

        <div className="rounded-card border border-brand-900 bg-brand-900 p-5 text-white xl:sticky xl:top-20">
          <div className="flex items-center justify-between">
            <h2 className="text-subtitle text-white">Ringkasan pembayaran</h2>
            <ReceiptText className="h-5 w-5 text-brand-300" aria-hidden="true" />
          </div>
          <dl className="mt-5 space-y-3">
            <div className="flex items-center justify-between gap-3 text-small">
              <dt className="text-brand-300">Tanggal</dt>
              <dd className="nums text-right text-white">{formatDateTime(transaksi.tanggal)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-small">
              <dt className="text-brand-300">Kasir</dt>
              <dd className="text-right text-white">
                {kasir?.nama || '-'}
                {kasir ? <span className="text-brand-300"> · {ROLE_LABEL[kasir.role]}</span> : null}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-small">
              <dt className="text-brand-300">Kode resep</dt>
              <dd className="nums text-right text-white">{resep?.kode_resep || '-'}</dd>
            </div>
            <div className="border-t border-white/10 pt-4">
              <dt className="text-micro font-medium text-brand-300">Total</dt>
              <dd className="mt-1 text-[28px] font-bold leading-tight tracking-[-0.03em] text-white nums">
                {formatRupiah(transaksi.total)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-small">
              <dt className="text-brand-300">Uang diterima</dt>
              <dd className="nums text-white">{formatRupiah(transaksi.uang_diterima)}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 text-small">
              <dt className="text-brand-300">Kembalian</dt>
              <dd className="nums font-semibold text-white">
                {formatRupiah(transaksi.kembalian)}
              </dd>
            </div>
          </dl>
        </div>

        {resep ? (
          <Panel className="overflow-hidden xl:col-span-3">
            <PanelHeader
              icon={ClipboardList}
              title="Data resep"
              description="Resep asal transaksi penebusan ini."
              actions={<ResepStatusBadge status={resep.status} />}
            />
            <dl className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-small text-muted">Kode resep</dt>
                <dd className="mt-0.5 text-small font-semibold text-ink nums">
                  {canOpenResep ? (
                    <Link to={`/resep/${resep.id}`} className="text-brand-700 hover:underline">
                      {resep.kode_resep}
                    </Link>
                  ) : (
                    resep.kode_resep
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-small text-muted">Nama pasien</dt>
                <dd className="mt-0.5 text-small font-semibold text-ink">{resep.nama_pasien}</dd>
              </div>
              <div>
                <dt className="text-small text-muted">Nama dokter</dt>
                <dd className="mt-0.5 text-small font-semibold text-ink">{resep.nama_dokter}</dd>
              </div>
              <div>
                <dt className="text-small text-muted">Jenis resep</dt>
                <dd className="mt-0.5">
                  <Badge variant="brand">{JENIS_RESEP_LABEL[resep.jenis]}</Badge>
                </dd>
              </div>
              {resep.jenis === 'racikan' ? (
                <>
                  <div>
                    <dt className="text-small text-muted">Nama racikan</dt>
                    <dd className="mt-0.5 text-small font-semibold text-ink">
                      {resep.nama_racikan || '-'}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-small text-muted">Aturan pakai</dt>
                    <dd className="mt-0.5 text-small font-semibold text-ink">
                      {resep.aturan_pakai || '-'}
                    </dd>
                  </div>
                </>
              ) : null}
            </dl>
          </Panel>
        ) : null}
      </div>
    </>
  );
}
