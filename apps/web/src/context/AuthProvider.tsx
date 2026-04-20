import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  companyId?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeJwt(token: string): any | null {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('access_token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Decode user info from JWT if we don't already have it
      if (!user) {
        const payload = decodeJwt(token);
        if (payload) {
          setUser({
            id: payload.sub,
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            role: payload.role,
            companyId: payload.companyId,
          });
        }
      }
      setIsLoading(false);
    } else {
      setUser(null);
      setIsLoading(false);
    }

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, [token]);

  const login = (newToken: string, userObj: User) => {
    localStorage.setItem('access_token', newToken);
    setToken(newToken);
    setUser(userObj);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
