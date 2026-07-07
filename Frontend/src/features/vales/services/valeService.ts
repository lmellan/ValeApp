import api from '../../../shared/services/api';
import { ValeDisponible, ValeValidationResult } from '../../../shared/types/api';
import { VALE_API_URL } from '../../../shared/config/api';

export const getFuncionarioVales = async (idFuncionario: number): Promise<ValeDisponible[]> => {
  const response = await api.get<ValeDisponible[]>(`${VALE_API_URL}/funcionarios/${idFuncionario}/vales`);
  return response.data;
};

export const getAvailableVales = async (idFuncionario: number): Promise<ValeDisponible[]> => {
  const response = await api.get<ValeDisponible[]>(`${VALE_API_URL}/funcionarios/${idFuncionario}/vales-disponibles`);
  return response.data;
};

export const getValeById = async (idVale: string): Promise<ValeDisponible> => {
  const response = await api.get<ValeDisponible>(`${VALE_API_URL}/vales/${idVale}`);
  return response.data;
};

export const validateVale = async (idVale: string, cajeroId: number): Promise<ValeValidationResult> => {
  const response = await api.post<ValeValidationResult>(
    `${VALE_API_URL}/vales/${idVale}/validar`,
    {},
    { headers: { 'x-usuario-id': String(cajeroId) } }
  );
  return response.data;
};

export const canjearVale = async (idVale: string, cajeroId: number): Promise<{ mensaje: string }> => {
  const response = await api.post<{ mensaje: string }>(
    `${VALE_API_URL}/vales/${idVale}/canjear`,
    {},
    { headers: { 'x-usuario-id': String(cajeroId) } }
  );
  return response.data;
};

export const printVale = async (idVale: string, idFuncionario: number): Promise<{ mensaje: string; fechaHoraImpresion: string }> => {
  const response = await api.post<{ mensaje: string; fechaHoraImpresion: string }>(
    `${VALE_API_URL}/vales/${idVale}/imprimir`,
    { idFuncionario },
    { headers: { 'x-funcionario-id': String(idFuncionario) } }
  );
  return response.data;
};
