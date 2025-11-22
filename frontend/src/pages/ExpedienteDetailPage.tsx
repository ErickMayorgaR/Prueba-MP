import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Expediente, Indicio } from '../types';
import { toast } from 'react-toastify';
import {
  PlusIcon,
  CheckIcon,
  XIcon,
  EditIcon,
  TrashIcon,
  FileIcon,
} from '../components/Icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ExpedienteDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expediente, setExpediente] = useState<Expediente | null>(null);
  const [indicios, setIndicios] = useState<Indicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIndicioModal, setShowIndicioModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [editingIndicio, setEditingIndicio] = useState<Indicio | null>(null);

  useEffect(() => {
    if (id) {
      loadExpediente();
      loadIndicios();
    }
  }, [id]);

  const loadExpediente = async () => {
    try {
      const response = await apiService.getExpedienteById(Number(id));
      setExpediente(response.data);
    } catch (error: any) {
      toast.error('Error al cargar expediente');
      navigate('/expedientes');
    } finally {
      setLoading(false);
    }
  };

  const loadIndicios = async () => {
    try {
      const response = await apiService.getIndiciosByExpediente(Number(id));
      setIndicios(response.data);
    } catch (error: any) {
      toast.error('Error al cargar indicios');
    }
  };

  const handleSubmitExpediente = async () => {
    if (!window.confirm('¿Está seguro de enviar el expediente a revisión?'))
      return;

    try {
      await apiService.submitExpediente(Number(id));
      toast.success('Expediente enviado a revisión');
      loadExpediente();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message ||
          'Error al enviar expediente a revisión'
      );
    }
  };

  const handleApproveExpediente = async () => {
    if (!window.confirm('¿Está seguro de aprobar este expediente?')) return;

    try {
      await apiService.approveExpediente(Number(id));
      toast.success('Expediente aprobado exitosamente');
      loadExpediente();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al aprobar expediente'
      );
    }
  };

  const handleReopenExpediente = async () => {
    if (!window.confirm('¿Está seguro de reabrir este expediente?')) return;

    try {
      await apiService.reopenExpediente(Number(id));
      toast.success('Expediente reabierto exitosamente');
      loadExpediente();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al reabrir expediente'
      );
    }
  };

  const handleDeleteIndicio = async (indicioId: number) => {
    if (!window.confirm('¿Está seguro de eliminar este indicio?')) return;

    try {
      await apiService.deleteIndicio(indicioId);
      toast.success('Indicio eliminado exitosamente');
      loadIndicios();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar indicio');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!expediente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Expediente no encontrado</p>
        <Link to="/expedientes" className="btn-primary mt-4">
          Volver a Expedientes
        </Link>
      </div>
    );
  }

  const canEdit =
    expediente.status === 'EN_REGISTRO' &&
    (user?.role === 'TECNICO' || user?.role === 'ADMIN');
  const canSubmit =
    expediente.status === 'EN_REGISTRO' &&
    indicios.length > 0 &&
    (user?.role === 'TECNICO' || user?.role === 'ADMIN');
  const canReview =
    expediente.status === 'EN_REVISION' &&
    (user?.role === 'COORDINADOR' || user?.role === 'ADMIN');
  const canReopen =
    expediente.status === 'RECHAZADO' &&
    (user?.role === 'TECNICO' || user?.role === 'ADMIN');

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

    const config = statusConfig[status] || { label: status, className: 'badge' };
    return <span className={config.className}>{config.label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {expediente.case_number}
            </h1>
            {getStatusBadge(expediente.status)}
          </div>
          <p className="text-gray-600 mt-1">{expediente.title}</p>
        </div>
        <Link to="/expedientes" className="btn-secondary">
          Volver
        </Link>
      </div>

      {/* Expediente Info */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">
          Información del Expediente
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Descripción
            </label>
            <p className="mt-1 text-gray-900">
              {expediente.description || 'No especificada'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Ubicación
            </label>
            <p className="mt-1 text-gray-900">
              {expediente.location || 'No especificada'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Fecha del Incidente
            </label>
            <p className="mt-1 text-gray-900">
              {expediente.incident_date
                ? format(new Date(expediente.incident_date), 'dd/MM/yyyy', {
                    locale: es,
                  })
                : 'No especificada'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Técnico Asignado
            </label>
            <p className="mt-1 text-gray-900">
              {expediente.technician?.full_name || 'No asignado'}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Fecha de Registro
            </label>
            <p className="mt-1 text-gray-900">
              {format(
                new Date(expediente.created_at),
                "dd/MM/yyyy 'a las' HH:mm",
                { locale: es }
              )}
            </p>
          </div>
          {expediente.coordinator && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Coordinador Revisor
              </label>
              <p className="mt-1 text-gray-900">
                {expediente.coordinator.full_name}
              </p>
            </div>
          )}
          {expediente.rejection_reason && (
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-danger-600">
                Motivo de Rechazo
              </label>
              <p className="mt-1 text-danger-900 bg-danger-50 p-3 rounded-lg">
                {expediente.rejection_reason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Indicios Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            Indicios ({indicios.length})
          </h2>
          {canEdit && (
            <button
              onClick={() => {
                setEditingIndicio(null);
                setShowIndicioModal(true);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <PlusIcon size={20} />
              <span>Agregar Indicio</span>
            </button>
          )}
        </div>

        {indicios.length === 0 ? (
          <div className="text-center py-12">
            <FileIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">
              No se han registrado indicios para este expediente
            </p>
            {canEdit && (
              <button
                onClick={() => setShowIndicioModal(true)}
                className="btn-primary mt-4"
              >
                Agregar Primer Indicio
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-gray-50">
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Color</th>
                  <th>Tamaño</th>
                  <th>Peso</th>
                  <th>Ubicación</th>
                  <th>Técnico</th>
                  {canEdit && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {indicios.map((indicio) => (
                  <tr key={indicio.id} className="hover:bg-gray-50">
                    <td className="font-medium text-primary-600">
                      {indicio.code}
                    </td>
                    <td>
                      <div className="max-w-xs truncate">
                        {indicio.description}
                      </div>
                    </td>
                    <td>{indicio.color || '-'}</td>
                    <td>{indicio.size || '-'}</td>
                    <td>{indicio.weight || '-'}</td>
                    <td>{indicio.location || '-'}</td>
                    <td className="text-sm">
                      {indicio.technician?.full_name || 'N/A'}
                    </td>
                    {canEdit && (
                      <td>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingIndicio(indicio);
                              setShowIndicioModal(true);
                            }}
                            className="text-primary-600 hover:text-primary-700"
                            title="Editar"
                          >
                            <EditIcon size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteIndicio(indicio.id)}
                            className="text-danger-600 hover:text-danger-700"
                            title="Eliminar"
                          >
                            <TrashIcon size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Acciones</h2>
        <div className="flex flex-wrap gap-3">
          {canSubmit && (
            <button onClick={handleSubmitExpediente} className="btn-primary">
              <CheckIcon className="inline mr-2" size={18} />
              Enviar a Revisión
            </button>
          )}
          {canReview && (
            <>
              <button
                onClick={handleApproveExpediente}
                className="btn-success"
              >
                <CheckIcon className="inline mr-2" size={18} />
                Aprobar Expediente
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="btn-danger"
              >
                <XIcon className="inline mr-2" size={18} />
                Rechazar Expediente
              </button>
            </>
          )}
          {canReopen && (
            <button onClick={handleReopenExpediente} className="btn-primary">
              Reabrir Expediente
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {showIndicioModal && (
        <IndicioModal
          expedienteId={Number(id)}
          indicio={editingIndicio}
          onClose={() => {
            setShowIndicioModal(false);
            setEditingIndicio(null);
          }}
          onSuccess={() => {
            setShowIndicioModal(false);
            setEditingIndicio(null);
            loadIndicios();
          }}
        />
      )}

      {showRejectModal && (
        <RejectModal
          expedienteId={Number(id)}
          onClose={() => setShowRejectModal(false)}
          onSuccess={() => {
            setShowRejectModal(false);
            loadExpediente();
          }}
        />
      )}
    </div>
  );
};

// Indicio Modal Component
interface IndicioModalProps {
  expedienteId: number;
  indicio: Indicio | null;
  onClose: () => void;
  onSuccess: () => void;
}

const IndicioModal: React.FC<IndicioModalProps> = ({
  expedienteId,
  indicio,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    code: indicio?.code || '',
    description: indicio?.description || '',
    color: indicio?.color || '',
    size: indicio?.size || '',
    weight: indicio?.weight || '',
    location: indicio?.location || '',
    observations: indicio?.observations || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (indicio) {
        await apiService.updateIndicio(indicio.id, formData);
        toast.success('Indicio actualizado exitosamente');
      } else {
        await apiService.createIndicio({
          ...formData,
          expediente_id: expedienteId,
        });
        toast.success('Indicio creado exitosamente');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al guardar indicio'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {indicio ? 'Editar Indicio' : 'Agregar Indicio'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Código *</label>
              <input
                type="text"
                className="input"
                required
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="Ej: IND-001"
              />
            </div>
            <div>
              <label className="label">Descripción *</label>
              <textarea
                className="input"
                required
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Descripción del indicio..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Color</label>
                <input
                  type="text"
                  className="input"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  placeholder="Ej: Rojo"
                />
              </div>
              <div>
                <label className="label">Tamaño</label>
                <input
                  type="text"
                  className="input"
                  value={formData.size}
                  onChange={(e) =>
                    setFormData({ ...formData, size: e.target.value })
                  }
                  placeholder="Ej: 10x5 cm"
                />
              </div>
              <div>
                <label className="label">Peso</label>
                <input
                  type="text"
                  className="input"
                  value={formData.weight}
                  onChange={(e) =>
                    setFormData({ ...formData, weight: e.target.value })
                  }
                  placeholder="Ej: 250 g"
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
                  placeholder="Ubicación del indicio"
                />
              </div>
            </div>
            <div>
              <label className="label">Observaciones</label>
              <textarea
                className="input"
                rows={3}
                value={formData.observations}
                onChange={(e) =>
                  setFormData({ ...formData, observations: e.target.value })
                }
                placeholder="Observaciones adicionales..."
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
                {isSubmitting
                  ? 'Guardando...'
                  : indicio
                  ? 'Actualizar Indicio'
                  : 'Crear Indicio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reject Modal Component
interface RejectModalProps {
  expedienteId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const RejectModal: React.FC<RejectModalProps> = ({
  expedienteId,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error('Debe proporcionar un motivo de rechazo');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.rejectExpediente(expedienteId, reason);
      toast.success('Expediente rechazado');
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al rechazar expediente'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-danger-600">
            Rechazar Expediente
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">
                Motivo de Rechazo *
              </label>
              <textarea
                className="input"
                required
                rows={5}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explique detalladamente el motivo del rechazo..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Este motivo será visible para el técnico asignado
              </p>
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
                className="btn-danger"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Rechazando...' : 'Rechazar Expediente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpedienteDetailPage;