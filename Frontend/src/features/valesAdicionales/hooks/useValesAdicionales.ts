import { useEffect, useMemo, useState } from 'react';
import { User } from '../../../shared/types/api';
import { ServicioAlimentacion } from '../../servicios/types';
import { getUsers } from '../../users/services/usersService';
import { getServicios } from '../../servicios/services/serviciosService';
import { getTiposComensal } from '../../tiposComensal/services/tiposComensalService';
import { TipoComensal } from '../../tiposComensal/types';
import { createValeAdicional, getValesAdicionales, updateValeAdicional } from '../services/valesAdicionalesService';
import { createEmptyValeAdicionalDraft, ValeAdicional, ValeAdicionalFilters, ValeAdicionalPayload } from '../types';

const initialFilters: ValeAdicionalFilters = {
  query: '',
  servicio: 'Todos',
  estado: 'Todos'
};

const getTodayInput = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};

const toDateInput = (value?: string | null) => value ? value.slice(0, 10) : '';
const toTimeInput = (value?: string | null) => value ? value.slice(0, 5) : '';

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const getMonthEnd = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

const getFechaFinByPeriodo = (fechaUso: string, periodoUso: ValeAdicionalPayload['periodoUso'] = 'dia') => {
  const base = new Date(`${fechaUso}T00:00:00`);
  if (Number.isNaN(base.getTime())) return fechaUso;
  if (periodoUso === 'semana') return addDays(base, 6).toISOString().slice(0, 10);
  if (periodoUso === 'mes') return getMonthEnd(base).toISOString().slice(0, 10);
  return fechaUso;
};

const normalizeVale = (vale: ValeAdicional): ValeAdicional => ({
  ...vale,
  fechaUso: toDateInput(vale.fechaUso),
  fechaExpiracion: toDateInput(vale.fechaExpiracion),
  horaInicioValidez: toTimeInput(vale.horaInicioValidez),
  horaFinValidez: toTimeInput(vale.horaFinValidez)
});

const normalizePayload = (draft: ValeAdicionalPayload, idVale?: string): ValeAdicionalPayload => ({
  idVale,
  idFuncionario: Number(draft.idFuncionario),
  idServicio: Number(draft.idServicio),
  fechaUso: draft.fechaUso,
  fechaExpiracion: draft.fechaExpiracion || draft.fechaUso,
  periodoUso: draft.periodoUso || 'dia',
  motivo: draft.motivo.trim(),
  cantidadVales: Math.max(1, Number(draft.cantidadVales || 1))
});

const toDraft = (vale: ValeAdicional): ValeAdicionalPayload => ({
  idFuncionario: vale.idFuncionario,
  idServicio: vale.idServicio,
  fechaUso: vale.fechaUso,
  fechaExpiracion: vale.fechaExpiracion || vale.fechaUso,
  periodoUso: 'dia',
  motivo: vale.motivo || '',
  cantidadVales: 1
});

