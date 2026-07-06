export interface User {
  id: number;
  nombre: string;
  correo: string;
  codigo?: string;
  rol: string;
  id_tipo_comensal?: number | null;
  tipo_comensal?: string;
  turno?: string;
  activo: boolean;
  contrasena?: string;
}

export interface ValeDisponible {
  idVale: string;
  idFuncionario?: number | null;
  idServicio?: number | null;
  estadoUso?: string | null;
  expirado?: boolean;
  tipoAsignacion?: string | null;
  valor?: number | null;
  fechaUso?: string | null;
  horaInicioValidez?: string | null;
  horaFinValidez?: string | null;
  fechaExpiracion?: string | null;
  motivo?: string | null;
  impreso?: boolean;
  fechaHoraImpresion?: string | null;
  idCajeroCanje?: number | null;
  fechaHoraCanje?: string | null;
  createdAt?: string | null;
}

export interface ValeValidationResult {
  mensaje: string;
  valido: boolean;
}

