export interface User {
  id: number;
  username: string;
  email: string;
  role: 'ADMIN' | 'TECNICO' | 'COORDINADOR';
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface Expediente {
  id: number;
  case_number: string;
  title: string;
  description?: string;
  status: 'EN_REGISTRO' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO';
  location?: string;
  incident_date?: string;
  technician_id: number;
  coordinator_id?: number;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  reviewed_at?: string;
  approved_at?: string;
  technician?: User;
  coordinator?: User;
  indicios?: Indicio[];
}

export interface Indicio {
  id: number;
  expediente_id: number;
  code: string;
  description: string;
  color?: string;
  size?: string;
  weight?: string;
  location?: string;
  observations?: string;
  technician_id: number;
  created_at: string;
  updated_at: string;
  technician?: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    accessToken: string;  
    refreshToken: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: string[];
}

export interface GeneralStats {
  total_expedientes: number;
  en_registro: number;
  en_revision: number;
  aprobados: number;
  rechazados: number;
  total_indicios: number;
}

export interface TechnicianStats {
  id: number;
  full_name: string;
  total_expedientes: number;
  aprobados: number;
  rechazados: number;
  en_registro: number;
  en_revision: number;
  total_indicios: number;
}
