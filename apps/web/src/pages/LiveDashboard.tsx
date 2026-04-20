import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, ArrowDownRight, Smartphone } from 'lucide-react';
import InstallAppModal from '../components/InstallAppModal';
import { api } from '../lib/axios';
import { useAuth } from '../context/AuthProvider';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

// Interfaz para la tabla alineada con el modelo real en Postgres API
export interface KardexEntry {
  id: string;
  productId: string;
  movementType: 'INGRESO' | 'SALIDA' | 'AJUSTE' | 'TRASLADO';
  quantity: number;
  operatorId: string;
  createdAt: string;
  product?: { sku: string; name: string; companyName?: string };
  fromHubName?: string;
  toHubName?: string;
}

export default function LiveDashboard() {
  const [entries, setEntries] = useState<KardexEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout } = useAuth();

  const [todayIngress, setTodayIngress] = useState<number>(0);
  const [todayEgress, setTodayEgress] = useState<number>(0);
  const [activeOperators, setActiveOperators] = useState<number>(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: movements } = await api.get('/inventory/movements');
        setEntries(movements);

        // Simulamos métricas basándonos en los datos que llegan
        const ingresos = movements.filter((m: any) => m.movementType === 'INGRESO').reduce((acc: number, curr: any) => acc + curr.quantity, 0);
        const salidas = movements.filter((m: any) => m.movementType === 'SALIDA').reduce((acc: number, curr: any) => acc + curr.quantity, 0);
        
        // Obtener IDs de operadores únicos
        const ops = new Set(movements.map((m: any) => m.operatorId));
        
        setTodayIngress(ingresos);
        setTodayEgress(salidas);
        setActiveOperators(ops.size);
      } catch (e) {
        console.error("Error fetching live dashboard", e);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000); // Polling cada 5s para "Live"
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-zinc-950 p-6 overflow-hidden text-zinc-100">
      
      {/* HEADER */}
      <header className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
        <h1 className="flex items-center gap-2 text-2xl font-bold italic tracking-tight text-zinc-100">
          <Activity size={24} className="text-primary animate-pulse"/>
          Kardex de Inventario Live
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-medium px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Fabrik API WMS
          </div>
          <Button variant="outline" onClick={() => setIsModalOpen(true)} className="gap-2 border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300">
            <Smartphone size={16} />
            Instalar App
          </Button>
          <Button variant="destructive" onClick={logout}>
            Cerrar Sesión
          </Button>
        </div>
      </header>

      {/* METRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Unidades Ingresadas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold flex items-center gap-2">
              {todayIngress.toLocaleString()} 
              <ArrowDownRight className="text-emerald-500 h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Unidades Despachadas Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold flex items-center gap-2">
              {todayEgress.toLocaleString()} 
              <ArrowUpRight className="text-primary h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Operadores Activos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {activeOperators}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABLA DE MOVIMIENTOS */}
      <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl rounded-t-xl overflow-y-auto">
        <Table>
          <TableHeader className="bg-zinc-950 sticky top-0 z-10 border-b border-zinc-800">
            <TableRow className="hover:bg-transparent border-zinc-800">
              <TableHead className="text-zinc-500 w-[150px]">TIMESTAMP</TableHead>
              <TableHead className="text-zinc-500">CLIENTE</TableHead>
              <TableHead className="text-zinc-500">PRODUCTO (SKU)</TableHead>
              <TableHead className="text-zinc-500">SEDE / FLUJO</TableHead>
              <TableHead className="text-zinc-500">MOVIMIENTO</TableHead>
              <TableHead className="text-zinc-500 text-right">CANT.</TableHead>
              <TableHead className="text-zinc-500 text-right">OPERADOR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-zinc-500">
                  Esperando eventos de kardex en vivo...
                </TableCell>
              </TableRow>
            ) : entries.map((entry) => (
              <TableRow key={entry.id} className="border-zinc-800/50 hover:bg-zinc-800/50 transition-colors">
                <TableCell className="font-mono text-xs text-zinc-400 whitespace-nowrap">
                  {new Date(entry.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                </TableCell>
                <TableCell className="text-sm font-bold text-zinc-100">
                  {entry.product?.companyName || '—'}
                </TableCell>
                <TableCell className="font-mono text-sm break-all font-medium text-zinc-200">
                  <div className="flex flex-col">
                    <span>{entry.product?.sku || entry.productId}</span>
                    <span className="text-xs text-zinc-500">{entry.product?.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-2 text-xs font-medium">
                      {entry.movementType === 'INGRESO' && (
                        <div className="flex items-center gap-1.5 text-emerald-400">
                           <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-400">ENTRA A:</span>
                           {entry.toHubName}
                        </div>
                      )}
                      {entry.movementType === 'SALIDA' && (
                        <div className="flex items-center gap-1.5 text-red-400">
                           <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-400">SALE DE:</span>
                           {entry.fromHubName}
                        </div>
                      )}
                      {entry.movementType === 'TRASLADO' && (
                        <div className="flex items-center gap-1.5 text-orange-400">
                           <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-400">DESDE:</span>
                           {entry.fromHubName}
                           <span className="text-zinc-600">→</span>
                           {entry.toHubName}
                        </div>
                      )}
                      {entry.movementType === 'AJUSTE' && (
                        <div className="flex items-center gap-1.5 text-blue-400">
                           <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-[10px] text-zinc-400">EN:</span>
                           {entry.toHubName || entry.fromHubName}
                        </div>
                      )}
                   </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" 
                    className={
                      entry.movementType === 'INGRESO' ? 'border-emerald-500 text-emerald-400 w-[85px] justify-center' :
                      entry.movementType === 'SALIDA' ? 'border-red-500 text-red-400 w-[85px] justify-center' :
                      entry.movementType === 'TRASLADO' ? 'border-orange-500 text-orange-400 w-[85px] justify-center' :
                      'border-blue-500 text-blue-400 w-[85px] justify-center'
                    }>
                    {entry.movementType}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-sm font-bold text-zinc-200 text-right">
                  {entry.movementType === 'SALIDA' ? '-' : '+'}{entry.quantity}
                </TableCell>
                <TableCell className="font-mono text-xs text-zinc-500 text-right whitespace-nowrap">
                  {entry.operatorId.slice(0, 8)}...
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <InstallAppModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
