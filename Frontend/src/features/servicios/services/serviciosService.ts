import api from '../../../shared/services/api';
import { CASINO_API_URL, CONFIGURACION_API_URL } from '../../../shared/config/api';
import { Casino, ServicioAlimentacion, ServicioPayload, Turno } from '../types';

export const getCasinos = async (): Promise<Casino[]> => {
  const response = await api.get<Casino[]>(`${CASINO_API_URL}/casinos`);
  return response.data;
};

export const getServicios = async (): Promise<ServicioAlimentacion[]> => {
  const response = await api.get<ServicioAlimentacion[]>(`${CASINO_API_URL}/servicios-alimentacion`);
  return response.data;
};

export const createServicio = async (payload: ServicioPayload): Promise<number> => {
  const response = await api.post<{ mensaje: string; idServicio: number }>(
    `${CASINO_API_URL}/servicios-alimentacion`,
    payload
  );
  return response.data.idServicio;
};

export const updateServicio = async (idServicio: number, payload: ServicioPayload): Promise<ServicioAlimentacion> => {
  const response = await api.put<ServicioAlimentacion>(
    `${CASINO_API_URL}/servicios-alimentacion/${idServicio}`,
    payload
  );
  return response.data;
};

export const getTurnos = async (): Promise<Turno[]> => {
  const response = await api.get<Turno[]>(`${CONFIGURACION_API_URL}/turnos`);
  return response.data;
};

export const getServiciosPorTurno = async (idTurno: number): Promise<number[]> => {
  const response = await api.get<{ idTurno: string; serviciosHabilitados: number[] }>(
    `${CONFIGURACION_API_URL}/turnos/${idTurno}/servicios`
  );
  return response.data.serviciosHabilitados;
};

export const agregarServicioATurno = async (idTurno: number, idServicio: number): Promise<void> => {
  await api.post(`${CONFIGURACION_API_URL}/turnos/${idTurno}/servicios`, { idServicio });
};

export const quitarServicioDeTurno = async (idTurno: number, idServicio: number): Promise<void> => {
  await api.delete(`${CONFIGURACION_API_URL}/turnos/${idTurno}/servicios/${idServicio}`);
};
