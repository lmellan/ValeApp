import UserFiltersPanel from './UserFilters';
import UserFormPanel from './UserFormPanel';
import UserStats from './UserStats';
import UsersTable from './UsersTable';
import { useUsers } from '../hooks/useUsers';

const UsersPage = () => {
  const {
    users,
    tiposComensal,
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
  } = useUsers();

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-lg text-slate-700 shadow-sm">
        Cargando usuarios...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {editingUser && <UserFormPanel user={editingUser} saving={saving} tiposComensal={tiposComensal} onCancel={closeEditor} onSave={saveUser} />}

      <section className="bg-surface-light rounded-3xl border border-slate-200 shadow-card p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-primary mb-2">Listado de usuarios</h2>
            <p className="text-lg text-slate-600">Busca por nombre o codigo y filtra segun el tipo de usuario o tipo de comensal.</p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="h-16 px-8 rounded-2xl bg-primary text-white text-lg font-extrabold transition hover:bg-blue-800 active:scale-[0.98] flex items-center justify-center gap-3 shrink-0"
          >
            <span className="material-symbols-outlined">person_add</span>
            Crear usuario
          </button>
        </div>

        <UserFiltersPanel filters={filters} tiposComensal={tiposComensal} onChange={updateFilters} />
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700 flex items-start gap-3">
          <span className="material-symbols-outlined text-[20px]">error</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700 flex items-start gap-3">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{success}</span>
        </div>
      )}

      {users.length === 0 && !error ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-lg text-slate-700 shadow-sm">
          No hay usuarios registrados.
        </div>
      ) : (
        <UsersTable users={currentUsers} tiposComensal={tiposComensal} page={page} totalPages={totalPages} pageSize={pageSize} onEdit={openEdit} onPageChange={setPage} onPageSizeChange={setPageSize} />
      )}

      <UserStats users={users} />
    </div>
  );
};

export default UsersPage;



