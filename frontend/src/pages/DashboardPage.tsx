import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { GeneralStats } from '../types';
import { FolderIcon, FileIcon, CheckIcon, XIcon } from '../components/Icons';
import { toast } from 'react-toastify';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiService.getGeneralStats();
      setStats(response.data);
    } catch (error: any) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Expedientes',
      value: stats?.total_expedientes || 0,
      icon: FolderIcon,
      color: 'bg-primary-100 text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      title: 'En Registro',
      value: stats?.en_registro || 0,
      icon: FileIcon,
      color: 'bg-yellow-100 text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'En Revisión',
      value: stats?.en_revision || 0,
      icon: FileIcon,
      color: 'bg-blue-100 text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Aprobados',
      value: stats?.aprobados || 0,
      icon: CheckIcon,
      color: 'bg-secondary-100 text-secondary-600',
      bgColor: 'bg-secondary-50',
    },
    {
      title: 'Rechazados',
      value: stats?.rechazados || 0,
      icon: XIcon,
      color: 'bg-danger-100 text-danger-600',
      bgColor: 'bg-danger-50',
    },
    {
      title: 'Total Indicios',
      value: stats?.total_indicios || 0,
      icon: FileIcon,
      color: 'bg-purple-100 text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Bienvenido, {user?.full_name} -{' '}
          {user?.role === 'ADMIN' && 'Administrador'}
          {user?.role === 'TECNICO' && 'Técnico'}
          {user?.role === 'COORDINADOR' && 'Coordinador'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`card ${stat.bgColor}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {user?.role === 'TECNICO' && (
            <Link
              to="/expedientes?action=create"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <FolderIcon className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="font-medium text-gray-900">Crear Expediente</p>
              <p className="text-sm text-gray-500">Registrar nuevo caso</p>
            </Link>
          )}

          <Link
            to="/expedientes"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <FolderIcon className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="font-medium text-gray-900">Ver Expedientes</p>
            <p className="text-sm text-gray-500">Consultar casos</p>
          </Link>

          {(user?.role === 'ADMIN' || user?.role === 'COORDINADOR') && (
            <Link
              to="/stats"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <CheckIcon className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="font-medium text-gray-900">Ver Estadísticas</p>
              <p className="text-sm text-gray-500">Reportes y análisis</p>
            </Link>
          )}

          {user?.role === 'ADMIN' && (
            <Link
              to="/users"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
            >
              <CheckIcon className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="font-medium text-gray-900">Gestionar Usuarios</p>
              <p className="text-sm text-gray-500">Administrar accesos</p>
            </Link>
          )}
        </div>
      </div>

      {/* Recent Activity or Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Información del Sistema
        </h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            • Los técnicos pueden crear y registrar expedientes con sus indicios
          </p>
          <p>
            • Una vez completado el registro, el expediente debe ser enviado a
            revisión
          </p>
          <p>
            • Los coordinadores revisan y aprueban o rechazan los expedientes
          </p>
          <p>
            • Los expedientes rechazados pueden ser reabiertos y corregidos por
            los técnicos
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;