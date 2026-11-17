import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Pill, Plus } from 'lucide-react';
import { PageHeader, Panel, PanelHeader } from '../components/ui/PageHeader';
import { LoadingState, ErrorState, EmptyState } from '../components/ui/States';
import { Table, THead, TBody, TR, TH, TD } from '../components/ui/Table';
import { Pagination } from '../components/ui/Pagination';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Field } from '../components/ui/Field';
import { Input, Select } from '../components/ui/Inputs';
import { useToast } from '../components/ui/Toast';
import { useObatList } from '../hooks/useData';
import { useCreateObat, useUpdateObat } from '../hooks/useMutations';
import { usePageMeta } from '../hooks/usePageMeta';
import { JENIS_OBAT_LABEL, PER_PAGE } from '../lib/constants';
import { formatNumber, formatRupiah, parseDecimal, parseInteger } from '../lib/format';

const EMPTY_FORM = {
  nama_obat: '',
  jenis: 'jadi',
  satuan: '',
  harga_jual: '',
  stok_minimum: '',
};

function validate(form) {
  const errors = {};
  if (!form.nama_obat.trim()) {
    errors.nama_obat = 'Nama obat wajib diisi.';
  } else if (form.nama_obat.trim().length > 150) {
    errors.nama_obat = 'Nama obat maksimal 150 karakter.';
  }
  if (!['jadi', 'bahan_racikan'].includes(form.jenis)) {
    errors.jenis = 'Jenis obat wajib dipilih.';
  }
  if (!form.satuan.trim()) {
    errors.satuan = 'Satuan wajib diisi.';
  } else if (form.satuan.trim().length > 30) {
    errors.satuan = 'Satuan maksimal 30 karakter.';
  }
  if (form.harga_jual === '') {
    errors.harga_jual = 'Harga jual wajib diisi.';
  } else if (parseDecimal(form.harga_jual) === null) {
    errors.harga_jual = 'Harga jual minimal 0, maksimal 2 angka desimal.';
  }
  if (form.stok_minimum === '') {
    errors.stok_minimum = 'Stok minimum wajib diisi.';
  } else if (parseInteger(form.stok_minimum) === null) {
    errors.stok_minimum = 'Stok minimum harus bilangan bulat minimal 0.';
  }
  return errors;
}

function serverFieldErrors(error) {
  const source = error?.errors || {};
  const mapped = {};
  ['nama_obat', 'jenis', 'satuan', 'harga_jual', 'stok_minimum'].forEach((field) => {
    const value = source[field];
    if (Array.isArray(value) && value[0]) mapped[field] = value[0];
  });
  return mapped;
}

function ObatFormModal({ open, onClose, initial, onSaved }) {
  const { notify } = useToast();
  const createObat = useCreateObat();
  const updateObat = useUpdateObat();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const saving = createObat.isPending || updateObat.isPending;

  useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            nama_obat: initial.nama_obat,
            jenis: initial.jenis,
            satuan: initial.satuan,
            harga_jual: String(initial.harga_jual),
            stok_minimum: String(initial.stok_minimum),
          }
        : EMPTY_FORM,
    );
    setErrors({});
    setFormError('');
  }, [open, initial]);

  const update = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const payload = {
      nama_obat: form.nama_obat.trim(),
      jenis: form.jenis,
      satuan: form.satuan.trim(),
      harga_jual: parseDecimal(form.harga_jual),
      stok_minimum: parseInteger(form.stok_minimum),
    };

    try {
      if (initial) {
        await updateObat.mutateAsync({ id: initial.id, ...payload });
        notify('Data obat diperbarui.');
      } else {
        const result = await createObat.mutateAsync(payload);
        notify(`Obat ${result.kode_obat} ditambahkan.`);
      }
      onSaved();
    } catch (error) {
      const fieldErrors = serverFieldErrors(error);
      setErrors(fieldErrors);
      setFormError(error.message || 'Data obat tidak dapat disimpan.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Ubah obat' : 'Tambah obat'}
      description={
        initial
          ? `Kode obat ${initial.kode_obat}.`
          : 'Kode obat dibuat otomatis saat data disimpan.'
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="obat-form" loading={saving}>
            Simpan
          </Button>
        </>
      }
    >
      <form id="obat-form" className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
        {formError ? (
          <p role="alert" className="text-small text-danger sm:col-span-2">
            {formError}
          </p>
        ) : null}

        <Field
          label="Nama obat"
          htmlFor="nama_obat"
          required
          error={errors.nama_obat}
          className="sm:col-span-2"
        >
          <Input
            id="nama_obat"
            value={form.nama_obat}
            onChange={update('nama_obat')}
            invalid={Boolean(errors.nama_obat)}
            maxLength={150}
            placeholder="Contoh: Paracetamol 500 mg"
          />
        </Field>

        <Field label="Jenis" htmlFor="jenis" required error={errors.jenis}>
          <Select id="jenis" value={form.jenis} onChange={update('jenis')}>
            <option value="jadi">Obat jadi</option>
            <option value="bahan_racikan">Bahan racikan</option>
          </Select>
        </Field>

        <Field label="Satuan" htmlFor="satuan" required error={errors.satuan}>
          <Input
            id="satuan"
            value={form.satuan}
            onChange={update('satuan')}
            invalid={Boolean(errors.satuan)}
            maxLength={30}
            placeholder="tablet, kapsul, botol, tube, gram"
          />
        </Field>

        <Field
          label="Harga jual"
          htmlFor="harga_jual"
          required
          error={errors.harga_jual}
          hint="Tanpa pemisah ribuan. Maksimal 2 angka desimal."
        >
          <Input
            id="harga_jual"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={form.harga_jual}
            onChange={update('harga_jual')}
            invalid={Boolean(errors.harga_jual)}
            placeholder="1500"
            className="nums"
          />
        </Field>

        <Field
          label="Stok minimum"
          htmlFor="stok_minimum"
          required
          error={errors.stok_minimum}
          hint="Nilai 0 berarti peringatan stok tidak pernah muncul."
        >
          <Input
            id="stok_minimum"
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={form.stok_minimum}
            onChange={update('stok_minimum')}
            invalid={Boolean(errors.stok_minimum)}
            placeholder="50"
            className="nums"
          />
        </Field>
      </form>
    </Modal>
  );
}

