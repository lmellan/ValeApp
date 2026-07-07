import { useEffect, useMemo, useState } from 'react';
import { Casino, createEmptyServicioDraft, ServicioAlimentacion, ServicioFilters, ServicioPayload, Turno } from '../types';
import {
  agregarServicioATurno,
  createServicio,
  getCasinos,
  getServicios,
  getServiciosPorTurno,
  getTurnos,
  quitarServicioDeTurno,
  updateServicio,
} from '../services/serviciosService';

const initialFilters: ServicioFilters = {
  query: '',
  casino: 'Todos',
  categoria: 'Todos'
};

const validate = (draft: ServicioPayload, turnosSeleccionados: number[]) => {
  if (!draft.nombre.trim()) return 'El nombre del servicio es obligatorio.';
  if (!draft.idCasino) return 'Selecciona el casino o sucursal del servicio.';
  if (!draft.horaInicio || !draft.horaFin) return 'Define el horario de vigencia del servicio.';
  if (draft.horaInicio >= draft.horaFin) return 'La hora de inicio debe ser anterior a la hora de fin.';
  if (draft.categoria === 'Base' && turnosSeleccionados.length === 0)
    return 'Un servicio base debe estar asociado a al menos un turno.';
  return null;
};

const normalize = (draft: ServicioPayload) => ({
  nombre: draft.nombre.trim(),
  categoria: draft.categoria || 'Base',
  horaInicio: draft.horaInicio,
  horaFin: draft.horaFin,
  idCasino: Number(draft.idCasino),
  activo: true
});

const toDraft = (servicio: ServicioAlimentacion): ServicioPayload => ({
  nombre: servicio.nombre,
  categoria: servicio.categoria || 'Base',
  horaInicio: servicio.horaInicio,
  horaFin: servicio.horaFin,
  idCasino: servicio.idCasino
});

// Returns which idTurnos currently contain a given idServicio
const getTurnosActuales = (map: Record<number, number[]>, idServicio: number): number[] =>
  Object.entries(map)
    .filter(([, ids]) => ids.includes(idServicio))
    .map(([id]) => Number(id));

