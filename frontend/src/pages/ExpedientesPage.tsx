import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Expediente } from '../types';
import { toast } from 'react-toastify';
import { PlusIcon, SearchIcon, FolderIcon } from '../components/Icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ExpedientesPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expedientes, setExpedientes] = useState<Expediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    search: searchParams.get('search') || '',
  });

  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      setShowCreateModal(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, []);

  useEffect(() => {
    loadExpedientes();
  }, [filters]);

  const loadExpedientes = async () => {
    setLoading(true);
    try {
      const response = await apiService.getExpedientes(filters);
      setExpedientes(response.data);
    } catch (error: any) {
      toast.error('Error al cargar expedientes');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; className: string }
    > = {
      EN_REGISTRO: {
        label: 'En Registro',
        className: 'badge-warning',
      },
      EN_REVISION: {
        label: 'En Revisión',
        className: 'badge bg-blue-100 text-blue-800',
      },
      APROBADO: {
        label: 'Aprobado',
        className: 'badge-success',
      },
      RECHAZADO: {
        label: 'Rechazado',
        className: 'badge-danger',
      },
    };

    const config = statusConfig[status] || {
      label: status,
      className: 'badge',
    };

    return <span className={config.className}>{config.label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expedientes</h1>
          <p className="text-gray-600 mt-1">
            Gestión de expedientes de investigación criminalística
          </p>
        </div>
        {user?.role === 'TECNICO' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon size={20} />
            <span>Nuevo Expediente</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Estado</label>
            <select
              className="input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos los estados</option>
              <option value="EN_REGISTRO">En Registro</option>
              <option value="EN_REVISION">En Revisión</option>
              <option value="APROBADO">Aprobado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label">Buscar</label>
            <div className="relative">
              <SearchIcon
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                className="input pl-10"
                placeholder="Buscar por número de caso o título..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expedientes List */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : expedientes.length === 0 ? (
          <div className="text-center py-12">
            <FolderIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No se encontraron expedientes</p>
            {user?.role === 'TECNICO' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary mt-4"
              >
                Crear Primer Expediente
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-gray-50">
                <tr>
                  <th>No. Caso</th>
                  <th>Título</th>
                  <th>Estado</th>
                  <th>Técnico</th>
                  <th>Fecha de Registro</th>
                  <th>Indicios</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expedientes.map((expediente) => (
                  <tr key={expediente.id} className="hover:bg-gray-50">
                    <td className="font-medium text-primary-600">
                      {expediente.case_number}
                    </td>
                    <td>
                      <div className="max-w-xs truncate">
                        {expediente.title}
                      </div>
                    </td>
                    <td>{getStatusBadge(expediente.status)}</td>
                    <td>
                      <div className="text-sm">
                        {expediente.technician?.full_name || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-500">
                        {format(
                          new Date(expediente.created_at),
                          "dd/MM/yyyy 'a las' HH:mm",
                          { locale: es }
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge">
                        {expediente.indicios?.length || 0}
                      </span>
                    </td>
                    <td>
                      <Link
                        to={`/expedientes/${expediente.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Ver Detalles
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateExpedienteModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadExpedientes();
          }}
        />
      )}
    </div>
  );
};

// Create Expediente Modal Component
interface CreateExpedienteModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateExpedienteModal: React.FC<CreateExpedienteModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    case_number: '',
    title: '',
    description: '',
    location: '',
    incident_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.createExpediente(formData);
      toast.success('Expediente creado exitosamente');
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al crear expediente'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Crear Nuevo Expediente</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Número de Caso *</label>
              <input
                type="text"
                className="input"
                required
                value={formData.case_number}
                onChange={(e) =>
                  setFormData({ ...formData, case_number: e.target.value })
                }
                placeholder="Ej: DICRI-2024-001"
              />
            </div>
            <div>
              <label className="label">Título *</label>
              <input
                type="text"
                className="input"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Título del expediente"
              />
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea
                className="input"
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción del caso..."
              />
            </div>
            <div>
              <label className="label">Ubicación</label>
              <input
                type="text"
                className="input"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="Ubicación del incidente"
              />
            </div>
            <div>
              <label className="label">Fecha del Incidente</label>
              <input
                type="datetime-local"
                className="input"
                value={formData.incident_date}
                onChange={(e) =>
                  setFormData({ ...formData, incident_date: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creando...' : 'Crear Expediente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpedientesPage;