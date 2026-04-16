import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Activity, ArrowUpRight, ArrowDownRight, Smartphone } from 'lucide-react';
import InstallAppModal from '../components/InstallAppModal';
import './LiveDashboard.css';

// Interfaz para la tabla alineada con el modelo real en Supabase
export interface KardexEntry {
  id: string;
  code: string;
  type: 'INGRESO' | 'SALIDA';
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
    // 1. Cargar el historial inicial (ej: los últimos 50)
    const fetchInitialLogs = async () => {
      const { data } = await supabase
        .from('kardex_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
        
      if (data) setEntries(data);
    };

    // 2. Cargar las métricas calculadas del día desde Supabase
    const fetchTodayMetrics = async () => {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('kardex_entries')
        .select('type, operator_id')
        .gte('created_at', startOfDay.toISOString());

      if (data) {
        const ingress = data.filter(e => e.type === 'INGRESO').length;
        const egress = data.filter(e => e.type === 'SALIDA').length;
        const uniqueOperators = new Set(data.map(e => e.operator_id)).size;

        setTodayIngress(ingress);
        setTodayEgress(egress);
        setActiveOperators(uniqueOperators);
      }
    };

    fetchInitialLogs();
    fetchTodayMetrics();

    // 3. Suscripción estricta al canal de PostgreSQL
    const channel = supabase.channel('kardex_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'kardex_entries' },
        (payload) => {
          const newEntry = payload.new as KardexEntry;
          
          // Inserción inmutable arriba de la lista
          setEntries((prev) => [newEntry, ...prev].slice(0, 50));
          
          // Actualizar métricas dinámicamente con las entradas más recientes del día
          fetchTodayMetrics();
          
          // Trigger visual del destello de éxito
          setLastInsertedId(newEntry.id);
          setTimeout(() => setLastInsertedId(null), 300);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
            onClick={() => supabase.auth.signOut()}
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
