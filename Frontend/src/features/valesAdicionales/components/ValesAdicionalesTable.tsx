import { User } from '../../../shared/types/api';
import { ServicioAlimentacion } from '../../servicios/types';
import { ValeAdicional } from '../types';

type ValesAdicionalesTableProps = {
  vales: ValeAdicional[];
  usuarios: User[];
  servicios: ServicioAlimentacion[];
  page: number;
  pageSize: number;
  totalPages: number;
  onEdit: (vale: ValeAdicional) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const getFuncionario = (usuarios: User[], idFuncionario: number) => usuarios.find((usuario) => usuario.id === idFuncionario);
const getServicio = (servicios: ServicioAlimentacion[], idServicio: number) => servicios.find((servicio) => servicio.idServicio === idServicio);

const getEstado = (vale: ValeAdicional) => {
  if (vale.expirado) return { label: 'Expirado', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  if (vale.estadoUso === 'UTILIZADO') return { label: 'Utilizado', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  return { label: 'Disponible', className: 'bg-sky-50 text-sky-700 border-sky-200' };
};

const formatDate = (value: string) => {
  if (!value) return 'Sin fecha';
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
};

const ValesAdicionalesTable = ({ vales, usuarios, servicios, page, pageSize, totalPages, onEdit, onPageChange, onPageSizeChange }: ValesAdicionalesTableProps) => (
  <section className="bg-surface-light rounded-3xl border border-slate-200 shadow-card overflow-hidden">
    <div className="grid grid-cols-12 bg-slate-50 px-6 py-4 border-b border-slate-200 gap-4">
      <div className="col-span-2 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Fecha</div>
      <div className="col-span-3 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Funcionario</div>
      <div className="col-span-2 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Servicio</div>
      <div className="col-span-1 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Estado</div>
      <div className="col-span-3 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant">Motivo</div>
      <div className="col-span-1 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant text-right">Acción</div>
    </div>

    <div className="divide-y divide-slate-200">
      {vales.length === 0 ? (
        <div className="px-6 py-10 text-center text-slate-500">No hay vales adicionales que coincidan con los filtros.</div>
      ) : (
        vales.map((vale) => {
          const funcionario = getFuncionario(usuarios, vale.idFuncionario);
          const servicio = getServicio(servicios, vale.idServicio);
          const estado = getEstado(vale);
          const editable = vale.estadoUso === 'NO_UTILIZADO' && !vale.expirado;

          return (
            <div key={vale.idVale} className="grid grid-cols-12 items-center px-6 py-5 bg-white gap-4 hover:bg-slate-50/70 transition">
              <div className="col-span-2 min-w-0">
                <p className="text-base font-extrabold text-primary truncate">{formatDate(vale.fechaUso)}</p>
                <p className="text-xs font-semibold text-slate-500 truncate">{vale.horaInicioValidez} a {vale.horaFinValidez}</p>
              </div>

              <div className="col-span-3 min-w-0">
                <p className="text-base font-bold text-slate-900 truncate">{funcionario?.nombre || `Funcionario ${vale.idFuncionario}`}</p>
                <p className="text-xs font-semibold text-slate-500 truncate">{funcionario?.codigo || vale.idFuncionario} · {funcionario?.tipo_comensal || 'Sin tipo'}</p>
              </div>

              <div className="col-span-2 min-w-0">
                <span className="inline-flex max-w-full rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-bold text-amber-700">
                  <span className="truncate">{servicio?.nombre || `Servicio ${vale.idServicio}`}</span>
                </span>
              </div>

              <div className="col-span-1 min-w-0">
                <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${estado.className}`}>{estado.label}</span>
              </div>

              <div className="col-span-3 min-w-0">
                <p className="text-sm text-slate-600 line-clamp-2">{vale.motivo}</p>
                <p className="mt-1 text-xs font-semibold text-slate-400 truncate">{vale.idVale}</p>
              </div>

              <div className="col-span-1 flex justify-end">
                <button
                  type="button"
                  disabled={!editable}
                  onClick={() => onEdit(vale)}
                  className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:border-primary/30 hover:bg-primary/5 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Editar
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>

    <div className="flex flex-col gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-semibold text-slate-500">
        Página {page} de {totalPages}
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

export default ValesAdicionalesTable;
