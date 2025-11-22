import axios, { AxiosInstance, AxiosError } from 'axios';
import { AuthResponse, LoginCredentials, ApiResponse } from '../types';

const API_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL, // ← CORREGIDO: era API_BASE_URL
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

async login(credentials: LoginCredentials): Promise<AuthResponse> {
  console.log('API: Enviando petición login...');
  const response = await this.api.post<AuthResponse>('/auth/login', credentials);
  console.log('API: Respuesta recibida:', response);
  console.log('API: response.data:', response.data);
  return response.data;
}

  async getCurrentUser(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/auth/me');
    return response.data;
  }

  async getExpedientes(filters?: any): Promise<ApiResponse<any>> {
    const response = await this.api.get('/expedientes', { params: filters });
    return response.data;
  }

  async createExpediente(data: any): Promise<ApiResponse<any>> {
    const response = await this.api.post('/expedientes', data);
    return response.data;
  }

  async getExpedienteById(id: number): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/expedientes/${id}`);
    return response.data;
  }

  async updateExpediente(id: number, data: any): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/expedientes/${id}`, data);
    return response.data;
  }

  async submitExpediente(id: number): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/expedientes/${id}/submit`);
    return response.data;
  }

  async approveExpediente(id: number): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/expedientes/${id}/approve`);
    return response.data;
  }

  async rejectExpediente(id: number, reason: string): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/expedientes/${id}/reject`, {
      rejection_reason: reason,
    });
    return response.data;
  }

  async reopenExpediente(id: number): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/expedientes/${id}/reopen`);
    return response.data;
  }

  async getIndiciosByExpediente(expedienteId: number): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/indicios/expediente/${expedienteId}`);
    return response.data;
  }

  async createIndicio(data: any): Promise<ApiResponse<any>> {
    const response = await this.api.post('/indicios', data);
    return response.data;
  }

  async updateIndicio(id: number, data: any): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/indicios/${id}`, data);
    return response.data;
  }

  async deleteIndicio(id: number): Promise<ApiResponse<any>> {
    const response = await this.api.delete(`/indicios/${id}`);
    return response.data;
  }

  async getGeneralStats(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const response = await this.api.get('/stats/general', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  }

  async getStatsByTechnician(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    const response = await this.api.get('/stats/technicians', {
      params: { start_date: startDate, end_date: endDate },
    });
    return response.data;
  }

  async getUsers(role?: string): Promise<ApiResponse<any>> {
    const response = await this.api.get('/users', { params: { role } });
    return response.data;
  }

  async createUser(data: any): Promise<ApiResponse<any>> {
    const response = await this.api.post('/users', data);
    return response.data;
  }

  async updateUser(id: number, data: any): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: number): Promise<ApiResponse<any>> {
    const response = await this.api.delete(`/users/${id}`);
    return response.data;
  }
}

export const apiService = new ApiService();