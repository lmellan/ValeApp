import { useEffect, useMemo, useState } from 'react';
import { TipoComensal } from '../../tiposComensal/types';
import { ServicioAlimentacion } from '../../servicios/types';
import { getTiposComensal } from '../../tiposComensal/services/tiposComensalService';
import { getServicios } from '../../servicios/services/serviciosService';
import { getValorizacionesVale, saveValorizacionVale } from '../services/valorizacionValesService';
import { createEmptyValorizacionDraft, ValorizacionFilters, ValorizacionVale, ValorizacionValePayload } from '../types';

const initialFilters: ValorizacionFilters = {
  query: '',
  tipo: 'Todos',
  servicio: 'Todos'
};

const toDraft = (valorizacion: ValorizacionVale): ValorizacionValePayload => ({
  idTipoComensal: valorizacion.idTipoComensal,
  idServicio: valorizacion.idServicio,
  valor: valorizacion.valor
});

export const useValorizacionVales = () => {
  const [valorizaciones, setValorizaciones] = useState<ValorizacionVale[]>([]);
  const [tiposComensal, setTiposComensal] = useState<TipoComensal[]>([]);
  const [servicios, setServicios] = useState<ServicioAlimentacion[]>([]);
  const [createDraft, setCreateDraft] = useState<ValorizacionValePayload>(createEmptyValorizacionDraft());
  const [editDraft, setEditDraft] = useState<ValorizacionValePayload>(createEmptyValorizacionDraft());
  const [editing, setEditing] = useState<ValorizacionVale | null>(null);
  const [filters, setFilters] = useState<ValorizacionFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const baseDraft = (tipos: TipoComensal[] = tiposComensal, items: ServicioAlimentacion[] = servicios): ValorizacionValePayload => ({
    ...createEmptyValorizacionDraft(),
    idTipoComensal: tipos[0]?.idTipoComensal || '',
    idServicio: items[0]?.idServicio || ''
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [valorizacionesData, tiposData, serviciosData] = await Promise.all([getValorizacionesVale(), getTiposComensal(), getServicios()]);
      setValorizaciones(valorizacionesData || []);
      setTiposComensal(tiposData || []);
      setServicios(serviciosData || []);
      setCreateDraft((current) => ({
        ...current,
        idTipoComensal: current.idTipoComensal || tiposData[0]?.idTipoComensal || '',
        idServicio: current.idServicio || serviciosData[0]?.idServicio || ''
      }));
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'No se pudo cargar la valorizacion de vales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getTipo = (idTipoComensal: number) => tiposComensal.find((tipo) => tipo.idTipoComensal === idTipoComensal);
  const getServicio = (idServicio: number) => servicios.find((servicio) => servicio.idServicio === idServicio);

  const findDuplicate = (draft: ValorizacionValePayload, editingId?: number) => valorizaciones.find((item) =>
    item.idTipoComensal === Number(draft.idTipoComensal) &&
    item.idServicio === Number(draft.idServicio) &&
    item.idValorizacion !== editingId
  );

  const validate = (draft: ValorizacionValePayload, editingId?: number) => {
    if (!draft.idTipoComensal) return 'Selecciona el tipo de comensal.';
    if (!draft.idServicio) return 'Selecciona el servicio.';
    if (draft.valor === '' || Number(draft.valor) < 0) return 'Ingresa un valor valido.';
    if (findDuplicate(draft, editingId)) return 'Ya existe una valorizacion para ese tipo de comensal y servicio.';
    return null;
  };

  const filteredValorizaciones = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return valorizaciones.filter((item) => {
      const tipo = getTipo(item.idTipoComensal);
      const servicio = getServicio(item.idServicio);
      if (filters.tipo !== 'Todos' && String(item.idTipoComensal) !== filters.tipo) return false;
      if (filters.servicio !== 'Todos' && String(item.idServicio) !== filters.servicio) return false;
      if (!query) return true;
      return (
        (tipo?.nombre || '').toLowerCase().includes(query) ||
        (servicio?.nombre || '').toLowerCase().includes(query) ||
        String(item.valor).includes(query)
      );
    });
  }, [filters, servicios, tiposComensal, valorizaciones]);

  const totalPages = Math.max(1, Math.ceil(filteredValorizaciones.length / pageSize));
  const currentValorizaciones = filteredValorizaciones.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const updateCreateDraft = (changes: Partial<ValorizacionValePayload>) => setCreateDraft((current) => ({ ...current, ...changes }));
  const updateEditDraft = (changes: Partial<ValorizacionValePayload>) => setEditDraft((current) => ({ ...current, ...changes }));

  const updateFilters = (changes: Partial<ValorizacionFilters>) => {
    setFilters((current) => ({ ...current, ...changes }));
    setPage(1);
  };

  const updatePageSize = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const resetCreate = () => setCreateDraft(baseDraft());

  const openEdit = (valorizacion: ValorizacionVale) => {
    setError(null);
    setSuccess(null);
    setEditing(valorizacion);
    setEditDraft(toDraft(valorizacion));
  };

  const closeEdit = () => {
    setEditing(null);
    setEditDraft(createEmptyValorizacionDraft());
  };

  const persist = async (draft: ValorizacionValePayload) => {
    const saved = await saveValorizacionVale({
      ...draft,
      idTipoComensal: Number(draft.idTipoComensal),
      idServicio: Number(draft.idServicio),
      valor: Number(draft.valor)
    });

    setValorizaciones((current) => {
      const exists = current.some((item) => item.idValorizacion === saved.idValorizacion);
      if (exists) return current.map((item) => (item.idValorizacion === saved.idValorizacion ? saved : item));
      return [...current, saved];
    });

    return saved;
  };

  const createValorizacion = async () => {
    setError(null);
    setSuccess(null);
    const validation = validate(createDraft);
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    try {
      await persist(createDraft);
      setSuccess('Valorizacion creada correctamente.');
      resetCreate();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'No se pudo crear la valorizacion.');
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setError(null);
    setSuccess(null);
    const validation = validate(editDraft, editing.idValorizacion);
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    try {
      await persist(editDraft);
      setSuccess('Valorizacion actualizada correctamente.');
      closeEdit();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'No se pudo actualizar la valorizacion.');
    } finally {
      setSaving(false);
    }
  };

  return {
    valorizaciones,
    filteredValorizaciones,
    currentValorizaciones,
    tiposComensal,
    servicios,
    createDraft,
    editDraft,
    editing,
    filters,
    page,
    pageSize,
    totalPages,
    loading,
    saving,
    error,
    success,
    getTipo,
    getServicio,
    setPage,
    updatePageSize,
    updateCreateDraft,
    updateEditDraft,
    updateFilters,
    createValorizacion,
    saveEdit,
    resetCreate,
    openEdit,
    closeEdit
  };
};