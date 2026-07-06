export type Casino = {
  idCasino: number;
  nombre: string;
  direccion?: string | null;
  activo: boolean;
};

export type ServicioAlimentacion = {
  idServicio: number;
  nombre: string;
  categoria?: string | null;
  horaInicio: string;
  horaFin: string;
  idCasino: number;
  activo: boolean;
};

export type ServicioPayload = {
  nombre: string;
  categoria: string;
  horaInicio: string;
  horaFin: string;
  idCasino: number | '';
};

export type ServicioFilters = {
  query: string;
  casino: string;
  categoria: string;
};

export const servicioCategorias = ['Base', 'Adicional'];

export const createEmptyServicioDraft = (): ServicioPayload => ({
  nombre: '',
  categoria: 'Base',
  horaInicio: '08:00',
  horaFin: '10:00',
  idCasino: ''
});
