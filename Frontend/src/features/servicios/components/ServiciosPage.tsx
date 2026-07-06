import ServicioFiltersPanel from './ServicioFilters';
import ServicioForm from './ServicioForm';
import ServiciosTable from './ServiciosTable';
import { useServicios } from '../hooks/useServicios';

const ServiciosPage = () => {
  const {
    servicios,
    filteredServicios,
    currentServicios,
    casinos,
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
    setPage,
    updatePageSize,
    updateCreateDraft,
    updateEditDraft,
    updateFilters,
    createNewServicio,
    openEdit,
    closeEdit,
    saveEdit,
    resetCreate
  } = useServicios();

  const editingCasino = editing ? casinos.find((casino) => casino.idCasino === editing.idCasino) : null;

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-lg text-slate-700 shadow-sm">
        Cargando servicios...
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          <section className="bg-surface-light rounded-3xl border border-slate-200 shadow-card p-8">
            <div>
              <h1 className="text-4xl font-extrabold text-primary mb-2">Servicios</h1>
              <p className="text-lg text-slate-600">
                Administra los servicios de alimentacion disponibles en el sistema, incluyendo servicios base y servicios adicionales.
              </p>
            </div>

            <ServicioFiltersPanel filters={filters} casinos={casinos} onChange={updateFilters} />
          </section>

          {servicios.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-lg text-slate-700 shadow-sm">
              No hay servicios registrados.
            </div>
          ) : (
            <ServiciosTable servicios={currentServicios} casinos={casinos} page={page} pageSize={pageSize} totalPages={totalPages} onEdit={openEdit} onPageChange={setPage} onPageSizeChange={updatePageSize} />
          )}
        </div>

        <aside className="xl:col-span-4">
          <div className="min-h-0 flex-1 overflow-y-auto"><ServicioForm
            title="Crear servicio"
            description="Registra un servicio y define su casino, tipo y horario de vigencia."
            draft={createDraft}
            casinos={casinos}
            saving={saving}
            submitLabel="Crear"
            onChange={updateCreateDraft}
            onSubmit={createNewServicio}
            onReset={resetCreate}
          />
          </div>
        </aside>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/50 px-4 py-8">
          <section className="flex max-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col bg-surface-light rounded-3xl border border-slate-200 shadow-strong overflow-hidden">
            <div className="shrink-0 p-8 border-b border-slate-200 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div>
                <h1 className="text-4xl font-extrabold text-primary mb-2">Editar servicio</h1>
                <p className="text-lg text-slate-600">Modifica el casino, tipo, horario y disponibilidad del servicio.</p>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-1">Servicio seleccionado</p>
                  <p className="text-2xl font-extrabold text-primary">{editing.nombre}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">{editingCasino?.nombre || 'Sin casino'} · {editing.horaInicio} a {editing.horaFin}</p>
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

            <div className="min-h-0 flex-1 overflow-y-auto"><ServicioForm
              title="Editar servicio"
              description="Modifica el servicio seleccionado."
              draft={editDraft}
              casinos={casinos}
              saving={saving}
              submitLabel="Guardar cambios"
              showHeader={false}
              onChange={updateEditDraft}
              onSubmit={saveEdit}
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

export default ServiciosPage;



