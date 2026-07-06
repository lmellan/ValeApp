import api from '../../../shared/services/api';
import { CONFIGURACION_API_URL } from '../../../shared/config/api';
import { ValorizacionVale, ValorizacionValePayload } from '../types';

export const getValorizacionesVale = async (): Promise<ValorizacionVale[]> => {
  const response = await api.get<ValorizacionVale[]>(`${CONFIGURACION_API_URL}/valorizaciones-vales`);
  return response.data;
};

export const saveValorizacionVale = async (payload: ValorizacionValePayload): Promise<ValorizacionVale> => {
  const response = await api.post<ValorizacionVale>(`${CONFIGURACION_API_URL}/valorizaciones-vales`, payload);
  return response.data;
};
