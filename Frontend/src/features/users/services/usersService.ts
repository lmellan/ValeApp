import api from '../../../shared/services/api';
import { User } from '../../../shared/types/api';
import { USER_API_URL } from '../../../shared/config/api';

export const getUserById = async (idUsuario: number): Promise<User> => {
  const response = await api.get<User>(`${USER_API_URL}/usuarios/${idUsuario}`);
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get<User[]>(`${USER_API_URL}/usuarios`);
  return response.data;
};

export const updateUsuario = async (idUsuario: number, datos: Partial<User>): Promise<User> => {
  const response = await api.put<User>(`${USER_API_URL}/usuarios/${idUsuario}`, datos);
  return response.data;
};

export const crearUsuario = async (datos: Partial<User>): Promise<User> => {
  const response = await api.post<User>(`${USER_API_URL}/usuarios`, datos as any);
  return response.data;
};
