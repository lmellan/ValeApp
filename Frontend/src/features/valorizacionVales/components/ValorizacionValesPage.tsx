import { ValorizacionValePayload } from '../types';
import { useValorizacionVales } from '../hooks/useValorizacionVales';

const inputClass = 'w-full h-14 rounded-2xl border border-slate-300 bg-white px-5 text-base text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition';
const fieldClass = 'w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition';
const labelClass = 'block text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2';

const formatMoney = (value: number) => `$${value.toLocaleString('es-CL')}`;

type ValorizacionFormProps = {
  title: string;
  description: string;
  draft: ValorizacionValePayload;
  tiposComensal: ReturnType<typeof useValorizacionVales>['tiposComensal'];
  servicios: ReturnType<typeof useValorizacionVales>['servicios'];
  saving: boolean;
  submitLabel: string;
  showHeader?: boolean;
  onChange: (changes: Partial<ValorizacionValePayload>) => void;
  onSubmit: () => void;
  onReset?: () => void;
};

const ValorizacionForm = ({ title, description, draft, tiposComensal, servicios, saving, submitLabel, showHeader = true, onChange, onSubmit, onReset }: ValorizacionFormProps) => (
  <div className={showHeader ? 'bg-surface-light rounded-3xl border border-slate-200 shadow-strong overflow-hidden' : 'bg-surface-light'}>
    {showHeader && (
      <div className="p-8 border-b border-slate-200">
        <h2 className="text-3xl font-extrabold text-primary mb-2">{title}</h2>
        <p className="text-lg text-slate-600">{description}</p>
      </div>
    )}

    <div className="p-8 space-y-6">
      <div>
        <label className={labelClass}>Tipo de comensal <span className="text-red-500">*</span></label>
        <select value={draft.idTipoComensal} onChange={(event) => onChange({ idTipoComensal: Number(event.target.value) || '' })} className={fieldClass}>
          <option value="">Seleccionar</option>
          {tiposComensal.map((tipo) => <option key={tipo.idTipoComensal} value={tipo.idTipoComensal}>{tipo.nombre}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Servicio <span className="text-red-500">*</span></label>
        <select value={draft.idServicio} onChange={(event) => onChange({ idServicio: Number(event.target.value) || '' })} className={fieldClass}>
          <option value="">Seleccionar</option>
          {servicios.map((servicio) => <option key={servicio.idServicio} value={servicio.idServicio}>{servicio.nombre}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Valor <span className="text-red-500">*</span></label>
        <input value={draft.valor} onChange={(event) => onChange({ valor: Number(event.target.value) || '' })} className={fieldClass} min="0" step="100" type="number" placeholder="Ej: 3500" />
      </div>

      <div className="flex flex-col gap-4 pt-2">
        <button type="button" disabled={saving} onClick={onSubmit} className="h-16 rounded-2xl bg-primary hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-lg font-extrabold transition flex items-center justify-center gap-3">
          <span className="material-symbols-outlined">save</span>
          {saving ? 'Guardando...' : submitLabel}
        </button>
        {onReset && (
          <button type="button" onClick={onReset} className="h-14 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-lg font-bold transition">
            Limpiar
          </button>
        )}
      </div>
    </div>
  </div>
);

const ValorizacionValesPage = () => {
  const {
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
  } = useValorizacionVales();

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-lg text-slate-700 shadow-sm">
        Cargando valorizacion de vales...
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
              <h1 className="text-4xl font-extrabold text-primary mb-2">Valorizacion de vales</h1>
              <p className="max-w-3xl text-lg text-slate-600">
                Define el monto de cada vale segun el tipo de comensal y el servicio de alimentacion. Esta matriz se usa para vales base y adicionales.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
              <div className="lg:col-span-6">
                <label className={labelClass}>Buscar</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                  <input value={filters.query} onChange={(event) => updateFilters({ query: event.target.value })} className={`${inputClass} pl-12`} placeholder="Tipo, servicio o valor" type="search" />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className={labelClass}>Tipo</label>
                <select value={filters.tipo} onChange={(event) => updateFilters({ tipo: event.target.value })} className={inputClass}>
                  <option value="Todos">Todos</option>
                  {tiposComensal.map((tipo) => <option key={tipo.idTipoComensal} value={tipo.idTipoComensal}>{tipo.nombre}</option>)}
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className={labelClass}>Servicio</label>
                <select value={filters.servicio} onChange={(event) => updateFilters({ servicio: event.target.value })} className={inputClass}>
                  <option value="Todos">Todos</option>
                  {servicios.map((servicio) => <option key={servicio.idServicio} value={servicio.idServicio}>{servicio.nombre}</option>)}
                </select>
              </div>
            </div>
          </section>

          <section className="bg-surface-light rounded-3xl border border-slate-200 shadow-card overflow-hidden">
            <div className="grid grid-cols-12 bg-slate-50 px-6 py-4 border-b border-slate-200 gap-4">
              <div className="col-span-3 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Tipo</div>
              <div className="col-span-3 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Servicio</div>
              <div className="col-span-2 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Categoria</div>
              <div className="col-span-2 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Valor</div>
              <div className="col-span-2 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant text-right">Accion</div>
            </div>

            <div className="divide-y divide-slate-200">
              {currentValorizaciones.length === 0 ? (
                <div className="px-6 py-10 text-center text-slate-500">No hay valorizaciones que coincidan con los filtros.</div>
              ) : (
                currentValorizaciones.map((item) => {
                  const tipo = getTipo(item.idTipoComensal);
                  const servicio = getServicio(item.idServicio);
                  return (
                    <div key={item.idValorizacion} className="grid grid-cols-12 items-center px-6 py-5 bg-white gap-4 hover:bg-slate-50/70 transition">
                      <div className="col-span-3 min-w-0"><p className="text-base font-bold text-slate-900 truncate">{tipo?.nombre || `Tipo ${item.idTipoComensal}`}</p></div>
                      <div className="col-span-3 min-w-0">
                        <p className="text-base font-bold text-primary truncate">{servicio?.nombre || `Servicio ${item.idServicio}`}</p>
                        <p className="text-xs font-semibold text-slate-500 truncate">{servicio?.horaInicio} a {servicio?.horaFin}</p>
                      </div>
                      <div className="col-span-2 min-w-0"><span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-bold text-slate-600">{servicio?.categoria || 'Base'}</span></div>
                      <div className="col-span-2"><p className="text-lg font-extrabold text-slate-900">{formatMoney(item.valor)}</p></div>
                      <div className="col-span-2 flex justify-end">
                        <button type="button" onClick={() => openEdit(item)} className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition">Editar</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold text-slate-500">Pagina {page} de {totalPages}</p>
              <div className="flex flex-wrap items-center gap-2">
                <select value={pageSize} onChange={(event) => updatePageSize(Number(event.target.value))} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none transition focus:border-primary">
                  {[5, 10, 20].map((option) => <option key={option} value={option}>{option} filas</option>)}
                </select>
                <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition">Anterior</button>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition">Siguiente</button>
              </div>
            </div>
          </section>
        </div>

        <aside className="xl:col-span-4">
          <ValorizacionForm
            title="Crear valorizacion"
            description="Registra un valor para una combinacion de tipo de comensal y servicio."
            draft={createDraft}
            tiposComensal={tiposComensal}
            servicios={servicios}
            saving={saving}
            submitLabel="Crear"
            onChange={updateCreateDraft}
            onSubmit={createValorizacion}
            onReset={resetCreate}
          />
        </aside>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/50 px-4 py-8">
          <section className="flex max-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col bg-surface-light rounded-3xl border border-slate-200 shadow-strong overflow-hidden">
            <div className="shrink-0 p-8 border-b border-slate-200 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-3xl font-extrabold text-primary mb-2">Editar valor</h2>
                <p className="text-base text-slate-600 leading-relaxed">Actualiza el monto asociado a este tipo de comensal y servicio.</p>
              </div>
              <button type="button" onClick={closeEdit} className="h-12 w-12 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-primary transition flex items-center justify-center" aria-label="Cerrar formulario">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <ValorizacionForm
                title="Editar valor"
                description="Actualiza el valor seleccionado."
                draft={editDraft}
                tiposComensal={tiposComensal}
                servicios={servicios}
                saving={saving}
                submitLabel="Guardar cambios"
                showHeader={false}
                onChange={updateEditDraft}
                onSubmit={saveEdit}
              />

              <div className="px-8 pb-8">
                <button type="button" onClick={closeEdit} className="w-full h-14 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-lg font-bold transition">Cancelar</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ValorizacionValesPage;