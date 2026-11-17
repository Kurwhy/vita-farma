import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Boxes, PackagePlus, Pill } from 'lucide-react';
import { PageHeader, Panel, PanelHeader } from '../components/ui/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { BatchStatusBadge, Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Field } from '../components/ui/Field';
import { Input } from '../components/ui/Inputs';
import { useToast } from '../components/ui/Toast';
import { useAddBatch } from '../hooks/useMutations';
import { useObatDetail } from '../hooks/useData';
import { usePageMeta } from '../hooks/usePageMeta';
import { addDaysISO, formatDate, todayISO } from '../lib/dates';
import { JENIS_OBAT_LABEL } from '../lib/constants';
import { formatNumber, formatRupiah, parseInteger } from '../lib/format';

const EMPTY_FORM = { nomor_batch: '', tanggal_expired: '', qty: '' };

export default function ObatDetailPage() {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useObatDetail(id);
  const addBatch = useAddBatch();
  const { notify } = useToast();
  usePageMeta(data?.obat?.nama_obat || 'Detail obat');

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!data) return;
    setForm(EMPTY_FORM);
    setErrors({});
    setFormError('');
  }, [data?.obat?.id]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.nomor_batch.trim()) {
      nextErrors.nomor_batch = 'Nomor batch wajib diisi.';
    } else if (form.nomor_batch.trim().length > 50) {
      nextErrors.nomor_batch = 'Nomor batch maksimal 50 karakter.';
    } else if (
      data.batch.some(
        (batch) => batch.nomor_batch.toLowerCase() === form.nomor_batch.trim().toLowerCase(),
      )
    ) {
      nextErrors.nomor_batch = 'Nomor batch sudah dipakai untuk obat ini.';
    }
    if (!form.tanggal_expired) {
      nextErrors.tanggal_expired = 'Tanggal expired wajib diisi.';
    } else if (form.tanggal_expired <= todayISO()) {
      nextErrors.tanggal_expired = 'Tanggal expired harus lebih besar dari hari ini.';
    }
    const qty = parseInteger(form.qty);
    if (form.qty === '') {
      nextErrors.qty = 'Jumlah wajib diisi.';
    } else if (qty === null || qty < 1) {
      nextErrors.qty = 'Jumlah minimal 1.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      await addBatch.mutateAsync({
        obatId: data.obat.id,
        nomor_batch: form.nomor_batch.trim(),
        tanggal_expired: form.tanggal_expired,
        qty,
      });
      notify('Batch baru diterima dan masuk ke stok siap jual.');
      setForm(EMPTY_FORM);
      setErrors({});
      setFormError('');
    } catch (requestError) {
      const source = requestError.errors || {};
      const fieldErrors = {};
      ['nomor_batch', 'tanggal_expired', 'qty'].forEach((field) => {
        if (Array.isArray(source[field]) && source[field][0]) {
          fieldErrors[field] = source[field][0];
        }
      });
      setErrors(fieldErrors);
      setFormError(requestError.message || 'Batch tidak dapat disimpan.');
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader title="Detail obat" description="Memuat data obat dan batch." />
        <LoadingState rows={6} label="Memuat data obat" />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <PageHeader title="Detail obat" />
        <ErrorState message={error?.message} onRetry={refetch} />
      </>
    );
  }

  return (
    <>
      <Link
        to="/obat"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-small font-semibold text-brand-700 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Kembali ke daftar obat
      </Link>

      <PageHeader
        title={data.obat.nama_obat}
        description={`${data.obat.kode_obat} · ${JENIS_OBAT_LABEL[data.obat.jenis]}`}
      />

      <div className="space-y-4">
        <Panel className="overflow-hidden">
          <PanelHeader
            icon={Pill}
            title="Data obat"
            description="Identitas dan ketentuan jual obat."
          />
          <dl className="grid gap-x-8 gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-small text-muted">Kode obat</dt>
              <dd className="mt-0.5 text-small font-semibold text-ink nums">{data.obat.kode_obat}</dd>
            </div>
            <div>
              <dt className="text-small text-muted">Nama obat</dt>
              <dd className="mt-0.5 text-small font-semibold text-ink">{data.obat.nama_obat}</dd>
            </div>
            <div>
              <dt className="text-small text-muted">Jenis</dt>
              <dd className="mt-0.5">
                <Badge variant={data.obat.jenis === 'jadi' ? 'brand' : 'neutral'}>
                  {JENIS_OBAT_LABEL[data.obat.jenis]}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-small text-muted">Satuan</dt>
              <dd className="mt-0.5 text-small font-semibold text-ink">{data.obat.satuan}</dd>
            </div>
            <div>
              <dt className="text-small text-muted">Harga jual</dt>
              <dd className="mt-0.5 text-small font-semibold text-ink nums">
                {formatRupiah(data.obat.harga_jual)}
              </dd>
            </div>
            <div>
              <dt className="text-small text-muted">Stok minimum</dt>
              <dd className="mt-0.5 text-small font-semibold text-ink nums">
                {formatNumber(data.obat.stok_minimum)} {data.obat.satuan}
              </dd>
            </div>
          </dl>
        </Panel>

        <div className="grid items-start gap-4 xl:grid-cols-3">
          <Panel className="overflow-hidden xl:col-span-2">
            <PanelHeader
              icon={Boxes}
              title="Daftar batch"
              description="Diurutkan dari tanggal expired terdekat."
              actions={<Badge variant="neutral">{formatNumber(data.batch.length)} batch</Badge>}
            />
            {data.batch.length === 0 ? (
              <EmptyState
                icon={PackagePlus}
                title="Belum ada batch"
                description="Catat penerimaan batch pertama melalui formulir di samping."
              />
            ) : (
              <Table minWidth="680px">
                <THead>
                  <TR height="compact">
                    <TH>Nomor batch</TH>
                    <TH>Tanggal expired</TH>
                    <TH align="right">Qty</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <TBody>
                  {data.batch.map((batch) => (
                    <TR key={batch.id}>
                      <TD numeric className="font-medium">
                        {batch.nomor_batch}
                      </TD>
                      <TD className="whitespace-nowrap">{formatDate(batch.tanggal_expired)}</TD>
                      <TD align="right" numeric>
                        {formatNumber(batch.qty)} {data.obat.satuan}
                      </TD>
                      <TD>
                        <BatchStatusBadge status={batch.status} />
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </Panel>

          <Panel className="overflow-hidden xl:sticky xl:top-20">
            <PanelHeader
              icon={PackagePlus}
              title="Penerimaan batch baru"
              description="Nomor batch harus unik untuk obat ini."
            />
            <form className="space-y-4 p-5" onSubmit={handleSubmit} noValidate>
              {formError ? (
                <p role="alert" className="text-small text-danger">
                  {formError}
                </p>
              ) : null}
              <Field label="Nomor batch" htmlFor="nomor_batch" required error={errors.nomor_batch}>
                <Input
                  id="nomor_batch"
                  value={form.nomor_batch}
                  onChange={update('nomor_batch')}
                  invalid={Boolean(errors.nomor_batch)}
                  maxLength={50}
                  placeholder="Contoh: PCM2603E"
                  className="nums"
                />
              </Field>
              <Field
                label="Tanggal expired"
                htmlFor="tanggal_expired"
                required
                error={errors.tanggal_expired}
              >
                <Input
                  id="tanggal_expired"
                  type="date"
                  min={addDaysISO(1)}
                  value={form.tanggal_expired}
                  onChange={update('tanggal_expired')}
                  invalid={Boolean(errors.tanggal_expired)}
                  className="nums"
                />
              </Field>
              <Field label="Jumlah diterima" htmlFor="qty" required error={errors.qty}>
                <Input
                  id="qty"
                  type="number"
                  inputMode="numeric"
                  min="1"
                  step="1"
                  value={form.qty}
                  onChange={update('qty')}
                  invalid={Boolean(errors.qty)}
                  placeholder="120"
                  className="nums"
                />
              </Field>
              <Button type="submit" className="w-full" loading={addBatch.isPending}>
                Simpan batch
              </Button>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
