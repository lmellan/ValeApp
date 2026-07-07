import { TipoComensalForm, TiposComensalTable, getTipoComensalTagStyle } from './TiposComensalParts';
import { useTiposComensal } from '../hooks/useTiposComensal';

const TiposComensalPage = () => {
  const {
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
  } = useTiposComensal();

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-lg text-slate-700 shadow-sm">
        Cargando tipos de comensal...
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
            <h1 className="text-4xl font-extrabold text-primary mb-2">Tipos de comensal</h1>
            <p className="text-lg text-slate-600">
              Administra las categorías de comensal y define si su modalidad permite un vale por horario o múltiples vales por horario.
            </p>

            <div className="mt-8 max-w-xl">
              <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2">Buscar tipo</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                <input
                  value={query}
                  onChange={(event) => updateQuery(event.target.value)}
                  className="w-full rounded-2xl border border-slate-300 bg-white pl-14 pr-5 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
                  placeholder="Ej: Obrero, gerente, secretaria..."
                  type="text"
                />
              </div>
            </div>
          </section>

          <TiposComensalTable
            tipos={currentTipos}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            onEdit={openEdit}
            onPageChange={setPage}
            onPageSizeChange={updatePageSize}
          />
        </div>

        <aside className="xl:col-span-4">
          <TipoComensalForm
            title="Crear tipo de comensal"
            description="Registra una nueva categoría y define sus reglas de emisión."
            draft={createDraft}
            saving={saving}
            submitLabel="Crear"
            onChange={updateCreateDraft}
            onSubmit={createTipo}
            onReset={resetCreate}
          />
        </aside>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/50 px-4 py-8">
          <section className="flex max-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col bg-surface-light rounded-3xl border border-slate-200 shadow-strong overflow-hidden">
            <div className="shrink-0 p-8 border-b border-slate-200 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
              <div>
                <h1 className="text-4xl font-extrabold text-primary mb-2">Editar tipo de comensal</h1>
                <p className="text-lg text-slate-600">Modifica la categoría seleccionada y sus reglas de emisión.</p>
              </div>

              <div className="flex items-start gap-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2">Tipo seleccionado</p>
                  <span className="inline-flex max-w-[220px] items-center rounded-full border px-3 py-1 text-sm font-bold" style={getTipoComensalTagStyle(editing.color)}>
                    <span className="truncate">{editing.nombre}</span>
                  </span>
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

            <div className="min-h-0 flex-1 overflow-y-auto">
              <TipoComensalForm
                title="Editar tipo de comensal"
                description="Modifica la categoría seleccionada y sus reglas de emisión."
                draft={editDraft}
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

export default TiposComensalPage;