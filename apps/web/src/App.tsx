import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import LiveDashboard from './pages/LiveDashboard';
import Inventory from './pages/Inventory';
import Products from './pages/Products';
import Operations from './pages/Operations';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta base: Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Páginas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Páginas Protegidas con Layout de Navegación */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <LiveDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Inventory />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/products" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/operations" 
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Operations />
              </DashboardLayout>
            </ProtectedRoute>
          } 
        />

        {/* Catch-all: redirigir al landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
