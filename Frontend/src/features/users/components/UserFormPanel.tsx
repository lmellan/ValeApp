import { FormEvent, useEffect, useState } from 'react';
import { TipoComensal } from '../../tiposComensal/types';
import { turnOptions, UserDraft } from '../types';

type UserFormPanelProps = {
  user: UserDraft;
  saving: boolean;
  tiposComensal: TipoComensal[];
  onCancel: () => void;
  onSave: (user: UserDraft) => void;
};

const inputClass = 'w-full rounded-2xl border border-slate-300 bg-white px-5 py-4 text-lg text-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition';
const labelClass = 'block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-2';

const UserFormPanel = ({ user, saving, tiposComensal, onCancel, onSave }: UserFormPanelProps) => {
  const [draft, setDraft] = useState(user);
  const isEditing = Boolean(draft.id && draft.id > 0);
  const isFuncionario = draft.rol === 'Funcionario';
  const selectedTipoComensalId = draft.id_tipo_comensal ? String(draft.id_tipo_comensal) : String(tiposComensal.find((tipo) => tipo.nombre === draft.tipo_comensal)?.idTipoComensal || '');

  useEffect(() => {
    setDraft(user);
  }, [user]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSave(draft);
  };

  const updateDraft = (changes: Partial<UserDraft>) => {
    setDraft((current) => {
      const next = { ...current, ...changes };
      if (changes.rol && changes.rol !== 'Funcionario') {
        next.tipo_comensal = '';
        next.turno = '';
      }
      if (changes.rol === 'Funcionario' && !next.turno) {
        next.turno = turnOptions[0].value;
      }
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950/50 px-4 py-8">
      <section className="flex max-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col bg-surface-light rounded-3xl border border-slate-200 shadow-strong overflow-hidden">
        <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
          <div className="shrink-0 p-8 border-b border-slate-200 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
            <div>
              <h1 className="text-4xl font-extrabold text-primary mb-2">{isEditing ? 'Editar usuario' : 'Crear usuario'}</h1>
              <p className="text-lg text-slate-600">
                {isEditing ? 'Modifica la informacion del usuario seleccionado.' : 'Registra una cuenta y asigna su rol dentro de ValeApp.'}
              </p>
            </div>

            <div className="flex items-start gap-3">
              {isEditing && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-1">ID usuario</p>
                  <p className="text-2xl font-extrabold text-primary">{draft.codigo || draft.id}</p>
                </div>
              )}
              <button
                type="button"
                onClick={onCancel}
                className="h-12 w-12 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-primary transition flex items-center justify-center"
                aria-label="Cerrar formulario"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Nombre completo <span className="text-red-500">*</span></label>
                <input
                  value={draft.nombre || ''}
                  onChange={(event) => updateDraft({ nombre: event.target.value })}
                  className={inputClass}
                  placeholder="Ej: Maria Soto Gonzalez"
                  type="text"
                />
              </div>

              <div>
                <label className={labelClass}>Correo electronico <span className="text-red-500">*</span></label>
                <input
                  value={draft.correo || ''}
                  onChange={(event) => updateDraft({ correo: event.target.value })}
                  className={inputClass}
                  placeholder="Ej: maria.soto@valeapp.cl"
                  type="email"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Codigo de acceso <span className="normal-case tracking-normal text-slate-400">(opcional)</span></label>
                <input
                  value={draft.codigo || ''}
                  onChange={(event) => updateDraft({ codigo: event.target.value })}
                  className={inputClass}
                  placeholder="Ej: ADM001 o 123456"
                  type="text"
                />
              </div>

              <div>
                <label className={labelClass}>Tipo de usuario <span className="text-red-500">*</span></label>
                <select value={draft.rol || ''} onChange={(event) => updateDraft({ rol: event.target.value })} className={inputClass}>
                  <option value="">Seleccionar</option>
                  <option value="Funcionario">Funcionario</option>
                  <option value="Cajero">Cajero</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>
            </div>

            {isFuncionario && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Tipo de comensal <span className="text-red-500">*</span></label>
                    <select
                      value={selectedTipoComensalId}
                      onChange={(event) => {
                        const selected = tiposComensal.find((tipo) => String(tipo.idTipoComensal) === event.target.value);
                        updateDraft({
                          id_tipo_comensal: selected?.idTipoComensal || null,
                          tipo_comensal: selected?.nombre || ''
                        });
                      }}
                      className={inputClass}
                    >
                      <option value="">Seleccionar</option>
                      {tiposComensal.map((tipo) => (
                        <option key={tipo.idTipoComensal} value={tipo.idTipoComensal}>
                          {tipo.nombre}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-sm text-slate-500">Este campo se alimenta desde la configuracion de tipos de comensal.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-3">Turno asignado <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {turnOptions.map((turn) => {
                      const selected = draft.turno === turn.value;
                      return (
                        <label
                          key={turn.value}
                          className={`flex items-start gap-3 rounded-2xl border px-5 py-5 transition cursor-pointer ${selected ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'border-slate-200 bg-slate-50 hover:border-primary/40'}`}
                        >
                          <input
                            checked={selected}
                            onChange={() => updateDraft({ turno: turn.value })}
                            className="mt-1 border-slate-300 text-primary focus:ring-primary"
                            name="turnoUsuario"
                            type="radio"
                          />
                          <div>
                            <p className="text-base font-bold text-slate-700">{turn.label}</p>
                            <p className="text-sm text-slate-500">{turn.description}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-bold uppercase tracking-[0.16em] text-on-surface-variant mb-3">
                {isEditing ? 'Estado del usuario' : 'Estado inicial'} <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[
                  { label: 'Activo', value: true },
                  { label: 'Inactivo', value: false }
                ].map((option) => {
                  const selected = draft.activo === option.value;
                  return (
                    <label
                      key={option.label}
                      className={`flex items-center gap-3 rounded-2xl border px-5 py-4 transition cursor-pointer ${selected ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'border-slate-200 bg-slate-50 hover:border-primary/40'}`}
                    >
                      <input
                        checked={selected}
                        onChange={() => updateDraft({ activo: option.value })}
                        className="border-slate-300 text-primary focus:ring-primary"
                        name="estadoUsuario"
                        type="radio"
                      />
                      <span className="text-base font-semibold text-slate-700">{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {!isEditing && (
              <div>
                <label className={labelClass}>Contrasena inicial <span className="text-red-500">*</span></label>
                <input
                  value={draft.contrasena || ''}
                  onChange={(event) => updateDraft({ contrasena: event.target.value })}
                  className={inputClass}
                  placeholder="Define una contrasena inicial"
                  type="password"
                />
              </div>
            )}

            <div className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/15 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-secondary text-2xl">mail</span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-primary mb-2">Notificacion al usuario</h3>
                  <p className="text-lg text-slate-600 leading-relaxed">
                    {isEditing
                      ? 'Si los cambios se guardan, el sistema puede notificar al usuario en el correo registrado sobre la actualizacion de sus datos.'
                      : 'Una vez creado el usuario, se puede enviar una notificacion al correo registrado informando la creacion de su cuenta.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 h-16 rounded-2xl bg-primary hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-lg font-extrabold transition flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">{isEditing ? 'save' : 'add'}</span>
                {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear usuario'}
              </button>

              <button
                type="button"
                onClick={() => setDraft(user)}
                className="sm:w-[220px] h-16 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-lg font-bold transition"
              >
                {isEditing ? 'Restablecer' : 'Limpiar'}
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="sm:w-[180px] h-16 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-lg font-bold transition"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
};

export default UserFormPanel;



