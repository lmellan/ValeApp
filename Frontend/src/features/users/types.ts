import { User } from '../../shared/types/api';

export type RoleFilter = 'Todos' | 'Funcionario' | 'Cajero' | 'Administrador';
export type ComensalFilter = string;

export type UserFilters = {
  query: string;
  role: RoleFilter;
  comensal: ComensalFilter;
};

export type UserDraft = User & {
  contrasena?: string;
  autoGenerateCodigo?: boolean;
};

export type TurnOption = {
  label: string;
  value: string;
  description: string;
};

export const turnOptions: TurnOption[] = [
  { label: 'Turno 1', value: '08:00 - 16:00', description: '08:00 a 16:00' },
  { label: 'Turno 2', value: '16:00 - 23:59', description: '16:00 a 23:59' },
  { label: 'Turno 3', value: '00:00 - 08:00', description: '00:00 a 08:00' }
];

export const createEmptyUserDraft = (): UserDraft => ({
  id: 0,
  nombre: '',
  correo: '',
  codigo: '',
  autoGenerateCodigo: true,
  rol: 'Funcionario',
  id_tipo_comensal: null,
  tipo_comensal: '',
  turno: turnOptions[0].value,
  activo: true
});



