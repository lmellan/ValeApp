import api from '../../../shared/services/api';
import { CONFIGURACION_API_URL } from '../../../shared/config/api';
import { TipoComensal, TipoComensalPayload } from '../types';

const toApiPayload = (payload: TipoComensalPayload) => ({
  ...payload,
  cantidadVales: 1
});

export const getTiposComensal = async (): Promise<TipoComensal[]> => {
  const response = await api.get<TipoComensal[]>(`${CONFIGURACION_API_URL}/tipos-comensal`);
  return response.data;
};

export const createTipoComensal = async (payload: TipoComensalPayload): Promise<void> => {
  await api.post(`${CONFIGURACION_API_URL}/tipos-comensal`, toApiPayload(payload));
};

export const updateTipoComensal = async (idTipoComensal: number, payload: TipoComensalPayload): Promise<TipoComensal> => {
  const response = await api.put<TipoComensal>(`${CONFIGURACION_API_URL}/tipos-comensal/${idTipoComensal}`, toApiPayload(payload));
  return response.data;
}; 