import api from '../../../shared/services/api';
import { ValeDisponible, ValeValidationResult } from '../../../shared/types/api';
import { VALE_API_URL } from '../../../shared/config/api';

export const getAvailableVales = async (idFuncionario: number): Promise<ValeDisponible[]> => {
  const response = await api.get<ValeDisponible[]>(`${VALE_API_URL}/funcionarios/${idFuncionario}/vales-disponibles`);
  return response.data;
};

export const getValeById = async (idVale: string): Promise<ValeDisponible> => {
  const response = await api.get<ValeDisponible>(`${VALE_API_URL}/vales/${idVale}`);
  return response.data;
};

export const validateVale = async (idVale: string): Promise<ValeValidationResult> => {
  const response = await api.post<{ mensaje: string; valido: boolean }>(`${VALE_API_URL}/vales/${idVale}/validar`);
  return response.data;
};