const generateValeId = () => {
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ADM-${Date.now()}-${random}`;
};

const validate = (draft: ValeAdicionalPayload) => {
  if (!draft.idFuncionario) return 'Selecciona un funcionario.';
  if (!draft.idServicio) return 'Selecciona un servicio adicional.';
  if (!draft.fechaUso) return 'Selecciona la fecha de uso.';
  if (draft.fechaUso < getTodayInput()) return 'La fecha de uso no puede ser anterior a hoy.';
  if (draft.fechaExpiracion && draft.fechaExpiracion < draft.fechaUso) return 'La fecha final no puede ser anterior a la fecha de uso.';
  if (!draft.cantidadVales || Number(draft.cantidadVales) < 1) return 'La cantidad de vales debe ser al menos 1.';
  return null;
};

export const useValesAdicionales = () => {
  const [vales, setVales] = useState<ValeAdicional[]>([]);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [servicios, setServicios] = useState<ServicioAlimentacion[]>([]);
  const [tiposComensal, setTiposComensal] = useState<TipoComensal[]>([]);
  const [createDraft, setCreateDraft] = useState<ValeAdicionalPayload>(createEmptyValeAdicionalDraft());
  const [editDraft, setEditDraft] = useState<ValeAdicionalPayload>(createEmptyValeAdicionalDraft());
  const [editing, setEditing] = useState<ValeAdicional | null>(null);
  const [filters, setFilters] = useState<ValeAdicionalFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const usuariosAsignables = usuarios;
  const serviciosAdicionales = useMemo(() => servicios.filter((servicio) => (servicio.categoria || '').toLowerCase() === 'adicional' && servicio.activo), [servicios]);

  const resetCreateWithServicios = (serviciosDisponibles: ServicioAlimentacion[] = serviciosAdicionales) => {
    const base = createEmptyValeAdicionalDraft();
    const firstServicio = serviciosDisponibles[0];
    setCreateDraft({
      ...base,
      idFuncionario: '',
      idServicio: firstServicio?.idServicio || '',
      fechaExpiracion: getFechaFinByPeriodo(base.fechaUso, base.periodoUso)
    });
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [valesData, usuariosData, serviciosData, tiposData] = await Promise.all([getValesAdicionales(), getUsers(), getServicios(), getTiposComensal()]);
      const normalizedVales = (valesData || []).map(normalizeVale);
      const adicionales = (serviciosData || []).filter((servicio) => (servicio.categoria || '').toLowerCase() === 'adicional' && servicio.activo);
      setVales(normalizedVales);
      setUsuarios(usuariosData || []);
      setServicios(serviciosData || []);
      setTiposComensal(tiposData || []);
      setCreateDraft((current) => ({ ...current, idFuncionario: current.idFuncionario || '', idServicio: current.idServicio || adicionales[0]?.idServicio || '' }));
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'No se pudieron cargar los vales adicionales.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFuncionario = (idFuncionario: number) => usuarios.find((usuario) => usuario.id === idFuncionario);
  const getServicio = (idServicio: number) => servicios.find((servicio) => servicio.idServicio === idServicio);

  const filteredVales = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return vales.filter((vale) => {
      const funcionario = getFuncionario(vale.idFuncionario);
      const servicio = getServicio(vale.idServicio);
      const estado = vale.expirado ? 'Expirado' : vale.estadoUso === 'UTILIZADO' ? 'Utilizado' : 'Disponible';
      if (filters.servicio !== 'Todos' && String(vale.idServicio) !== filters.servicio) return false;
      if (filters.estado !== 'Todos' && estado !== filters.estado) return false;
      if (!query) return true;
      return vale.idVale.toLowerCase().includes(query) || (funcionario?.nombre || '').toLowerCase().includes(query) || (funcionario?.codigo || '').toLowerCase().includes(query) || (servicio?.nombre || '').toLowerCase().includes(query) || (vale.motivo || '').toLowerCase().includes(query);
    });
  }, [filters, servicios, usuarios, vales]);

  const totalPages = Math.max(1, Math.ceil(filteredVales.length / pageSize));
  const currentVales = filteredVales.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const applyDateRange = (draft: ValeAdicionalPayload, changes: Partial<ValeAdicionalPayload>) => {
    const next = { ...draft, ...changes };
    if (changes.fechaUso || changes.periodoUso) {
      next.fechaExpiracion = getFechaFinByPeriodo(next.fechaUso, next.periodoUso || 'dia');
    }
    if (changes.idFuncionario) next.cantidadVales = 1;
    return next;
  };

  const updateCreateDraft = (changes: Partial<ValeAdicionalPayload>) => setCreateDraft((current) => applyDateRange(current, changes));
  const updateEditDraft = (changes: Partial<ValeAdicionalPayload>) => setEditDraft((current) => applyDateRange(current, changes));

  const updateFilters = (changes: Partial<ValeAdicionalFilters>) => {
    setFilters((current) => ({ ...current, ...changes }));
    setPage(1);
  };

  const updatePageSize = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const resetCreate = () => resetCreateWithServicios();

  const openCreate = () => {
    setError(null);
    setSuccess(null);
    resetCreate();
    setShowCreate(true);
  };

  const closeCreate = () => setShowCreate(false);

  const createNewVale = async () => {
    setError(null);
    setSuccess(null);
    const validation = validate(createDraft);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    try {
      await createValeAdicional(normalizePayload(createDraft, generateValeId()));
      setSuccess('Vale adicional creado correctamente.');
      setShowCreate(false);
      resetCreate();
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'No se pudo crear el vale adicional.');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (vale: ValeAdicional) => {
    setError(null);
    setSuccess(null);
    setEditing(vale);
    setEditDraft(toDraft(vale));
  };

  const closeEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    setError(null);
    setSuccess(null);
    const validation = validate(editDraft);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    try {
      const updated = normalizeVale(await updateValeAdicional(editing.idVale, normalizePayload(editDraft)));
      setVales((current) => current.map((vale) => (vale.idVale === updated.idVale ? updated : vale)));
      setSuccess('Vale adicional actualizado correctamente.');
      setEditing(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'No se pudo actualizar el vale adicional.');
    } finally {
      setSaving(false);
    }
  };

  return {
    vales,
    filteredVales,
    currentVales,
    usuarios,
    usuariosAsignables,
    servicios,
    serviciosAdicionales,
    tiposComensal,
    createDraft,
    editDraft,
    editing,
    showCreate,
    filters,
    page,
    pageSize,
    totalPages,
    loading,
    saving,
    error,
    success,
    getFuncionario,
    getServicio,
    setPage,
    updatePageSize,
    updateCreateDraft,
    updateEditDraft,
    updateFilters,
    createNewVale,
    openCreate,
    closeCreate,
    openEdit,
    closeEdit,
    saveEdit,
    resetCreate
  };
};