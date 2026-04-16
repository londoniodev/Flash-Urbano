import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  // TODO: Implementar autenticación real con nuestro backend
  const hasToken = true;

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
