import { ComensalFilter, RoleFilter, UserFilters } from '../types';
import { TipoComensal } from '../../tiposComensal/types';

type UserFiltersProps = {
  filters: UserFilters;
  tiposComensal: TipoComensal[];
  onChange: (filters: Partial<UserFilters>) => void;
};

const roleOptions: RoleFilter[] = ['Todos', 'Funcionario', 'Cajero', 'Administrador'];

const UserFiltersPanel = ({ filters, tiposComensal, onChange }: UserFiltersProps) => {
  const comensalOptions: ComensalFilter[] = ['Todos', ...tiposComensal.map((tipo) => tipo.nombre), 'No aplica'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-5 mt-8">
      <div className="xl:col-span-2">
        <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2">
          Buscar por nombre o codigo
        </label>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder="Ej: Maria Soto o 123456"
            className="w-full rounded-2xl border border-slate-300 bg-white pl-14 pr-5 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2">Tipo de usuario</label>
        <select
          value={filters.role}
          onChange={(event) => onChange({ role: event.target.value as RoleFilter })}
          className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
        >
          {roleOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2">Tipo de comensal</label>
        <select
          value={filters.comensal}
          onChange={(event) => onChange({ comensal: event.target.value as ComensalFilter })}
          className="w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition"
        >
          {comensalOptions.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default UserFiltersPanel;
