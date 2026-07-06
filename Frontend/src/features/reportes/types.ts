export type ReporteVale = {
  idVale: string;
  idFuncionario?: number | null;
  idServicio?: number | null;
  estadoUso?: string | null;
  expirado?: boolean;
  tipoAsignacion?: string | null;
  valor?: number | null;
  fechaUso?: string | null;
  horaInicioValidez?: string | null;
  horaFinValidez?: string | null;
  fechaExpiracion?: string | null;
  motivo?: string | null;
  impreso?: boolean;
  fechaHoraImpresion?: string | null;
  idCajeroCanje?: number | null;
  fechaHoraCanje?: string | null;
  createdAt?: string | null;
};

export type ReporteFilters = {
  query: string;
  estado: string;
  tipoAsignacion: string;
  fechaDesde: string;
  fechaHasta: string;
};

export type ReporteKpis = {
  emitidos: number;
  utilizados: number;
  disponibles: number;
  expirados: number;
  valorTotal: number;
  adicionales: number;
};

export const createEmptyReporteFilters = (): ReporteFilters => ({
  query: '',
  estado: 'Todos',
  tipoAsignacion: 'Todos',
  fechaDesde: '',
  fechaHasta: ''
});
