import { ServicioAlimentacion } from '../../servicios/types';
import { ValeAdicionalFilters } from '../types';

type ValeAdicionalFiltersProps = {
  filters: ValeAdicionalFilters;
  servicios: ServicioAlimentacion[];
  onChange: (changes: Partial<ValeAdicionalFilters>) => void;
};

const inputClass = 'w-full h-14 rounded-2xl border border-slate-300 bg-white px-5 text-base text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition';
const labelClass = 'block text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2';

const ValeAdicionalFiltersPanel = ({ filters, servicios, onChange }: ValeAdicionalFiltersProps) => (
  <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
    <div className="lg:col-span-6">
      <label className={labelClass}>Buscar</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
        <input
          value={filters.query}
          onChange={(event) => onChange({ query: event.target.value })}
          className={`${inputClass} pl-12`}
          placeholder="Nombre, código, vale o motivo"
          type="search"
        />
      </div>
    </div>

    <div className="lg:col-span-3">
      <label className={labelClass}>Servicio</label>
      <select value={filters.servicio} onChange={(event) => onChange({ servicio: event.target.value })} className={inputClass}>
        <option value="Todos">Todos</option>
        {servicios.map((servicio) => (
          <option key={servicio.idServicio} value={servicio.idServicio}>
            {servicio.nombre}
          </option>
        ))}
      </select>
    </div>

    <div className="lg:col-span-3">
      <label className={labelClass}>Estado</label>
      <select value={filters.estado} onChange={(event) => onChange({ estado: event.target.value })} className={inputClass}>
        <option value="Todos">Todos</option>
        <option value="Disponible">Disponible</option>
        <option value="Utilizado">Utilizado</option>
        <option value="Expirado">Expirado</option>
      </select>
    </div>
  </div>
);

export default ValeAdicionalFiltersPanel;
