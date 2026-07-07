import { User } from '../../../shared/types/api';
import { TipoComensal } from '../../tiposComensal/types';

type UsersTableProps = {
  users: User[];
  tiposComensal: TipoComensal[];
  page: number;
  totalPages: number;
  pageSize: number;
  onEdit: (user: User) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
};

const normalizeHexColor = (color?: string) => (/^#[0-9a-fA-F]{6}$/.test(color || '') ? color || '#64748b' : '#64748b');

const getReadableAccent = (color?: string) => {
  const hex = normalizeHexColor(color).replace('#', '');
  const red = parseInt(hex.slice(0, 2), 16);
  const green = parseInt(hex.slice(2, 4), 16);
  const blue = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.78 ? '#334155' : normalizeHexColor(color);
};

const getColorStyle = (color?: string) => {
  const normalized = normalizeHexColor(color);
  return {
    color: getReadableAccent(normalized),
    backgroundColor: `${normalized}26`,
    borderColor: `${normalized}73`
  };
};

const tableGridClass =
  'grid grid-cols-[1.1fr_1.45fr_1.75fr_1.15fr_1.65fr_1.15fr_0.9fr_0.85fr] gap-x-6';

const UsersTable = ({ users, tiposComensal, page, totalPages, pageSize, onEdit, onPageChange, onPageSizeChange }: UsersTableProps) => (
  <section className="bg-surface-light rounded-3xl border border-slate-200 shadow-card overflow-hidden">
    <div className="overflow-x-auto">
      <div className="min-w-[1040px]">
        <div className={`${tableGridClass} bg-slate-50 px-6 py-4 border-b border-slate-200 text-sm font-bold uppercase tracking-[0.14em] text-on-surface-variant`}>
          <div>ID</div>
          <div>Nombre</div>
          <div>Correo</div>
          <div>Tipo</div>
          <div>Comensal</div>
          <div>Turno</div>
          <div>Estado</div>
          <div className="text-right">Acción</div>
        </div>

        <div className="divide-y divide-slate-200">
          {users.length === 0 ? (
            <div className="px-6 py-10 text-center text-slate-500">No hay usuarios que coincidan con los filtros.</div>
          ) : (
            users.map((user) => {
              const tipo = tiposComensal.find((item) => item.idTipoComensal === user.id_tipo_comensal || item.nombre === user.tipo_comensal);

              return (
                <div key={user.id} className={`${tableGridClass} items-center px-6 py-5 bg-white hover:bg-slate-50/70 transition`}>
                  <div>
                    <p className="text-lg font-bold text-primary">{user.codigo || user.id}</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-700">{user.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 break-words">{user.correo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 whitespace-normal">{user.rol}</p>
                  </div>
                  <div>
                    <span className="inline-flex max-w-full items-center rounded-full border px-3 py-1 text-sm font-bold leading-5" style={getColorStyle(tipo?.color)}>
                      <span className="truncate">{tipo?.nombre || user.tipo_comensal || 'No aplica'}</span>
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 whitespace-normal">{user.turno || 'No aplica'}</p>
                  </div>
                  <div>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${user.activo ? 'bg-secondary/15 text-secondary' : 'bg-slate-100 text-slate-500'}`}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:border-primary/30 hover:bg-primary/5 hover:text-primary transition"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4">
      <p className="text-sm font-semibold text-slate-500">
        Página {page} de {totalPages}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 outline-none transition focus:border-primary"
        >
          {[5, 10, 20].map((size) => <option key={size} value={size}>{size} filas</option>)}
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

export default UsersTable;


