import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, LoginCredentials } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('accessToken');
      const savedUser = localStorage.getItem('user');
      
      console.log('LoadUser - Token:', token);
      console.log('LoadUser - SavedUser:', savedUser);
      
      if (token && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error loading user from localStorage:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

 const login = async (credentials: LoginCredentials) => {
  try {
    console.log('1. Iniciando login con:', credentials.email);
    const response = await apiService.login(credentials);
    
    // Backend retorna: { user, accessToken, refreshToken }
    const { accessToken, refreshToken, user: userData } = response.data; // ← accessToken
    
    if (!accessToken || !userData) {
      throw new Error('Respuesta del servidor incompleta');
    }
    
    // Guarda en localStorage
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Verifica inmediatamente
    console.log('5. Token guardado:', localStorage.getItem('accessToken'));
    console.log('6. User guardado:', localStorage.getItem('user'));
    
    // Actualiza el estado
    setUser(userData);
    console.log('7. Estado actualizado, isAuthenticated:', !!userData);
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};


  const logout = () => {
    console.log('Logout ejecutado');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};