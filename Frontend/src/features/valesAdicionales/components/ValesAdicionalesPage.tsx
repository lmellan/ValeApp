import ValeAdicionalFiltersPanel from './ValeAdicionalFilters';
import ValeAdicionalForm from './ValeAdicionalForm';
import ValesAdicionalesTable from './ValesAdicionalesTable';
import { useValesAdicionales } from '../hooks/useValesAdicionales';

const ValesAdicionalesPage = () => {
  const {
    currentVales,
    usuarios,
    usuariosAsignables,
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
  } = useValesAdicionales();

  const selectedUsuario = editing ? usuarios.find((usuario) => usuario.id === editing.idFuncionario) : null;
  const selectedServicio = editing ? serviciosAdicionales.find((servicio) => servicio.idServicio === editing.idServicio) : null;

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-lg text-slate-700 shadow-sm">
        Cargando vales adicionales...
      </div>
    );
  }

  return (
    <div className="space-y-8">
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

      <section className="bg-surface-light rounded-3xl border border-slate-200 shadow-card p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-primary mb-2">Vales adicionales</h1>
            <p className="max-w-3xl text-lg text-slate-600">
              Administra asignaciones excepcionales para funcionarios. La cantidad se define al crear la asignacion solo si el tipo de comensal permite emision multiple.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="h-14 rounded-2xl bg-primary px-6 text-white text-base font-extrabold hover:bg-blue-800 transition flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined text-[20px]">add_card</span>
            Crear asignacion
          </button>
        </div>

        <ValeAdicionalFiltersPanel filters={filters} servicios={serviciosAdicionales} onChange={updateFilters} />
      </section>

      <ValesAdicionalesTable
        vales={currentVales}
        usuarios={usuarios}
        servicios={serviciosAdicionales}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onEdit={openEdit}
        onPageChange={setPage}
        onPageSizeChange={updatePageSize}
      />

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/50 px-4 py-8">
          <section className="flex max-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col bg-surface-light rounded-3xl border border-slate-200 shadow-strong overflow-hidden">
            <div className="shrink-0 p-8 border-b border-slate-200 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div>
                <h1 className="text-4xl font-extrabold text-primary mb-2">Crear asignacion</h1>
                <p className="text-lg text-slate-600">Selecciona funcionario, servicio adicional, fecha o periodo de uso y motivo.</p>
              </div>
              <button
                type="button"
                onClick={closeCreate}
                className="h-12 w-12 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-primary transition flex items-center justify-center"
                aria-label="Cerrar formulario"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto"><ValeAdicionalForm
              draft={createDraft}
              usuarios={usuariosAsignables}
              tiposComensal={tiposComensal}
              servicios={serviciosAdicionales}
              saving={saving}
              submitLabel="Guardar asignacion"
              showHeader={false}
              onChange={updateCreateDraft}
              onSubmit={createNewVale}
              onReset={resetCreate}
            />

            <div className="px-8 pb-8">
              <button
                type="button"
                onClick={closeCreate}
                className="w-full h-14 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-lg font-bold transition"
              >
                Cancelar
              </button>
            </div>
            </div>
          </section>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/50 px-4 py-8">
          <section className="flex max-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col bg-surface-light rounded-3xl border border-slate-200 shadow-strong overflow-hidden">
            <div className="shrink-0 p-8 border-b border-slate-200 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div>
                <h1 className="text-4xl font-extrabold text-primary mb-2">Editar asignacion</h1>
                <p className="text-lg text-slate-600">Modifica la fecha, el servicio adicional o el motivo. El horario lo define el servicio.</p>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-1">Asignacion seleccionada</p>
                  <p className="text-2xl font-extrabold text-primary">{selectedUsuario?.nombre || editing.idFuncionario}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{selectedServicio?.nombre || editing.idServicio} - {editing.fechaUso}</p>
                </div>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="h-12 w-12 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-primary transition flex items-center justify-center"
                  aria-label="Cerrar formulario"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto"><ValeAdicionalForm
              draft={editDraft}
              usuarios={usuariosAsignables}
              tiposComensal={tiposComensal}
              servicios={serviciosAdicionales}
              saving={saving}
              submitLabel="Guardar cambios"
              showHeader={false}
              onChange={updateEditDraft}
              onSubmit={saveEdit}
              allowCantidad={false}
            />

            <div className="px-8 pb-8">
              <button
                type="button"
                onClick={closeEdit}
                className="w-full h-14 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-lg font-bold transition"
              >
                Cancelar
              </button>
            </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ValesAdicionalesPage;




