import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
