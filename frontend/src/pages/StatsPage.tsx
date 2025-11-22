import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { GeneralStats, TechnicianStats } from '../types';
import { toast } from 'react-toastify';
// ← ELIMINADO: import { format } from 'date-fns'; (no se usaba)
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatsPage: React.FC = () => {
  const [generalStats, setGeneralStats] = useState<GeneralStats | null>(null);
  const [technicianStats, setTechnicianStats] = useState<TechnicianStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    loadStats();
  }, [filters]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [generalResponse, technicianResponse] = await Promise.all([
        apiService.getGeneralStats(filters.start_date, filters.end_date),
        apiService.getStatsByTechnician(filters.start_date, filters.end_date),
      ]);
      setGeneralStats(generalResponse.data);
      setTechnicianStats(technicianResponse.data);
    } catch (error: any) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'];

  const pieData = generalStats
    ? [
        { name: 'En Registro', value: generalStats.en_registro },
        { name: 'En Revisión', value: generalStats.en_revision },
        { name: 'Aprobados', value: generalStats.aprobados },
        { name: 'Rechazados', value: generalStats.rechazados },
      ]
    : [];

  const barData = technicianStats.map((tech) => ({
    name: tech.full_name.split(' ')[0],
    Aprobados: tech.aprobados,
    Rechazados: tech.rechazados,
    'En Registro': tech.en_registro,
    'En Revisión': tech.en_revision,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando estadísticas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Estadísticas y Reportes
        </h1>
        <p className="text-gray-600 mt-1">
          Análisis y métricas del sistema DICRI
        </p>
      </div>

      {/* Filters */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Filtros de Fecha</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Fecha Inicial</label>
            <input
              type="date"
              className="input"
              value={filters.start_date}
              onChange={(e) =>
                handleFilterChange('start_date', e.target.value)
              }
            />
          </div>
          <div>
            <label className="label">Fecha Final</label>
            <input
              type="date"
              className="input"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
            />
          </div>
        </div>
        {(filters.start_date || filters.end_date) && (
          <button
            onClick={() => setFilters({ start_date: '', end_date: '' })}
            className="btn-secondary mt-4"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* General Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-primary-50">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Expedientes
          </h3>
          <p className="text-4xl font-bold text-primary-700">
            {generalStats?.total_expedientes || 0}
          </p>
        </div>
        <div className="card bg-secondary-50">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Expedientes Aprobados
          </h3>
          <p className="text-4xl font-bold text-secondary-700">
            {generalStats?.aprobados || 0}
          </p>
          {generalStats && generalStats.total_expedientes > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              {(
                (generalStats.aprobados / generalStats.total_expedientes) *
                100
              ).toFixed(1)}
              % del total
            </p>
          )}
        </div>
        <div className="card bg-yellow-50">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Total Indicios Registrados
          </h3>
          <p className="text-4xl font-bold text-yellow-700">
            {generalStats?.total_indicios || 0}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Status Distribution */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">
            Distribución por Estado
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((_, index) => ( 
                  // ← CORREGIDO: cambié 'entry' por '_' porque no se usaba
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Technicians Performance */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">
            Rendimiento por Técnico
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Aprobados" fill="#10B981" />
              <Bar dataKey="Rechazados" fill="#EF4444" />
              <Bar dataKey="En Registro" fill="#F59E0B" />
              <Bar dataKey="En Revisión" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Technician Stats Table */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">
          Estadísticas Detalladas por Técnico
        </h2>
        <div className="overflow-x-auto">
          <table className="table">
            <thead className="bg-gray-50">
              <tr>
                <th>Técnico</th>
                <th>Total Expedientes</th>
                <th>Aprobados</th>
                <th>Rechazados</th>
                <th>En Registro</th>
                <th>En Revisión</th>
                <th>Total Indicios</th>
                <th>Tasa de Aprobación</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {technicianStats.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    No hay datos disponibles
                  </td>
                </tr>
              ) : (
                technicianStats.map((tech) => {
                  const totalProcessed = tech.aprobados + tech.rechazados;
                  const approvalRate =
                    totalProcessed > 0
                      ? (tech.aprobados / totalProcessed) * 100
                      : 0;

                  return (
                    <tr key={tech.id} className="hover:bg-gray-50">
                      <td className="font-medium">{tech.full_name}</td>
                      <td>{tech.total_expedientes}</td>
                      <td>
                        <span className="badge-success">{tech.aprobados}</span>
                      </td>
                      <td>
                        <span className="badge-danger">{tech.rechazados}</span>
                      </td>
                      <td>
                        <span className="badge-warning">
                          {tech.en_registro}
                        </span>
                      </td>
                      <td>
                        <span className="badge bg-blue-100 text-blue-800">
                          {tech.en_revision}
                        </span>
                      </td>
                      <td>{tech.total_indicios}</td>
                      <td>
                        <span
                          className={
                            approvalRate >= 75
                              ? 'text-secondary-600 font-semibold'
                              : approvalRate >= 50
                              ? 'text-yellow-600 font-semibold'
                              : 'text-danger-600 font-semibold'
                          }
                        >
                          {totalProcessed > 0
                            ? `${approvalRate.toFixed(1)}%`
                            : 'N/A'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="card bg-blue-50">
        <h2 className="text-lg font-semibold mb-4 text-blue-900">Resumen</h2>
        <div className="space-y-2 text-sm text-blue-900">
          <p>
            • Total de expedientes en el sistema:{' '}
            <strong>{generalStats?.total_expedientes || 0}</strong>
          </p>
          <p>
            • Expedientes pendientes de revisión:{' '}
            <strong>{generalStats?.en_revision || 0}</strong>
          </p>
          <p>
            • Expedientes aprobados:{' '}
            <strong>{generalStats?.aprobados || 0}</strong> (
            {generalStats && generalStats.total_expedientes > 0
              ? (
                  (generalStats.aprobados / generalStats.total_expedientes) *
                  100
                ).toFixed(1)
              : 0}
            %)
          </p>
          <p>
            • Total de indicios registrados:{' '}
            <strong>{generalStats?.total_indicios || 0}</strong>
          </p>
          <p>
            • Promedio de indicios por expediente:{' '}
            <strong>
              {generalStats && generalStats.total_expedientes > 0
                ? (
                    generalStats.total_indicios / generalStats.total_expedientes
                  ).toFixed(1)
                : 0}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;