export const useServicios = () => {
  const [servicios, setServicios] = useState<ServicioAlimentacion[]>([]);
  const [casinos, setCasinos] = useState<Casino[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  // idTurno → array of idServicio currently associated
  const [turnoServiciosMap, setTurnoServiciosMap] = useState<Record<number, number[]>>({});

  const [createDraft, setCreateDraft] = useState<ServicioPayload>(createEmptyServicioDraft());
  const [turnosCreate, setTurnosCreate] = useState<number[]>([]);

  const [editing, setEditing] = useState<ServicioAlimentacion | null>(null);
  const [editDraft, setEditDraft] = useState<ServicioPayload>(createEmptyServicioDraft());
  const [turnosEdit, setTurnosEdit] = useState<number[]>([]);

  const [filters, setFilters] = useState<ServicioFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [serviciosData, casinosData, turnosData] = await Promise.all([
        getServicios(),
        getCasinos(),
        getTurnos(),
      ]);

      // Build map: idTurno → [idServicio]
      const serviciosPorTurno = await Promise.all(turnosData.map((t) => getServiciosPorTurno(t.idTurno)));
      const map: Record<number, number[]> = {};
      turnosData.forEach((t, i) => { map[t.idTurno] = serviciosPorTurno[i]; });

      setServicios(serviciosData || []);
      setCasinos(casinosData || []);
      setTurnos(turnosData || []);
      setTurnoServiciosMap(map);
      setCreateDraft((current) => ({ ...current, idCasino: current.idCasino || casinosData[0]?.idCasino || '' }));
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'No se pudieron cargar los servicios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredServicios = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return servicios.filter((servicio) => {
      const casino = casinos.find((item) => item.idCasino === servicio.idCasino);
      if (filters.casino !== 'Todos' && String(servicio.idCasino) !== filters.casino) return false;
      if (filters.categoria !== 'Todos' && (servicio.categoria || 'Base') !== filters.categoria) return false;
      if (!query) return true;
      return (
        servicio.nombre.toLowerCase().includes(query) ||
        (servicio.categoria || '').toLowerCase().includes(query) ||
        (casino?.nombre || '').toLowerCase().includes(query)
      );
    });
  }, [casinos, filters, servicios]);

  const totalPages = Math.max(1, Math.ceil(filteredServicios.length / pageSize));
  const currentServicios = filteredServicios.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const updateCreateDraft = (changes: Partial<ServicioPayload>) =>
    setCreateDraft((current) => ({ ...current, ...changes }));

  const updateEditDraft = (changes: Partial<ServicioPayload>) =>
    setEditDraft((current) => ({ ...current, ...changes }));

  const updateFilters = (changes: Partial<ServicioFilters>) => {
    setFilters((current) => ({ ...current, ...changes }));
    setPage(1);
  };

  const updatePageSize = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const resetCreate = () => {
    setCreateDraft({ ...createEmptyServicioDraft(), idCasino: casinos[0]?.idCasino || '' });
    setTurnosCreate([]);
  };

  const syncTurnos = async (
    idServicio: number,
    turnosNuevos: number[],
    map: Record<number, number[]>
  ) => {
    const actuales = getTurnosActuales(map, idServicio);
    const toAdd = turnosNuevos.filter((id) => !actuales.includes(id));
    const toRemove = actuales.filter((id) => !turnosNuevos.includes(id));
    await Promise.all([
      ...toAdd.map((id) => agregarServicioATurno(id, idServicio)),
      ...toRemove.map((id) => quitarServicioDeTurno(id, idServicio)),
    ]);
    setTurnoServiciosMap((prev) => {
      const next = { ...prev };
      turnosNuevos.forEach((id) => {
        next[id] = [...(next[id] || []).filter((s) => s !== idServicio), idServicio];
      });
      toRemove.forEach((id) => {
        next[id] = (next[id] || []).filter((s) => s !== idServicio);
      });
      return next;
    });
  };

  const createNewServicio = async () => {
    setError(null);
    setSuccess(null);
    const validation = validate(createDraft, turnosCreate);
    if (validation) { setError(validation); return; }

    setSaving(true);
    try {
      const idServicio = await createServicio(normalize(createDraft));
      await syncTurnos(idServicio, turnosCreate, turnoServiciosMap);
      resetCreate();
      setSuccess('Servicio creado correctamente.');
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'No se pudo crear el servicio.');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (servicio: ServicioAlimentacion) => {
    setError(null);
    setSuccess(null);
    setEditing(servicio);
    setEditDraft(toDraft(servicio));
    setTurnosEdit(getTurnosActuales(turnoServiciosMap, servicio.idServicio));
  };

  const closeEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    setError(null);
    setSuccess(null);
    const validation = validate(editDraft, turnosEdit);
    if (validation) { setError(validation); return; }

    setSaving(true);
    try {
      const updated = await updateServicio(editing.idServicio, normalize(editDraft));
      await syncTurnos(editing.idServicio, turnosEdit, turnoServiciosMap);
      setServicios((current) =>
        current.map((s) => (s.idServicio === updated.idServicio ? updated : s))
      );
      setSuccess('Servicio actualizado correctamente.');
      setEditing(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'No se pudo actualizar el servicio.');
    } finally {
      setSaving(false);
    }
  };

  return {
    servicios,
    filteredServicios,
    currentServicios,
    casinos,
    turnos,
    turnoServiciosMap,
    createDraft,
    turnosCreate,
    editDraft,
    turnosEdit,
    editing,
    filters,
    page,
    pageSize,
    totalPages,
    loading,
    saving,
    error,
    success,
    setPage,
    updatePageSize,
    updateCreateDraft,
    updateEditDraft,
    setTurnosCreate,
    setTurnosEdit,
    updateFilters,
    createNewServicio,
    openEdit,
    closeEdit,
    saveEdit,
    resetCreate,
  };
};
