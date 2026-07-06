export type ValorizacionVale = {
  idValorizacion: number;
  idTipoComensal: number;
  idServicio: number;
  valor: number;
};

export type ValorizacionValePayload = {
  idTipoComensal: number | '';
  idServicio: number | '';
  valor: number | '';
};

export type ValorizacionFilters = {
  query: string;
  tipo: string;
  servicio: string;
};

export const createEmptyValorizacionDraft = (): ValorizacionValePayload => ({
  idTipoComensal: '',
  idServicio: '',
  valor: ''
});