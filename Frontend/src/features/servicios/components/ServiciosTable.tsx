import { Casino, ServicioAlimentacion } from '../types';

type ServiciosTableProps = {
  servicios: ServicioAlimentacion[];
  casinos: Casino[];
  page: number;
  pageSize: number;
  totalPages: number;
  onEdit: (servicio: ServicioAlimentacion) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const getCasinoName = (casinos: Casino[], idCasino: number) => casinos.find((casino) => casino.idCasino === idCasino)?.nombre || 'Sin casino';
const getCategoriaClass = (categoria?: string | null) =>
  categoria === 'Adicional'
    ? 'bg-amber-50 text-amber-700 border-amber-200'
    : 'bg-primary/10 text-primary border-primary/20';

const ServiciosTable = ({ servicios, casinos, page, pageSize, totalPages, onEdit, onPageChange, onPageSizeChange }: ServiciosTableProps) => (
  <section className="bg-surface-light rounded-3xl border border-slate-200 shadow-card overflow-hidden">
    <div className="grid grid-cols-12 bg-slate-50 px-6 py-4 border-b border-slate-200 gap-4">
      <div className="col-span-3 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Servicio</div>
      <div className="col-span-3 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Casino</div>
      <div className="col-span-2 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Tipo</div>
      <div className="col-span-2 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Horario</div>
      <div className="col-span-2 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant text-right">Acción</div>
    </div>

    <div className="divide-y divide-slate-200">
      {servicios.length === 0 ? (
        <div className="px-6 py-10 text-center text-slate-500">No hay servicios que coincidan con los filtros.</div>
      ) : (
        servicios.map((servicio) => (
          <div key={servicio.idServicio} className="grid grid-cols-12 items-center px-6 py-5 bg-white gap-4 hover:bg-slate-50/70 transition">
            <div className="col-span-3 min-w-0">
              <p className="text-lg font-bold text-primary truncate">{servicio.nombre}</p>
            </div>
            <div className="col-span-3 min-w-0">
              <p className="text-sm text-slate-600 truncate">{getCasinoName(casinos, servicio.idCasino)}</p>
            </div>
            <div className="col-span-2">
              <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-bold ${getCategoriaClass(servicio.categoria)}`}>
                {servicio.categoria || 'Base'}
              </span>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-slate-600">{servicio.horaInicio} a {servicio.horaFin}</p>
            </div>
            <div className="col-span-2 flex justify-end">
              <button
                type="button"
                onClick={() => onEdit(servicio)}
                className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition"
              >
                Editar
              </button>
            </div>
          </div>
        ))
      )}
    </div>
    <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-slate-500">
        Pagina {page} de {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none transition focus:border-primary"
        >
          {[5, 10, 20].map((option) => (
            <option key={option} value={option}>{option} filas</option>
          ))}
        </select>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Anterior
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          Siguiente
        </button>
      </div>
    </div>
  </section>
);

export default ServiciosTable;

