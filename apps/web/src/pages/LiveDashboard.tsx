import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, ArrowDownRight, Smartphone } from 'lucide-react';
import InstallAppModal from '../components/InstallAppModal';
import './LiveDashboard.css';

// Interfaz para la tabla alineada con el modelo real en Postgres API
export interface KardexEntry {
  id: string;
  code: string;
  type: 'INGRESO' | 'SALIDA' | 'TRASLADO';
  operator_id: string;
  client_id?: string | null;
  created_at: string;
}

export default function LiveDashboard() {
  const [entries, setEntries] = useState<KardexEntry[]>([]);
  const [lastInsertedId, setLastInsertedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States para métricas
  const [todayIngress, setTodayIngress] = useState<number>(0);
  const [todayEgress, setTodayEgress] = useState<number>(0);
  const [activeOperators, setActiveOperators] = useState<number>(0);

  useEffect(() => {
    // TODO: Implementar lógica real con nuestro backend API
    const fetchInitialLogs = async () => {
      console.log('Fetching logs...');
      setEntries([]);
      setLastInsertedId(null);
    };

    const fetchTodayMetrics = async () => {
      console.log('Fetching metrics...');
      setTodayIngress(0);
      setTodayEgress(0);
      setActiveOperators(0);
    };

    fetchInitialLogs();
    fetchTodayMetrics();

    // TODO: Reemplazar Supabase real-time por websockets o polling de la API
  }, []);

  return (
    <div className="dashboard-layout">
      
      {/* HEADER MINIMALISTA */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          <Activity size={20} className="icon-main"/>
          Kardex Live Stream
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="status-badge">
            <span className="dot online"></span> Conectado a Fabrik
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="install-button-nav"
          >
            <Smartphone size={16} />
            Instalar App
          </button>
          <button 
            onClick={() => {
              // TODO: Implementar logout real
              console.log('Logout');
            }}
            className="logout-button-nav"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* MÉTRICAS REALES DE SUPABASE */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">Ingresos de Hoy</span>
          <span className="metric-value">
             {todayIngress.toLocaleString()} <ArrowDownRight size={16} className="text-ingress"/>
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Salidas de Hoy</span>
          <span className="metric-value">
             {todayEgress.toLocaleString()} <ArrowUpRight size={16} className="text-egress"/>
          </span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Operadores Activos</span>
          <span className="metric-value">{activeOperators}</span>
        </div>
      </div>

      {/* TABLA LIMPIA Y DE ALTO CONTRASTE */}
      <div className="table-container">
        <table className="kardex-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Código / Paquete</th>
              <th>Operación</th>
              <th>ID Empleado</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr 
                key={entry.id} 
                className={entry.id === lastInsertedId ? 'row-flash' : ''}
              >
                <td className="text-muted">
                  {new Date(entry.created_at).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                </td>
                <td className="font-mono">{entry.code}</td>
                <td>
                   <span className={`badge ${entry.type.toLowerCase()}`}>
                     {entry.type}
                   </span>
                </td>
                <td className="text-muted font-mono">{entry.operator_id.slice(0, 8)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* MODAL DE DESCARGA */}
      <InstallAppModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
      
    </div>
  );
}
