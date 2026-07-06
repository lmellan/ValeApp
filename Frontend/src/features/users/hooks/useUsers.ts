import { useEffect, useMemo, useState } from 'react';
import { User } from '../../../shared/types/api';
import { TipoComensal } from '../../tiposComensal/types';
import { getTiposComensal } from '../../tiposComensal/services/tiposComensalService';
import { crearUsuario, getUsers, updateUsuario } from '../services/usersService';
import { createEmptyUserDraft, UserDraft, UserFilters } from '../types';

const initialFilters: UserFilters = {
  query: '',
  role: 'Todos',
  comensal: 'Todos'
};

const validateUserDraft = (draft: UserDraft) => {
  if (!draft.nombre.trim()) return 'El nombre completo es obligatorio.';
  if (!draft.correo.trim()) return 'El correo electronico es obligatorio.';
  if (!draft.correo.includes('@')) return 'Ingresa un correo electronico valido.';
  if (!draft.rol) return 'Selecciona el tipo de usuario.';

  if (draft.rol === 'Funcionario') {
    if (!draft.tipo_comensal) return 'Selecciona el tipo de comensal del funcionario.';
    if (!draft.turno) return 'Selecciona el turno asignado del funcionario.';
  }
  if (!draft.id && !draft.contrasena) return 'La contrasena inicial es obligatoria para crear un usuario.';

  return null;
};

const toPayload = (draft: UserDraft) => {
  const isFuncionario = draft.rol === 'Funcionario';
  const payload: Partial<User> = {
    nombre: draft.nombre.trim(),
    correo: draft.correo.trim(),
    codigo: !draft.id && draft.autoGenerateCodigo !== false ? undefined : draft.codigo?.trim() || undefined,
    rol: draft.rol,
    activo: draft.activo,
    id_tipo_comensal: isFuncionario ? draft.id_tipo_comensal : null,
    tipo_comensal: isFuncionario ? draft.tipo_comensal : '',
    turno: isFuncionario ? draft.turno : ''
  };

  if (!draft.id) {
    payload.contrasena = draft.contrasena;
    if (draft.autoGenerateCodigo !== false) delete payload.codigo;
  }

  return payload;
};

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [tiposComensal, setTiposComensal] = useState<TipoComensal[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [editingUser, setEditingUser] = useState<UserDraft | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadInitialData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [usersData, tiposData] = await Promise.all([getUsers(), getTiposComensal()]);
        if (!mounted) return;

        setUsers(usersData || []);
        setTiposComensal(tiposData || []);
      } catch (err: any) {
        if (mounted) setError(err?.response?.data?.error || err?.message || 'Error al obtener usuarios');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return users.filter((user) => {
      if (filters.role !== 'Todos' && user.rol !== filters.role) return false;
      if (filters.comensal !== 'Todos' && (user.tipo_comensal || 'No aplica') !== filters.comensal) return false;
      if (!query) return true;

      return (
        user.nombre?.toLowerCase().includes(query) ||
        user.correo?.toLowerCase().includes(query) ||
        String(user.codigo || '').toLowerCase().includes(query)
      );
    });
  }, [filters, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const updateFilters = (nextFilters: Partial<UserFilters>) => {
    setFilters((current) => ({ ...current, ...nextFilters }));
    setPage(1);
  };

  const openCreate = () => {
    setError(null);
    setSuccess(null);
    setEditingUser(createEmptyUserDraft());
  };

  const openEdit = (user: User) => {
    setError(null);
    setSuccess(null);
    setEditingUser({ ...user });
  };

  const closeEditor = () => setEditingUser(null);

  const saveUser = async (draft: UserDraft) => {
    setError(null);
    setSuccess(null);

    const validationError = validateUserDraft(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const payload = toPayload(draft);

      if (draft.id && draft.id > 0) {
        const updated = await updateUsuario(draft.id, payload);
        setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
        setSuccess('Usuario actualizado correctamente.');
      } else {
        const created = await crearUsuario(payload);
        setUsers((current) => [created, ...current]);
        setSuccess('Usuario creado correctamente.');
      }

      setEditingUser(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Error al guardar usuario');
    } finally {
      setSaving(false);
    }
  };

  return {
    users,
    tiposComensal,
    filteredUsers,
    currentUsers,
    loading,
    saving,
    error,
    success,
    filters,
    page,
    pageSize,
    totalPages,
    editingUser,
    setPage,
    setPageSize,
    updateFilters,
    openCreate,
    openEdit,
    closeEditor,
    saveUser
  };
};

