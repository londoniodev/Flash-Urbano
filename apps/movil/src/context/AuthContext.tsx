import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from '../services/AuthService';

interface AuthContextType {
  user: any | null;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar sesión al iniciar la app
    AuthService.getUserData()
      .then((data) => {
        setUser(data);
      })
      .catch((error) => {
        console.error('Error cargando la sesión:', error);
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const signIn = async (email: string, pass: string) => {
    const data = await AuthService.login(email, pass);
    setUser(data.user);
  };

  const signOut = async () => {
    await AuthService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
