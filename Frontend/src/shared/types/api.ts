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
  id_vale?: number;
  id_vale_disponible?: number;
  id_servicio?: number;
  id_funcionario?: number;
  codigo?: string;
  servicio?: string;
  casino?: string;
  estado?: string;
  valor?: number;
  vigencia?: string;
  fecha_emision?: string;
}

export interface ValeValidationResult {
  mensaje: string;
  valido: boolean;
}

