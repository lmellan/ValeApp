import { FormEvent, useEffect, useMemo, useState } from 'react';
import { User } from '../../../shared/types/api';
import { ServicioAlimentacion } from '../../servicios/types';
import { TipoComensal } from '../../tiposComensal/types';
import { ValeAdicionalPayload } from '../types';

type ValeAdicionalFormProps = {
  title?: string;
  description?: string;
  draft: ValeAdicionalPayload;
  usuarios: User[];
  tiposComensal: TipoComensal[];
  servicios: ServicioAlimentacion[];
  saving: boolean;
  submitLabel: string;
  showHeader?: boolean;
  onChange: (changes: Partial<ValeAdicionalPayload>) => void;
  onSubmit: () => void;
  onReset?: () => void;
  allowCantidad?: boolean;
};

const inputClass = 'w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition';
const labelClass = 'block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2';

const normalize = (value: string) => value.trim().toLowerCase();
const userLabel = (usuario: User) => `${usuario.codigo || usuario.id} - ${usuario.nombre}`;
const formatTime = (value?: string | null) => value?.slice(0, 5) || '--:--';

const getTodayInput = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};

const ValeAdicionalForm = ({
  title = 'Crear asignacion',
  description = 'Busca un usuario y asigna un vale adicional para una fecha especifica.',
  draft,
  usuarios,
  tiposComensal,
  servicios,
  saving,
  submitLabel,
  showHeader = true,
  onChange,
  onSubmit,
  onReset,
  allowCantidad = true
}: ValeAdicionalFormProps) => {
  const selectedUsuario = usuarios.find((usuario) => usuario.id === Number(draft.idFuncionario));
  const selectedServicio = servicios.find((servicio) => servicio.idServicio === Number(draft.idServicio));
  const selectedTipoComensal = tiposComensal.find((tipo) => tipo.idTipoComensal === selectedUsuario?.id_tipo_comensal || tipo.nombre === selectedUsuario?.tipo_comensal);
  const permiteMultiples = Boolean(selectedTipoComensal?.emisionMultiple);
  const [usuarioQuery, setUsuarioQuery] = useState('');
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    setUsuarioQuery(selectedUsuario ? userLabel(selectedUsuario) : '');
  }, [selectedUsuario?.id]);

  const usuarioOptions = useMemo(
    () => usuarios.map((usuario) => ({
      usuario,
      label: userLabel(usuario),
      searchable: normalize(`${usuario.codigo || ''} ${usuario.id} ${usuario.nombre} ${usuario.correo || ''} ${usuario.rol || ''}`)
    })),
    [usuarios]
  );

  const filteredUsuarios = useMemo(() => {
    const query = normalize(usuarioQuery);
    if (!query) return usuarioOptions.slice(0, 20);
    return usuarioOptions.filter((option) => option.searchable.includes(query) || normalize(option.label).includes(query)).slice(0, 30);
  }, [usuarioOptions, usuarioQuery]);

  const selectUsuario = (usuario: User) => {
    onChange({ idFuncionario: usuario.id, cantidadVales: 1 });
    setUsuarioQuery(userLabel(usuario));
    setShowUserList(false);
  };

  const handleUsuarioInput = (value: string) => {
    setUsuarioQuery(value);
    setShowUserList(true);
    const normalizedValue = normalize(value);
    const selected = usuarioOptions.find((option) => normalize(option.label) === normalizedValue || normalize(String(option.usuario.codigo || '')) === normalizedValue || String(option.usuario.id) === normalizedValue);
    onChange({ idFuncionario: selected?.usuario.id || '', cantidadVales: 1 });
  };

  const handleUsuarioBlur = () => {
    window.setTimeout(() => setShowUserList(false), 120);
    if (draft.idFuncionario) return;
    const normalizedValue = normalize(usuarioQuery);
    const matches = usuarioOptions.filter((option) => option.searchable.includes(normalizedValue));
    if (normalizedValue && matches.length === 1) selectUsuario(matches[0].usuario);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface-light rounded-3xl border border-slate-200 shadow-card overflow-hidden">
      {showHeader && (
        <div className="p-7 border-b border-slate-200">
          <h2 className="text-3xl font-extrabold text-primary mb-2">{title}</h2>
          <p className="text-base text-slate-600 leading-relaxed">{description}</p>
        </div>
      )}

      <div className="p-7 space-y-6">
        <div className="relative">
          <label className={labelClass}>Usuario <span className="text-red-500">*</span></label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
            <input value={usuarioQuery} onChange={(event) => handleUsuarioInput(event.target.value)} onFocus={() => setShowUserList(true)} onBlur={handleUsuarioBlur} className={`${inputClass} pl-12`} placeholder="Escribe nombre, codigo o correo" type="text" />
          </div>

          {showUserList && (
            <div className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-strong">
              {filteredUsuarios.length === 0 ? <div className="px-5 py-4 text-sm font-semibold text-slate-500">No hay usuarios que coincidan.</div> : filteredUsuarios.map(({ usuario }) => (
                <button key={usuario.id} type="button" onMouseDown={(event) => { event.preventDefault(); selectUsuario(usuario); }} className="flex w-full items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 text-left transition last:border-b-0 hover:bg-primary/5">
                  <span className="min-w-0">
                    <span className="block truncate text-base font-extrabold text-slate-800">{usuario.nombre}</span>
                    <span className="mt-1 block truncate text-sm font-semibold text-slate-500">{usuario.codigo || usuario.id} {' - '} {usuario.correo || 'Sin correo'}</span>
                  </span>
                  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">{usuario.rol}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedUsuario && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-1">Usuario seleccionado</p>
            <p className="text-xl font-extrabold text-primary">{selectedUsuario.nombre}</p>
            <p className="mt-1 text-sm font-semibold text-slate-500">{selectedUsuario.codigo || selectedUsuario.id} {' - '} {selectedUsuario.rol} {' - '} {selectedUsuario.tipo_comensal || 'Sin tipo de comensal'}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="lg:col-span-2">
            <label className={labelClass}>Servicio adicional asignado <span className="text-red-500">*</span></label>
            <select value={draft.idServicio} onChange={(event) => onChange({ idServicio: Number(event.target.value) || '' })} className={inputClass}>
              <option value="">Seleccionar</option>
              {servicios.map((servicio) => <option key={servicio.idServicio} value={servicio.idServicio}>{servicio.nombre}</option>)}
            </select>
            {selectedServicio && <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4 text-sm font-bold text-primary">Horario definido por el servicio: {formatTime(selectedServicio.horaInicio)} a {formatTime(selectedServicio.horaFin)}</div>}
            {servicios.length === 0 && <p className="mt-2 text-sm font-semibold text-amber-700">Primero crea un servicio de tipo Adicional en la seccion Servicios.</p>}
          </div>

          <div>
            <label className={labelClass}>Fecha de inicio <span className="text-red-500">*</span></label>
            <input value={draft.fechaUso} onChange={(event) => onChange({ fechaUso: event.target.value })} className={inputClass} min={getTodayInput()} type="date" />
          </div>

          {allowCantidad && (
            <div>
              <label className={labelClass}>Alcance <span className="text-red-500">*</span></label>
              <select value={draft.periodoUso || 'dia'} onChange={(event) => onChange({ periodoUso: event.target.value as ValeAdicionalPayload['periodoUso'] })} className={inputClass}>
                <option value="dia">Solo ese dia</option>
                <option value="semana">Semana desde la fecha</option>
                <option value="mes">Mes de la fecha</option>
              </select>
              {draft.fechaExpiracion && draft.fechaExpiracion !== draft.fechaUso && <p className="mt-2 text-sm font-semibold text-slate-500">Se generaran vales por dias habiles hasta el {draft.fechaExpiracion}.</p>}
            </div>
          )}

          {allowCantidad && selectedUsuario && (
            <div className="lg:col-span-2">
              <label className={labelClass}>Cantidad de vales por dia <span className="text-red-500">*</span></label>
              <input value={permiteMultiples ? draft.cantidadVales || 1 : 1} onChange={(event) => onChange({ cantidadVales: permiteMultiples ? Math.max(1, Number(event.target.value) || 1) : 1 })} className={inputClass} disabled={!permiteMultiples} min="1" step="1" type="number" />
              <p className="mt-2 text-sm font-semibold text-slate-500">{permiteMultiples ? 'Este usuario permite multiples vales en el mismo horario.' : 'Este usuario solo permite 1 vale por horario.'}</p>
            </div>
          )}
        </div>

        <div>
          <label className={labelClass}>Motivo <span className="normal-case tracking-normal text-slate-400">(opcional)</span></label>
          <textarea value={draft.motivo} onChange={(event) => onChange({ motivo: event.target.value })} className={`${inputClass} min-h-[120px] resize-none`} placeholder="Opcional: describe brevemente el contexto de esta asignacion." />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button type="submit" disabled={saving || servicios.length === 0} className="flex-1 h-16 rounded-2xl bg-primary hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-lg font-extrabold transition flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">save</span>
            {saving ? 'Guardando...' : submitLabel}
          </button>
          {onReset && <button type="button" onClick={onReset} className="sm:w-[180px] h-16 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-lg font-bold transition">Limpiar</button>}
        </div>
      </div>
    </form>
  );
};

export default ValeAdicionalForm;