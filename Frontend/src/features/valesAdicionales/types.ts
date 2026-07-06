export type ValeAdicional = {
  idVale: string;
  idFuncionario: number;
  idServicio: number;
  estadoUso: 'NO_UTILIZADO' | 'UTILIZADO' | string;
  expirado: boolean;
  tipoAsignacion: 'ADMINISTRATIVA' | string;
  valor: number;
  fechaUso: string;
  horaInicioValidez: string;
  horaFinValidez: string;
  fechaExpiracion: string;
  motivo: string;
  impreso?: boolean;
  fechaHoraImpresion?: string | null;
  idCajeroCanje?: number | null;
  fechaHoraCanje?: string | null;
  createdAt?: string | null;
};

export type ValeAdicionalPayload = {
  idVale?: string;
  idFuncionario: number | '';
  idServicio: number | '';
  valor?: number | '';
  fechaUso: string;
  horaInicioValidez: string;
  horaFinValidez: string;
  fechaExpiracion: string;
  motivo: string;
  cantidadVales?: number;
};

export type ValeAdicionalFilters = {
  query: string;
  servicio: string;
  estado: string;
};

export const createEmptyValeAdicionalDraft = (): ValeAdicionalPayload => ({
  idFuncionario: '',
  idServicio: '',
  fechaUso: new Date().toISOString().slice(0, 10),
  horaInicioValidez: '00:00',
  horaFinValidez: '23:59',
  fechaExpiracion: new Date().toISOString().slice(0, 10),
  motivo: '',
  cantidadVales: 1
});




