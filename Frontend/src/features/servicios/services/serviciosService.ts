import api from '../../../shared/services/api';
import { CASINO_API_URL } from '../../../shared/config/api';
import { Casino, ServicioAlimentacion, ServicioPayload } from '../types';

export const getCasinos = async (): Promise<Casino[]> => {
  const response = await api.get<Casino[]>(`${CASINO_API_URL}/casinos`);
  return response.data;
};

export const getServicios = async (): Promise<ServicioAlimentacion[]> => {
  const response = await api.get<ServicioAlimentacion[]>(`${CASINO_API_URL}/servicios-alimentacion`);
  return response.data;
};

export const createServicio = async (payload: ServicioPayload): Promise<void> => {
  await api.post(`${CASINO_API_URL}/servicios-alimentacion`, payload);
};

export const updateServicio = async (idServicio: number, payload: ServicioPayload): Promise<ServicioAlimentacion> => {
  const response = await api.put<ServicioAlimentacion>(`${CASINO_API_URL}/servicios-alimentacion/${idServicio}`, payload);
  return response.data;
};
