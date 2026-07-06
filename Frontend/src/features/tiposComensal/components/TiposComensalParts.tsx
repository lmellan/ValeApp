import { TipoComensal, TipoComensalPayload } from '../types';

type TipoComensalFormProps = {
  title: string;
  description: string;
  draft: TipoComensalPayload;
  saving: boolean;
  submitLabel: string;
  showHeader?: boolean;
  onChange: (changes: Partial<TipoComensalPayload>) => void;
  onSubmit: () => void;
  onReset?: () => void;
};

const inputClass = 'w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition';
const labelClass = 'block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2';

export const normalizeHexColor = (color?: string) => (/^#[0-9a-fA-F]{6}$/.test(color || '') ? color || '#0ea5e9' : '#0ea5e9');

const getReadableAccent = (color?: string) => {
  const hex = normalizeHexColor(color).replace('#', '');
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.78 ? '#334155' : normalizeHexColor(color);
};

export const getTipoComensalTagStyle = (color?: string) => {
  const normalized = normalizeHexColor(color);
  return {
    color: getReadableAccent(normalized),
    backgroundColor: `${normalized}26`,
    borderColor: `${normalized}73`
  };
};

export const TipoComensalForm = ({
  title,
  description,
  draft,
  saving,
  submitLabel,
  showHeader = true,
  onChange,
  onSubmit,
  onReset
}: TipoComensalFormProps) => (
  <div className={showHeader ? 'bg-surface-light rounded-3xl border border-slate-200 shadow-strong overflow-hidden' : 'bg-surface-light'}>
    {showHeader && (
      <div className="p-8 border-b border-slate-200">
        <h2 className="text-3xl font-extrabold text-primary mb-2">{title}</h2>
        <p className="text-lg text-slate-600">{description}</p>
      </div>
    )}

    <div className={showHeader ? 'p-8 space-y-6' : 'p-8 space-y-6'}>
      <div>
        <label className={labelClass}>Nombre <span className="text-red-500">*</span></label>
        <input
          value={draft.nombre}
          onChange={(event) => onChange({ nombre: event.target.value })}
          className={inputClass}
          placeholder="Ej: Supervisor externo"
          type="text"
        />
      </div>

      <div>
        <label className={labelClass}>Descripcion <span className="normal-case tracking-normal text-slate-400">(opcional)</span></label>
        <textarea
          value={draft.descripcion || ''}
          onChange={(event) => onChange({ descripcion: event.target.value })}
          className={`${inputClass} min-h-[120px] resize-none`}
          placeholder="Describe cuando se utiliza este tipo de comensal."
        />
      </div>

      <div>
        <label className={labelClass}>Color <span className="text-red-500">*</span></label>
        <label className="relative flex min-h-20 cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 transition hover:border-primary/30 hover:bg-white">
          <span className="h-12 w-12 shrink-0 rounded-2xl border border-white shadow-sm ring-1 ring-slate-200" style={{ backgroundColor: normalizeHexColor(draft.color) }} />
          <span className="flex-1">
            <span className="block text-base font-extrabold text-slate-700">Seleccionar color</span>
            <span className="mt-1 block text-sm font-semibold text-slate-500">El color se aplicara a las etiquetas del tipo.</span>
          </span>
          <span className="material-symbols-outlined text-slate-400">palette</span>
          <input value={normalizeHexColor(draft.color)} onChange={(event) => onChange({ color: event.target.value })} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="color" aria-label="Seleccionar color" />
        </label>
      </div>

      <div>
        <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-3">Modalidad de emision <span className="text-red-500">*</span></label>
        <div className="grid grid-cols-1 gap-4">
          {[
            { label: 'Un vale por horario', value: false },
            { label: 'Multiples vales por horario', value: true }
          ].map((option) => {
            const selected = draft.emisionMultiple === option.value;
            return (
              <label key={option.label} className={`flex items-center gap-3 rounded-2xl border px-5 py-4 transition cursor-pointer ${selected ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'border-slate-200 bg-slate-50 hover:border-primary/40'}`}>
                <input
                  checked={selected}
                  onChange={() => onChange({ emisionMultiple: option.value })}
                  className="border-slate-300 text-primary focus:ring-primary"
                  name={`${title}-emisionMultiple`}
                  type="radio"
                />
                <span className="text-base font-semibold text-slate-700">{option.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-2">
        <button type="button" disabled={saving} onClick={onSubmit} className="flex-1 h-16 rounded-2xl bg-primary hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-lg font-extrabold transition flex items-center justify-center gap-3">
          <span className="material-symbols-outlined">{submitLabel === 'Crear' ? 'add' : 'save'}</span>
          {saving ? 'Guardando...' : submitLabel}
        </button>

        {onReset && (
          <button type="button" onClick={onReset} className="sm:w-[160px] h-16 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-lg font-bold transition">
            Limpiar
          </button>
        )}
      </div>
    </div>
  </div>
);

type TiposComensalTableProps = {
  tipos: TipoComensal[];
  page: number;
  pageSize: number;
  totalPages: number;
  onEdit: (tipo: TipoComensal) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

export const TiposComensalTable = ({ tipos, page, pageSize, totalPages, onEdit, onPageChange, onPageSizeChange }: TiposComensalTableProps) => (
  <section className="bg-surface-light rounded-3xl border border-slate-200 shadow-card overflow-hidden">
    <div className="grid grid-cols-12 bg-slate-50 px-6 py-4 border-b border-slate-200">
      <div className="col-span-3 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Tipo</div>
      <div className="col-span-4 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Descripcion</div>
      <div className="col-span-3 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Modalidad de emision</div>
      <div className="col-span-2 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant text-right">Accion</div>
    </div>

    <div className="divide-y divide-slate-200">
      {tipos.length === 0 ? (
        <div className="px-6 py-10 text-center text-slate-500">No hay tipos de comensal registrados.</div>
      ) : (
        tipos.map((tipo) => (
          <div key={tipo.idTipoComensal} className="grid grid-cols-12 items-center px-6 py-5 bg-white gap-4 hover:bg-slate-50/70 transition">
            <div className="col-span-3">
              <span className="inline-flex max-w-full items-center rounded-full border px-3 py-1 text-sm font-bold" style={getTipoComensalTagStyle(tipo.color)}>
                <span className="truncate">{tipo.nombre}</span>
              </span>
            </div>
            <div className="col-span-4">
              <p className="text-sm text-slate-600">{tipo.descripcion || 'Sin descripcion'}</p>
            </div>
            <div className="col-span-3">
              <p className={`text-sm font-semibold ${tipo.emisionMultiple ? 'text-secondary' : 'text-slate-700'}`}>
                {tipo.emisionMultiple ? 'Permite multiples por horario' : '1 vale por horario'}
              </p>
            </div>
            <div className="col-span-2 flex justify-end">
              <button type="button" onClick={() => onEdit(tipo)} className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition">
                Editar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
    <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-slate-500">Pagina {page} de {totalPages}</p>
      <div className="flex flex-wrap items-center gap-2">
        <select value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none transition focus:border-primary">
          {[5, 10, 20].map((option) => <option key={option} value={option}>{option} filas</option>)}
        </select>
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)} className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition">Anterior</button>
        <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition">Siguiente</button>
      </div>
    </div>
  </section>
);





