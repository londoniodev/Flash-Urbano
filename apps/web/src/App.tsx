import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import LiveDashboard from './pages/LiveDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta base: Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Página de Login Pública */}
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard Protegido */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <LiveDashboard />
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
