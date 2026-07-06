import { Casino, servicioCategorias, ServicioFilters } from '../types';

type ServicioFiltersProps = {
  filters: ServicioFilters;
  casinos: Casino[];
  onChange: (changes: Partial<ServicioFilters>) => void;
};

const selectClass = 'w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition';

const ServicioFiltersPanel = ({ filters, casinos, onChange }: ServicioFiltersProps) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
    <div className="xl:col-span-2">
      <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2">Buscar servicio</label>
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
        <input
          value={filters.query}
          onChange={(event) => onChange({ query: event.target.value })}
          className="w-full rounded-2xl border border-slate-300 bg-white pl-14 pr-5 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
          placeholder="Ej: Desayuno, Box lunch, Colación..."
          type="text"
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2">Casino</label>
      <select value={filters.casino} onChange={(event) => onChange({ casino: event.target.value })} className={selectClass}>
        <option value="Todos">Todos</option>
        {casinos.map((casino) => (
          <option key={casino.idCasino} value={casino.idCasino}>{casino.nombre}</option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2">Tipo</label>
      <select value={filters.categoria} onChange={(event) => onChange({ categoria: event.target.value })} className={selectClass}>
        <option value="Todos">Todos</option>
        {servicioCategorias.map((categoria) => (
          <option key={categoria} value={categoria}>{categoria}</option>
        ))}
      </select>
    </div>
  </div>
);

export default ServicioFiltersPanel;
