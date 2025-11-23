import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { User } from '../types';
import { toast } from 'react-toastify';
import { PlusIcon, EditIcon, TrashIcon, UsersIcon } from '../components/Icons';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await apiService.getUsers(roleFilter);
      setUsers(response.data);
    } catch (error: any) {
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('¿Está seguro de eliminar este usuario?')) return;

    try {
      await apiService.deleteUser(userId);
      toast.success('Usuario eliminado exitosamente');
      loadUsers();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al eliminar usuario'
      );
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; className: string }> = {
      ADMIN: {
        label: 'Administrador',
        className: 'badge bg-purple-100 text-purple-800',
      },
      COORDINADOR: {
        label: 'Coordinador',
        className: 'badge bg-blue-100 text-blue-800',
      },
      TECNICO: {
        label: 'Técnico',
        className: 'badge bg-primary-100 text-primary-800',
      },
    };

    const config = roleConfig[role] || { label: role, className: 'badge' };
    return <span className={config.className}>{config.label}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 mt-1">
            Administrar usuarios del sistema DICRI
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setShowUserModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <PlusIcon size={20} />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Filtrar por Rol</label>
            <select
              className="input"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Todos los roles</option>
              <option value="ADMIN">Administrador</option>
              <option value="COORDINADOR">Coordinador</option>
              <option value="TECNICO">Técnico</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users List */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">No se encontraron usuarios</p>
            <button
              onClick={() => setShowUserModal(true)}
              className="btn-primary mt-4"
            >
              Crear Primer Usuario
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead className="bg-gray-50">
                <tr>
                  <th>Nombre Completo</th>
                  <th>Usuario</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Fecha de Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="font-medium">{user.full_name}</td>
                    <td>{user.username}</td>
                    <td className="text-sm text-gray-600">{user.email}</td>
                    <td>{getRoleBadge(user.role)}</td>
                    <td>
                      {user.is_active ? (
                        <span className="badge-success">Activo</span>
                      ) : (
                        <span className="badge-danger">Inactivo</span>
                      )}
                    </td>
                    <td className="text-sm text-gray-500">
                      {format(new Date(user.created_at), 'dd/MM/yyyy', {
                        locale: es,
                      })}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setShowUserModal(true);
                          }}
                          className="text-primary-600 hover:text-primary-700"
                          title="Editar"
                        >
                          <EditIcon size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-danger-600 hover:text-danger-700"
                          title="Eliminar"
                        >
                          <TrashIcon size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
          onSuccess={() => {
            setShowUserModal(false);
            setEditingUser(null);
            loadUsers();
          }}
        />
      )}
    </div>
  );
};

// User Modal Component
interface UserModalProps {
  user: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    full_name: user?.full_name || '',
    role: user?.role || 'TECNICO',
    password: '',
    is_active: user?.is_active ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!user && !formData.password) {
      toast.error('La contraseña es requerida para usuarios nuevos');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSend: any = { ...formData };
      if (!dataToSend.password) {
        delete dataToSend.password;
      }

      if (user) {
        await apiService.updateUser(user.id, dataToSend);
        toast.success('Usuario actualizado exitosamente');
      } else {
        await apiService.createUser(dataToSend);
        toast.success('Usuario creado exitosamente');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al guardar usuario'
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
            {user ? 'Editar Usuario' : 'Crear Usuario'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre Completo *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className="label">Nombre de Usuario *</label>
                <input
                  type="text"
                  className="input"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder="jperez"
                />
              </div>
            </div>

            <div>
              <label className="label">Correo Electrónico *</label>
              <input
                type="email"
                className="input"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="jperez@mp.gob.gt"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Rol *</label>
                <select
                  className="input"
                  required
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as 'ADMIN' | 'COORDINADOR' | 'TECNICO',
                    })
                  }
                >
                  <option value="TECNICO">Técnico</option>
                  <option value="COORDINADOR">Coordinador</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>
              <div>
                <label className="label">Estado</label>
                <select
                  className="input"
                  value={formData.is_active ? 'true' : 'false'}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: e.target.value === 'true',
                    })
                  }
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="label">
                Contraseña {user ? '(dejar en blanco para no cambiar)' : '*'}
              </label>
              <input
                type="password"
                className="input"
                required={!user}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="••••••••"
                minLength={6}
              />
              <p className="text-xs text-gray-500 mt-1">
                La contraseña debe tener al menos 8 caracteres
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
                className="btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? 'Guardando...'
                  : user
                  ? 'Actualizar Usuario'
                  : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;