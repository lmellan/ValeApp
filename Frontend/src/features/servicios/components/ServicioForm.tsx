import { Casino, servicioCategorias, ServicioPayload } from '../types';

type ServicioFormProps = {
  title: string;
  description: string;
  draft: ServicioPayload;
  casinos: Casino[];
  saving: boolean;
  submitLabel: string;
  showHeader?: boolean;
  onChange: (changes: Partial<ServicioPayload>) => void;
  onSubmit: () => void;
  onReset?: () => void;
};

const inputClass = 'w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition';
const labelClass = 'block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2';

const getCategoriaDescription = (categoria: string) =>
  categoria === 'Base'
    ? 'Se asigna automáticamente según el turno fijo del funcionario.'
    : 'Lo crea el administrador para una necesidad especial o excepcional.';

const ServicioForm = ({
  title,
  description,
  draft,
  casinos,
  saving,
  submitLabel,
  showHeader = true,
  onChange,
  onSubmit,
  onReset
}: ServicioFormProps) => (
  <div className={showHeader ? 'bg-surface-light rounded-3xl border border-slate-200 shadow-strong overflow-hidden' : 'bg-surface-light'}>
    {showHeader && (
      <div className="p-8 border-b border-slate-200">
        <h2 className="text-3xl font-extrabold text-primary mb-2">{title}</h2>
        <p className="text-lg text-slate-600">{description}</p>
      </div>
    )}

    <div className="p-8 space-y-6">
      <div>
        <label className={labelClass}>Nombre del servicio <span className="text-red-500">*</span></label>
        <input
          value={draft.nombre}
          onChange={(event) => onChange({ nombre: event.target.value })}
          className={inputClass}
          placeholder="Ej: Desayuno"
          type="text"
        />
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
        <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-3">Tipo de servicio <span className="text-red-500">*</span></label>
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
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Hora inicio <span className="text-red-500">*</span></label>
          <input value={draft.horaInicio} onChange={(event) => onChange({ horaInicio: event.target.value })} className={inputClass} type="time" />
        </div>
        <div>
          <label className={labelClass}>Hora fin <span className="text-red-500">*</span></label>
          <input value={draft.horaFin} onChange={(event) => onChange({ horaFin: event.target.value })} className={inputClass} type="time" />
        </div>
      </div>

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

export default ServicioForm;
