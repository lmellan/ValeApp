import { useEffect, useMemo, useState } from 'react';
import { createTipoComensal, getTiposComensal, updateTipoComensal } from '../services/tiposComensalService';
import { TipoComensal, TipoComensalPayload } from '../types';

const emptyDraft: TipoComensalPayload = {
  nombre: '',
  descripcion: '',
  emisionMultiple: false,
  color: '#0ea5e9'
};

const validate = (draft: TipoComensalPayload) => {
  if (!draft.nombre.trim()) return 'El nombre del tipo de comensal es obligatorio.';
  return null;
};

const normalize = (draft: TipoComensalPayload): TipoComensalPayload => ({
  nombre: draft.nombre.trim(),
  descripcion: draft.descripcion?.trim() || null,
  emisionMultiple: Boolean(draft.emisionMultiple),
  color: draft.color || '#0ea5e9'
});

export const useTiposComensal = () => {
  const [tipos, setTipos] = useState<TipoComensal[]>([]);
  const [createDraft, setCreateDraft] = useState<TipoComensalPayload>(emptyDraft);
  const [editing, setEditing] = useState<TipoComensal | null>(null);
  const [editDraft, setEditDraft] = useState<TipoComensalPayload>(emptyDraft);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadTipos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTiposComensal();
      setTipos(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'No se pudieron cargar los tipos de comensal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTipos();
  }, []);

  const filteredTipos = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return tipos;

    return tipos.filter((tipo) =>
      tipo.nombre.toLowerCase().includes(normalizedQuery) ||
      (tipo.descripcion || '').toLowerCase().includes(normalizedQuery)
    );
  }, [query, tipos]);

  const totalPages = Math.max(1, Math.ceil(filteredTipos.length / pageSize));
  const currentTipos = filteredTipos.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setPage(1);
  };

  const updatePageSize = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const updateCreateDraft = (changes: Partial<TipoComensalPayload>) => {
    setCreateDraft((current) => ({ ...current, ...changes }));
  };

  const openEdit = (tipo: TipoComensal) => {
    setError(null);
    setSuccess(null);
    setEditing(tipo);
    setEditDraft({
      nombre: tipo.nombre,
      descripcion: tipo.descripcion || '',
      emisionMultiple: tipo.emisionMultiple,
      color: tipo.color || '#0ea5e9'
    });
  };

  const closeEdit = () => setEditing(null);

  const updateEditDraft = (changes: Partial<TipoComensalPayload>) => {
    setEditDraft((current) => ({ ...current, ...changes }));
  };

  const createTipo = async () => {
    setError(null);
    setSuccess(null);
    const validation = validate(createDraft);
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    try {
      await createTipoComensal(normalize(createDraft));
      setCreateDraft(emptyDraft);
      setSuccess('Tipo de comensal creado correctamente.');
      await loadTipos();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'No se pudo crear el tipo de comensal.');
    } finally {
      setSaving(false);
    }
  };

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
      const updated = await updateTipoComensal(editing.idTipoComensal, normalize(editDraft));
      setTipos((current) => current.map((tipo) => (tipo.idTipoComensal === updated.idTipoComensal ? updated : tipo)));
      setSuccess('Tipo de comensal actualizado correctamente.');
      setEditing(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'No se pudo actualizar el tipo de comensal.');
    } finally {
      setSaving(false);
    }
  };

  const resetCreate = () => setCreateDraft(emptyDraft);

  return {
    tipos,
    filteredTipos,
    currentTipos,
    createDraft,
    editDraft,
    editing,
    query,
    page,
    pageSize,
    totalPages,
    loading,
    saving,
    error,
    success,
    setPage,
    updatePageSize,
    updateQuery,
    updateCreateDraft,
    updateEditDraft,
    createTipo,
    openEdit,
    closeEdit,
    saveEdit,
    resetCreate
  };
};
