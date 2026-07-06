import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { User } from '../../../shared/types/api';
import { loginUsuario } from '../services/authService';

const AUTH_STORAGE_KEY = 'valeapp:user';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  role?: string;
  login: (correo: string, contrasena: string) => Promise<User | null>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getStoredUser = () => {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [loading, setLoading] = useState(false);

  const login = async (correo: string, contrasena: string) => {
    setLoading(true);
    try {
      const usuario = await loginUsuario(correo, contrasena);
      setUser(usuario);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(usuario));
      return usuario;
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), role: user?.rol, login, logout }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
