import api from '../../../shared/services/api';
import { VALE_API_URL } from '../../../shared/config/api';
import { ValeAdicional, ValeAdicionalPayload } from '../types';

export const getValesAdicionales = async (): Promise<ValeAdicional[]> => {
  const response = await api.get<ValeAdicional[]>(`${VALE_API_URL}/administrador/vales`);
  return response.data;
};

export const createValeAdicional = async (payload: ValeAdicionalPayload): Promise<void> => {
  await api.post(`${VALE_API_URL}/administrador/vales`, payload);
};

export const updateValeAdicional = async (idVale: string, payload: ValeAdicionalPayload): Promise<ValeAdicional> => {
  const response = await api.put<ValeAdicional>(`${VALE_API_URL}/administrador/vales/${idVale}`, payload);
  return response.data;
};
