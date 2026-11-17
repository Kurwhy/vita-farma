export function availableBatches(obatId, batches) {
  return batches
    .filter(
      (batch) =>
        batch.obat_id === obatId &&
        (batch.status === undefined || batch.status === 'tersedia') &&
        Number(batch.qty) > 0,
    )
    .sort((a, b) => {
      const byDate = a.tanggal_expired.localeCompare(b.tanggal_expired);
      if (byDate !== 0) return byDate;
      return a.id - b.id;
    });
}

export function allocateFEFO(obatId, jumlah, batches) {
  const ordered = availableBatches(obatId, batches);
  const available = ordered.reduce((sum, batch) => sum + Number(batch.qty), 0);

  if (jumlah < 1) {
    return { ok: false, available, allocations: [], message: 'Jumlah minimal 1.' };
  }

  if (available < jumlah) {
    return {
      ok: false,
      available,
      allocations: [],
      message: 'Stok siap jual tidak mencukupi.',
    };
  }

  let remaining = jumlah;
  const allocations = [];

  for (const batch of ordered) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, Number(batch.qty));
    if (take > 0) {
      allocations.push({ batch, qty: take });
      remaining -= take;
    }
  }

  return { ok: true, available, allocations, message: '' };
}

export function allocateMany(lines, batches) {
  const results = [];

  for (const line of lines) {
    const result = allocateFEFO(line.obat_id, line.jumlah, batches);

    if (!result.ok) {
      return {
        ok: false,
        message: result.message,
        gagal: { ...line, available: result.available },
        lines: results,
      };
    }

    results.push({ ...line, allocations: result.allocations });
  }

  return { ok: true, lines: results, message: '' };
}
