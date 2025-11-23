import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { GeneralStats } from '../types';
import { FolderIcon, FileIcon, CheckIcon, XIcon, UsersIcon, ChartIcon } from '../components/Icons';
import { toast } from 'react-toastify';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<GeneralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user?.role]);

  const loadStats = async () => {
    if (user?.role === 'ADMIN' || user?.role === 'COORDINADOR') {
      try {
        const response = await apiService.getGeneralStats();
        setStats(response.data);
      } catch (error: any) {
        toast.error('Error al cargar estadísticas');
      } finally {
        setLoading(false);
      }
    } else {
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

  if (user?.role === 'TECNICO') {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido, {user?.full_name} - Técnico
          </p>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              to="/expedientes?action=create"
              className="group relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="relative z-10">
                <FolderIcon className="mx-auto mb-3" size={48} />
                <p className="font-semibold text-lg">Crear Expediente</p>
                <p className="text-sm text-primary-100 mt-1">Registrar nuevo caso</p>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>

            <Link
              to="/expedientes"
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="relative z-10">
                <FileIcon className="mx-auto mb-3" size={48} />
                <p className="font-semibold text-lg">Ver Expedientes</p>
                <p className="text-sm text-blue-100 mt-1">Consultar mis casos</p>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
          </div>
        </div>

        <div className="card bg-blue-50">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Guía de Uso
          </h2>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="text-primary-600 font-bold mr-2">1.</span>
              <p>Crea un nuevo expediente con la información del caso</p>
            </div>
            <div className="flex items-start">
              <span className="text-primary-600 font-bold mr-2">2.</span>
              <p>Registra todos los indicios encontrados en la escena</p>
            </div>
            <div className="flex items-start">
              <span className="text-primary-600 font-bold mr-2">3.</span>
              <p>Envía el expediente a revisión cuando esté completo</p>
            </div>
            <div className="flex items-start">
              <span className="text-primary-600 font-bold mr-2">4.</span>
              <p>Si es rechazado, puedes reabrirlo para hacer correcciones</p>
            </div>
          </div>
        </div>

        <div className="card border-l-4 border-yellow-500 bg-yellow-50">
          <h3 className="font-semibold text-gray-900 mb-2">
            Recuerda
          </h3>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>• Documenta todos los detalles de cada indicio</li>
            <li>• Verifica la información antes de enviar a revisión</li>
            <li>• Los expedientes deben tener al menos un indicio</li>
          </ul>
        </div>
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Bienvenido, {user?.full_name} -{' '}
          {user?.role === 'ADMIN' && 'Administrador'}
          {user?.role === 'COORDINADOR' && 'Coordinador'}
        </p>
      </div>

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

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {user?.role === 'ADMIN' && (
            <Link
              to="/expedientes?action=create"
              className="group relative overflow-hidden bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg p-5 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="relative z-10 text-center">
                <FolderIcon className="mx-auto mb-2" size={32} />
                <p className="font-semibold">Crear Expediente</p>
                <p className="text-xs text-primary-100 mt-1">Registrar nuevo caso</p>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
          )}

          <Link
            to="/expedientes"
            className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-5 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="relative z-10 text-center">
              <FolderIcon className="mx-auto mb-2" size={32} />
              <p className="font-semibold">Ver Expedientes</p>
              <p className="text-xs text-blue-100 mt-1">Consultar casos</p>
            </div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </Link>

          <Link
            to="/stats"
            className="group relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-5 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <div className="relative z-10 text-center">
              <ChartIcon className="mx-auto mb-2" size={32} />
              <p className="font-semibold">Ver Estadísticas</p>
              <p className="text-xs text-green-100 mt-1">Reportes detallados</p>
            </div>
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
          </Link>

          {user?.role === 'ADMIN' && (
            <Link
              to="/users"
              className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-5 text-white shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <div className="relative z-10 text-center">
                <UsersIcon className="mx-auto mb-2" size={32} />
                <p className="font-semibold">Gestionar Usuarios</p>
                <p className="text-xs text-purple-100 mt-1">Administrar accesos</p>
              </div>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>
          )}
        </div>
      </div>

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