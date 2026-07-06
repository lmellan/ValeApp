import api from '../../../shared/services/api';
import { User } from '../../../shared/types/api';
import { USER_API_URL } from '../../../shared/config/api';

export const loginUsuario = async (identificador: string, contrasena: string): Promise<User> => {
  const response = await api.post<User>(`${USER_API_URL}/usuarios/login`, { identificador, contrasena });
  return response.data;
};