export default function ObatListPage() {
  usePageMeta('Obat');
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } = useObatList(page);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;

  useEffect(() => {
    if (data && page > data.last_page) {
      setPage(data.last_page);
    }
  }, [data, page]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (obat) => {
    setEditing(obat);
    setModalOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Daftar Obat"
        description="Kelola data obat jadi dan bahan racikan."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Tambah obat
          </Button>
        }
      />

      {isLoading ? (
        <LoadingState rows={8} label="Memuat daftar obat" />
      ) : isError ? (
        <ErrorState message={error?.message} onRetry={refetch} />
      ) : (
        <Panel className="overflow-hidden">
          <PanelHeader
            icon={Pill}
            title="Daftar obat"
            description="Data obat jadi dan bahan racikan yang terdaftar."
            actions={<Badge variant="neutral">{formatNumber(total)} obat</Badge>}
          />
          {total === 0 ? (
            <EmptyState
              title="Belum ada obat"
              description="Tambahkan obat pertama agar batch dan penjualan dapat dicatat."
              action={<Button onClick={openAdd}>Tambah obat</Button>}
            />
          ) : (
            <>
              <Table minWidth="900px">
                <THead>
                  <TR height="compact">
                    <TH>Kode</TH>
                    <TH>Nama obat</TH>
                    <TH>Jenis</TH>
                    <TH>Satuan</TH>
                    <TH align="right">Harga jual</TH>
                    <TH align="right">Stok minimum</TH>
                    <TH align="right">Aksi</TH>
                  </TR>
                </THead>
                <TBody>
                  {rows.map((obat) => (
                    <TR key={obat.id}>
                      <TD numeric className="whitespace-nowrap text-muted">
                        {obat.kode_obat}
                      </TD>
                      <TD>
                        <Link
                          to={`/obat/${obat.id}`}
                          className="font-medium text-ink hover:text-brand-700 hover:underline"
                        >
                          {obat.nama_obat}
                        </Link>
                      </TD>
                      <TD>
                        <Badge variant={obat.jenis === 'jadi' ? 'brand' : 'neutral'}>
                          {JENIS_OBAT_LABEL[obat.jenis]}
                        </Badge>
                      </TD>
                      <TD>{obat.satuan}</TD>
                      <TD align="right" numeric>
                        {formatRupiah(obat.harga_jual)}
                      </TD>
                      <TD align="right" numeric>
                        {formatNumber(obat.stok_minimum)}
                      </TD>
                      <TD align="right">
                        <Button variant="secondary" size="sm" onClick={() => openEdit(obat)}>
                          <Pencil className="h-4 w-4" aria-hidden="true" />
                          Ubah
                          <span className="sr-only"> {obat.nama_obat}</span>
                        </Button>
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

      <ObatFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSaved={() => setModalOpen(false)}
      />
    </>
  );
}
