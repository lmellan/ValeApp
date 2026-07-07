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
  fechaExpiracion: string;
  motivo: string;
  cantidadVales?: number;
};

export type ValeAdicionalFilters = {
  query: string;
  servicio: string;
  estado: string;
};

const getTodayInput = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60000;
  return new Date(today.getTime() - offset).toISOString().slice(0, 10);
};

export const createEmptyValeAdicionalDraft = (): ValeAdicionalPayload => ({
  idFuncionario: '',
  idServicio: '',
  fechaUso: getTodayInput(),
  fechaExpiracion: getTodayInput(),
  motivo: '',
  cantidadVales: 1
});
