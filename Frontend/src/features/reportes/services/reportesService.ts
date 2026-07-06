import api from '../../../shared/services/api';
import { VALE_API_URL } from '../../../shared/config/api';
import { ReporteVale } from '../types';

export const getTodosLosVales = async (): Promise<ReporteVale[]> => {
  const response = await api.get<ReporteVale[]>(`${VALE_API_URL}/vales/todos`);
  return response.data;
};
