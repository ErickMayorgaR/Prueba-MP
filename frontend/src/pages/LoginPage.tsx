import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { EyeIcon, EyeOffIcon } from '../components/Icons';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Correo electrónico inválido')
    .required('El correo es requerido'),
  password: Yup.string()
    .min(6, 'La contraseña debe tener al menos 8 caracteres')
    .required('La contraseña es requerida'),
});

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && loginSuccess) {
      navigate('/');
    }
  }, [isAuthenticated, loginSuccess, navigate]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        await login(values);
        toast.success('¡Inicio de sesión exitoso!');
        setLoginSuccess(true);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || 'Error al iniciar sesión';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center mb-6">
            <img
              src="/mp-logo.png"
              alt="Ministerio Público"
              className="h-20"
            />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Sistema DICRI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Dirección de Investigación Criminalística
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            Ministerio Público de Guatemala
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="label">
                Correo Electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className={`input ${
                  formik.touched.email && formik.errors.email
                    ? 'border-danger-500'
                    : ''
                }`}
                placeholder="usuario@dicri.gob.gt"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-xs text-danger-600">
                  {formik.errors.email}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="label">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`input pr-10 ${
                    formik.touched.password && formik.errors.password
                      ? 'border-danger-500'
                      : ''
                  }`}
                  placeholder="••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOffIcon size={20} />
                  ) : (
                    <EyeIcon size={20} />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-xs text-danger-600">
                  {formik.errors.password}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-gray-200 pt-6">
          <p className="text-xs text-center text-gray-500">
            Para obtener acceso al sistema, contacte al administrador.
          </p>
          <div className="mt-4 text-xs text-center text-gray-400">
            <p>Usuarios de prueba:</p>
            <p className="mt-2">
              <strong>Admin:</strong> admin@dicri.gob.gt / Admin123!
            </p>
            <p>
              <strong>Coordinador:</strong> coordinador1@dicri.gob.gt / Coord123!
            </p>
            <p>
              <strong>Técnico:</strong> tecnico1@dicri.gob.gt / Tecnico123!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;