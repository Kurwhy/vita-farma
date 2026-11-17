import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CircleCheck, ClipboardList, FlaskConical, Pill, ReceiptText, TriangleAlert } from 'lucide-react';
import { PageHeader, Panel, PanelHeader } from '../components/ui/PageHeader';
import { LoadingState, ErrorState } from '../components/ui/States';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { ResepStatusBadge, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Inputs';
import { useToast } from '../components/ui/Toast';
import { useResepDetail, useStokData } from '../hooks/useData';
import { useTebusResep } from '../hooks/useMutations';
import { usePageMeta } from '../hooks/usePageMeta';
import { formatDate, formatDateTime } from '../lib/dates';
import { JENIS_RESEP_LABEL } from '../lib/constants';
import { formatRupiah, parseInteger } from '../lib/format';
import { allocateMany } from '../lib/stock';

export default function ResepDetailPage() {
  const { id } = useParams();
  const resepQuery = useResepDetail(id);
  const stokQuery = useStokData();
  const tebus = useTebusResep();
  const { notify } = useToast();
  usePageMeta(resepQuery.data?.resep?.kode_resep || 'Detail resep');

  const [uang, setUang] = useState('');
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const isLoading = resepQuery.isLoading || stokQuery.isLoading;
  const isError = resepQuery.isError || stokQuery.isError;
  const error = resepQuery.error || stokQuery.error;
  const refetch = () => {
    resepQuery.refetch();
    stokQuery.refetch();
  };
  const data = resepQuery.data;
  const submitting = tebus.isPending;

  if (isLoading) {
    return (
      <>
        <PageHeader title="Detail resep" description="Memuat data resep dan penebusan." />
        <LoadingState rows={6} label="Memuat detail resep" />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Detail resep" />
        <ErrorState message={error?.message} onRetry={refetch} />
      </>
    );
  }

  const { resep, items, transaksi } = data;
  const batchTersedia = (stokQuery.data?.data ?? []).flatMap(
    (row) => row.batch_tersedia ?? [],
  );
  const total = items.reduce(
    (sum, item) => sum + Number(item.obat?.harga_jual || 0) * Number(item.jumlah),
    0,
  );
  const allocation = items.length
    ? allocateMany(
        items.map((item) => ({ obat_id: item.obat_id, jumlah: item.jumlah, obat: item.obat })),
        batchTersedia,
      )
    : { ok: false, message: 'Resep belum memiliki baris obat.', lines: [] };
  const allocationMap = new Map(
    (allocation.lines || []).map((line) => [line.obat_id, line.allocations]),
  );
  const uangValue = parseInteger(uang);
  const kembalian = uangValue !== null && uangValue >= total ? uangValue - total : 0;

  const handleTebus = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (uang === '') nextErrors.uang = 'Uang diterima wajib diisi.';
    else if (uangValue === null) nextErrors.uang = 'Uang diterima harus bilangan bulat.';
    else if (uangValue < total) nextErrors.uang = 'Uang diterima minimal sama dengan total.';
    setErrors(nextErrors);
    setFormError('');
    if (Object.keys(nextErrors).length) return;

    try {
      const result = await tebus.mutateAsync({ id: resep.id, uang_diterima: uangValue });
      notify(
        `Resep ditebus. Transaksi ${result.kode_transaksi} dibuat dengan kembalian ${formatRupiah(result.kembalian)}.`,
      );
      setUang('');
      setErrors({});
      setFormError('');
    } catch (requestError) {
      const message = requestError.message || 'Penebusan resep tidak dapat dilakukan.';
      setFormError(message);
      notify(message, 'error');
    }
  };

  return (
    <>
      <Link
        to="/resep"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-small font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar resep
      </Link>

      <PageHeader
        title={<span className="nums">{resep.kode_resep}</span>}
        description={`${resep.nama_pasien} · ${formatDate(resep.tanggal)}`}
        actions={<ResepStatusBadge status={resep.status} />}
      />

      <div className="grid items-start gap-4 xl:grid-cols-3">
        <div className="min-w-0 space-y-4 xl:col-span-2">
          <Panel className="overflow-hidden">
            <PanelHeader
              icon={ClipboardList}
              title="Data resep"
              description="Identitas pasien, dokter, dan ketentuan racikan."
            />
            <dl className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2">
              <div>
                <dt className="text-small text-muted">Nama pasien</dt>
                <dd className="mt-0.5 text-small font-semibold text-ink">{resep.nama_pasien}</dd>
              </div>
              <div>
                <dt className="text-small text-muted">Nomor rekam medis</dt>
                <dd className="mt-0.5 text-small font-semibold text-ink nums">
                  {resep.nomor_rm || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-small text-muted">Nama dokter</dt>
                <dd className="mt-0.5 text-small font-semibold text-ink">{resep.nama_dokter}</dd>
              </div>
              <div>
                <dt className="text-small text-muted">Nomor SIP dokter</dt>
                <dd className="mt-0.5 text-small font-semibold text-ink nums">
                  {resep.nomor_sip || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-small text-muted">Jenis resep</dt>
                <dd className="mt-0.5">
                  <Badge variant="brand">{JENIS_RESEP_LABEL[resep.jenis]}</Badge>
                </dd>
              </div>
              {resep.jenis === 'racikan' ? (
                <div>
                  <dt className="text-small text-muted">Nama racikan</dt>
                  <dd className="mt-0.5 text-small font-semibold text-ink">
                    {resep.nama_racikan || '-'}
                  </dd>
                </div>
              ) : null}
              {resep.jenis === 'racikan' ? (
                <div className="sm:col-span-2">
                  <dt className="text-small text-muted">Aturan pakai racikan</dt>
                  <dd className="mt-0.5 text-small font-semibold text-ink">{resep.aturan_pakai}</dd>
                </div>
              ) : null}
            </dl>
          </Panel>

          <Panel className="overflow-hidden">
            <PanelHeader
              icon={resep.jenis === 'jadi' ? Pill : FlaskConical}
              title={resep.jenis === 'jadi' ? 'Daftar obat' : 'Daftar bahan racikan'}
              description="Rincian obat dan aturan pakai pada resep."
              actions={<Badge variant="neutral">{items.length} baris</Badge>}
            />
            <Table minWidth="680px">
              <THead>
                <TR height="compact">
                  <TH>Obat atau bahan</TH>
                  <TH align="right">Jumlah</TH>
                  <TH align="right">Harga satuan</TH>
                  <TH align="right">Subtotal</TH>
                  <TH>Aturan pakai</TH>
                </TR>
              </THead>
              <TBody>
                {items.map((item) => (
                  <TR key={item.id}>
                    <TD>
                      <p className="font-medium text-ink">{item.obat?.nama_obat}</p>
                      <p className="text-micro text-muted nums">{item.obat?.kode_obat}</p>
                    </TD>
                    <TD align="right" numeric>
                      {item.jumlah} {item.obat?.satuan}
                    </TD>
                    <TD align="right" numeric>
                      {formatRupiah(item.obat?.harga_jual)}
                    </TD>
                    <TD align="right" numeric className="font-semibold">
                      {formatRupiah(Number(item.obat?.harga_jual || 0) * Number(item.jumlah))}
                    </TD>
                    <TD className="text-small text-muted">{item.aturan_pakai || '-'}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
            <div className="flex items-center justify-between border-t border-line bg-surface px-5 py-4">
              <p className="text-small font-medium text-muted">Total resep</p>
              <p className="text-title font-bold tracking-[-0.02em] nums">{formatRupiah(total)}</p>
            </div>
          </Panel>
        </div>

        <div className="min-w-0 xl:sticky xl:top-20">
          {resep.status === 'menunggu' ? (
            <Panel className="overflow-hidden border-brand-200">
              <PanelHeader
                icon={ReceiptText}
                title="Tebus resep"
                description="Batch dipilih otomatis dengan FEFO. Satu resep menghasilkan satu transaksi."
                className="bg-brand-50/50"
              />
              <div className="p-5">
              <div className="rounded-control border border-line bg-surface p-3">
                <p className="text-micro font-semibold text-muted">Pembagian batch FEFO</p>
                <ul className="mt-2 space-y-2">
                  {items.map((item) => {
                    const rows = allocationMap.get(item.obat_id);
                    return (
                      <li key={item.id}>
                        <p className="text-small font-medium text-ink">
                          {item.obat?.nama_obat} · {item.jumlah} {item.obat?.satuan}
                        </p>
                        {rows ? (
                          <ul className="mt-0.5 space-y-0.5">
                            {rows.map((part) => (
                              <li
                                key={part.batch.id}
                                className="flex items-center justify-between gap-3 text-micro text-muted nums"
                              >
                                <span>
                                  {part.batch.nomor_batch} · exp {formatDate(part.batch.tanggal_expired)}
                                </span>
                                <span>
                                  {part.qty} {item.obat?.satuan}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-0.5 text-micro text-danger">Stok siap jual tidak mencukupi.</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              {!allocation.ok ? (
                <div
                  className="mt-3 flex items-start gap-2 rounded-control border border-amber-200 bg-amber-50 px-3 py-2 text-small text-warning"
                  role="alert"
                >
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>
                    {allocation.gagal
                      ? `Stok siap jual ${allocation.gagal.obat?.nama_obat} tidak mencukupi. Penebusan tidak dapat dilakukan.`
                      : allocation.message}
                  </span>
                </div>
              ) : null}

              <form className="mt-4 space-y-4" onSubmit={handleTebus} noValidate>
                <div className="flex items-end justify-between border-t border-line pt-3">
                  <p className="text-small font-medium text-muted">Total</p>
                  <p className="text-title font-bold tracking-[-0.02em] nums">
                    {formatRupiah(total)}
                  </p>
                </div>

                <Field label="Uang diterima" htmlFor="uang-tebus" required error={errors.uang}>
                  <Input
                    id="uang-tebus"
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
                  <p className="text-small text-danger" role="alert">
                    {formError}
                  </p>
                ) : null}

                <Button type="submit" className="w-full" loading={submitting} disabled={!allocation.ok}>
                  Tebus resep
                </Button>
              </form>
              </div>
            </Panel>
          ) : (
            <Panel className="overflow-hidden">
              <PanelHeader
                icon={CircleCheck}
                title="Resep sudah ditebus"
                description="Resep yang sudah ditebus tidak dapat ditebus ulang."
                iconClassName="border-green-200 bg-green-50 text-success"
              />
              <div className="p-5">

              {transaksi ? (
                <div className="mt-4 space-y-3 rounded-control border border-line bg-surface p-3">
                  <div className="flex items-center gap-2 text-small font-semibold text-ink">
                    <ReceiptText className="h-4 w-4 text-muted" aria-hidden="true" />
                    <Link to={`/transaksi/${transaksi.id}`} className="nums text-brand-700 hover:underline">
                      {transaksi.kode_transaksi}
                    </Link>
                  </div>
                  <dl className="space-y-2">
                    <div className="flex items-center justify-between text-small">
                      <dt className="text-muted">Tanggal</dt>
                      <dd className="nums text-ink">{formatDateTime(transaksi.tanggal)}</dd>
                    </div>
                    <div className="flex items-center justify-between text-small">
                      <dt className="text-muted">Total</dt>
                      <dd className="nums font-semibold text-ink">{formatRupiah(transaksi.total)}</dd>
                    </div>
                    <div className="flex items-center justify-between text-small">
                      <dt className="text-muted">Uang diterima</dt>
                      <dd className="nums text-ink">{formatRupiah(transaksi.uang_diterima)}</dd>
                    </div>
                    <div className="flex items-center justify-between text-small">
                      <dt className="text-muted">Kembalian</dt>
                      <dd className="nums text-ink">{formatRupiah(transaksi.kembalian)}</dd>
                    </div>
                  </dl>
                  <Link
                    to={`/transaksi/${transaksi.id}`}
                    className="inline-flex min-h-11 w-full items-center justify-center rounded-control border border-line bg-white px-4 text-small font-semibold text-ink hover:border-brand-300 hover:bg-brand-50"
                  >
                    Lihat transaksi
                  </Link>
                </div>
              ) : null}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}
