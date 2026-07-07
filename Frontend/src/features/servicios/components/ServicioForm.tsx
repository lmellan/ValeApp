import { Casino, servicioCategorias, ServicioPayload, Turno } from '../types';

type ServicioFormProps = {
  title: string;
  description: string;
  draft: ServicioPayload;
  casinos: Casino[];
  saving: boolean;
  submitLabel: string;
  showHeader?: boolean;
  turnos?: Turno[];
  turnosSeleccionados?: number[];
  onChange: (changes: Partial<ServicioPayload>) => void;
  onTurnosChange?: (turnos: number[]) => void;
  onSubmit: () => void;
  onReset?: () => void;
  lockName?: boolean;
  forceCategoria?: 'Base' | 'Adicional';
};

const inputClass = 'w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition';
const inputLockedClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-lg text-slate-500 cursor-not-allowed select-none';
const labelClass = 'block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2';

const getCategoriaDescription = (categoria: string) =>
  categoria === 'Base'
    ? 'Se asigna automaticamente segun el turno fijo del funcionario.'
    : 'Lo crea el administrador para una necesidad especial o excepcional.';

const ServicioForm = ({
  title,
  description,
  draft,
  casinos,
  saving,
  submitLabel,
  showHeader = true,
  turnos = [],
  turnosSeleccionados = [],
  onChange,
  onTurnosChange,
  onSubmit,
  onReset,
  lockName = false,
  forceCategoria
}: ServicioFormProps) => {
  const isBase = (draft.categoria || 'Adicional') === 'Base';
  const nameLocked = lockName;
  const categoriaFija = forceCategoria || null;

  const toggleTurno = (idTurno: number) => {
    if (!onTurnosChange) return;
    onTurnosChange(
      turnosSeleccionados.includes(idTurno)
        ? turnosSeleccionados.filter((id) => id !== idTurno)
        : [...turnosSeleccionados, idTurno]
    );
  };

  return (
    <div className={showHeader ? 'bg-surface-light rounded-3xl border border-slate-200 shadow-strong overflow-hidden' : 'bg-surface-light'}>
      {showHeader && (
        <div className="p-8 border-b border-slate-200">
          <h2 className="text-3xl font-extrabold text-primary mb-2">{title}</h2>
          <p className="text-lg text-slate-600">{description}</p>
        </div>
      )}

      <div className="p-8 space-y-6">
        <div>
          <label className={labelClass}>
            Nombre del servicio <span className="text-red-500">*</span>
            {nameLocked && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                <span className="material-symbols-outlined text-[14px]">lock</span>fijo
              </span>
            )}
          </label>
          {nameLocked ? (
            <div className={inputLockedClass}>{draft.nombre || '?'}</div>
          ) : (
            <input
              value={draft.nombre}
              onChange={(event) => onChange({ nombre: event.target.value })}
              className={inputClass}
              placeholder="Ej: Colacion especial"
              type="text"
            />
          )}
        </div>

        <div>
          <label className={labelClass}>Casino <span className="text-red-500">*</span></label>
          <select value={draft.idCasino} onChange={(event) => onChange({ idCasino: Number(event.target.value) })} className={inputClass}>
            <option value="">Seleccionar</option>
            {casinos.map((casino) => (
              <option key={casino.idCasino} value={casino.idCasino}>{casino.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-3">
            Tipo de servicio <span className="text-red-500">*</span>
          </label>
          {categoriaFija ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="block text-base font-bold text-slate-700">{categoriaFija}</span>
                  <span className="block text-sm font-semibold text-slate-500">{getCategoriaDescription(categoriaFija)}</span>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
                  <span className="material-symbols-outlined text-[14px]">lock</span>fijo
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {servicioCategorias.map((categoria) => {
                const selected = draft.categoria === categoria;
                return (
                  <label
                    key={categoria}
                    className={`flex items-start gap-3 rounded-2xl border px-5 py-4 transition cursor-pointer ${selected ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'border-slate-200 bg-slate-50 hover:border-primary/40'}`}
                  >
                    <input
                      checked={selected}
                      onChange={() => onChange({ categoria })}
                      className="mt-1 border-slate-300 text-primary focus:ring-primary"
                      name={`${title}-categoria`}
                      type="radio"
                    />
                    <span>
                      <span className="block text-base font-bold text-slate-700">{categoria}</span>
                      <span className="block text-sm font-semibold text-slate-500">{getCategoriaDescription(categoria)}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>
            Horario
            {isBase && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-500">
                <span className="material-symbols-outlined text-[14px]">lock</span>fijo
              </span>
            )}
          </label>
          {isBase ? (
            <div className="grid grid-cols-2 gap-4">
              <div className={inputLockedClass}>{draft.horaInicio || '--:--'}</div>
              <div className={inputLockedClass}>{draft.horaFin || '--:--'}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Hora inicio</label>
                <input value={draft.horaInicio} onChange={(event) => onChange({ horaInicio: event.target.value })} className={inputClass} type="time" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Hora fin</label>
                <input value={draft.horaFin} onChange={(event) => onChange({ horaFin: event.target.value })} className={inputClass} type="time" />
              </div>
            </div>
          )}
        </div>

        {isBase && (
          <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
            <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">info</span>
            <p className="text-sm font-semibold text-primary/80">
              El nombre del servicio queda fijo luego de crearlo. En los servicios base tambien queda fijo el horario para garantizar la generacion automatica de vales por turno. Solo puedes modificar el casino asignado.
            </p>
          </div>
        )}

        {isBase && turnos.length > 0 && onTurnosChange && (
          <div>
            <label className={labelClass}>
              Turnos habilitados <span className="text-red-500">*</span>
            </label>
            <p className="text-sm text-slate-500 mb-3 font-medium">
              El sistema generara vales de este servicio para los funcionarios de los turnos seleccionados.
            </p>
            <div className="space-y-3">
              {turnos.map((turno) => {
                const checked = turnosSeleccionados.includes(turno.idTurno);
                return (
                  <label
                    key={turno.idTurno}
                    className={`flex items-center gap-4 rounded-2xl border px-5 py-4 cursor-pointer transition ${checked ? 'border-secondary bg-secondary/5 ring-2 ring-secondary/10' : 'border-slate-200 bg-slate-50 hover:border-secondary/40'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTurno(turno.idTurno)}
                      className="h-5 w-5 rounded border-slate-300 text-secondary focus:ring-secondary"
                    />
                    <div className="min-w-0">
                      <p className="text-base font-bold text-slate-700">{turno.nombre}</p>
                      <p className="text-sm text-slate-500">{turno.horaInicio} a {turno.horaFin}</p>
                    </div>
                    {checked && (
                      <span className="ml-auto inline-flex items-center rounded-full bg-secondary/15 px-3 py-1 text-xs font-bold text-secondary">
                        Habilitado
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            type="button"
            disabled={saving}
            onClick={onSubmit}
            className="flex-1 h-16 rounded-2xl bg-primary hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-lg font-extrabold transition flex items-center justify-center gap-3"
          >
            <span className="material-symbols-outlined">{submitLabel === 'Crear' ? 'add' : 'save'}</span>
            {saving ? 'Guardando...' : submitLabel}
          </button>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="sm:w-[160px] h-16 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-lg font-bold transition"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicioForm;
