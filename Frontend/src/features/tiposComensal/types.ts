export type TipoComensal = {
  idTipoComensal: number;
  nombre: string;
  descripcion?: string | null;
  cantidadVales?: number;
  emisionMultiple: boolean;
  color: string;
};

export type TipoComensalPayload = {
  nombre: string;
  descripcion?: string | null;
  emisionMultiple: boolean;
  color: string;
};
