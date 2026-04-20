import { useEffect, useState } from 'react';
import { ArrowRightLeft, Plus, Package, PackageMinus, RefreshCw, Sliders } from 'lucide-react';
import { api } from '../lib/axios';
import { useAuth } from '../context/AuthProvider';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';

interface Product {
  id: string;
  sku: string;
  name: string;
  companyId: string;
  companyName: string;
}

interface Hub {
  id: string;
  name: string;
}

type MovementType = 'INGRESO' | 'SALIDA' | 'AJUSTE' | 'TRASLADO';

export default function Operations() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [hubs, setHubs] = useState<Hub[]>([]);

  // Form state
  const [productId, setProductId] = useState('');
  const [movementType, setMovementType] = useState<MovementType>('INGRESO');
  const [quantity, setQuantity] = useState<number>(1);
  const [fromHubId, setFromHubId] = useState('');
  const [toHubId, setToHubId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  // Recent movements
  const [recentMovements, setRecentMovements] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchHubs();
    fetchRecent();
    if (user?.role === 'ADMIN' || user?.role === 'OPERATOR') {
      fetchCompanies();
    }
  }, []);

  const fetchCompanies = async () => {
    try {
      const { data } = await api.get('/companies');
      setCompanies(data);
    } catch (e) { console.error(e); }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data);
      if (data.length > 0 && !productId) setProductId(data[0].id);
    } catch (e) { console.error(e); }
  };

  const fetchHubs = async () => {
    try {
      const { data } = await api.get('/hubs');
      setHubs(data);
      
      if (data.length > 0) {
        // Preferencias de hub: asignado al usuario > primero de la lista
        const defaultHubId = user?.hubId || data[0].id;
        if (!fromHubId) setFromHubId(defaultHubId);
        if (!toHubId) setToHubId(defaultHubId);
      }
    } catch (e) { console.error(e); }
  };

  const fetchRecent = async () => {
    try {
      const { data } = await api.get('/inventory/movements');
      setRecentMovements(data.slice(0, 10));
    } catch (e) { console.error(e); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const payload: any = {
        productId,
        movementType,
        quantity,
        notes: notes || undefined,
      };

      // Assign hubs based on movement type
      if (movementType === 'INGRESO') {
        payload.toHubId = toHubId;
      } else if (movementType === 'SALIDA') {
        payload.fromHubId = fromHubId;
      } else if (movementType === 'TRASLADO') {
        payload.fromHubId = fromHubId;
        payload.toHubId = toHubId;
      } else if (movementType === 'AJUSTE') {
        payload.toHubId = toHubId;
      }

      await api.post('/inventory/move', payload);
      setSuccess(`Movimiento de ${quantity} unidades registrado exitosamente`);
      setQuantity(1);
      setNotes('');
      fetchRecent();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrar movimiento');
    } finally {
      setLoading(false);
    }
  };

  const movementTypes: { value: MovementType; label: string; icon: any; color: string }[] = [
    { value: 'INGRESO', label: 'Ingreso', icon: Package, color: 'border-emerald-500 text-emerald-400' },
    { value: 'SALIDA', label: 'Salida', icon: PackageMinus, color: 'border-red-500 text-red-400' },
    { value: 'TRASLADO', label: 'Traslado', icon: RefreshCw, color: 'border-blue-500 text-blue-400' },
    { value: 'AJUSTE', label: 'Ajuste', icon: Sliders, color: 'border-zinc-500 text-zinc-400' },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full bg-zinc-950 p-6 text-zinc-100">

      <header className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-800">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-zinc-100">
          <ArrowRightLeft size={24} className="text-primary" />
          Operaciones de Inventario
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FORMULARIO */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Registrar Movimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Filtro de Compañía (solo para operadores) */}
              {(user?.role === 'ADMIN' || user?.role === 'OPERATOR') && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-zinc-400">Filtrar por Cliente</label>
                  <select
                    className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={selectedCompanyId}
                    onChange={(e) => setSelectedCompanyId(e.target.value)}
                  >
                    <option value="all">Todos los clientes</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tipo de Movimiento */}
              <div className="flex flex-col gap-2">
                <label className="text-sm text-zinc-400">Tipo de Movimiento</label>
                <div className="grid grid-cols-2 gap-2">
                  {movementTypes.map((mt) => (
                    <button
                      key={mt.value}
                      type="button"
                      onClick={() => setMovementType(mt.value)}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                        movementType === mt.value
                          ? `${mt.color} bg-zinc-800`
                          : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'
                      }`}
                    >
                      <mt.icon size={16} />
                      {mt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Producto */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">Producto (SKU)</label>
                <select
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                >
                  <option value="">Selecciona un producto...</option>
                  {products
                    .filter(p => selectedCompanyId === 'all' || p.companyId === selectedCompanyId)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.companyName}] {p.sku} — {p.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Cantidad */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">Cantidad</label>
                <input
                  type="number"
                  min={1}
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              {/* Sede Origen (SALIDA, TRASLADO) */}
              {(movementType === 'SALIDA' || movementType === 'TRASLADO') && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-zinc-400">Sede Origen</label>
                  <select
                    className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={fromHubId}
                    onChange={(e) => setFromHubId(e.target.value)}
                    required
                  >
                    {hubs.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Sede Destino (INGRESO, TRASLADO, AJUSTE) */}
              {(movementType === 'INGRESO' || movementType === 'TRASLADO' || movementType === 'AJUSTE') && (
                <div className="flex flex-col gap-1">
                  <label className="text-sm text-zinc-400">
                    {movementType === 'TRASLADO' ? 'Sede Destino' : 'Sede / Bodega'}
                  </label>
                  <select
                    className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    value={toHubId}
                    onChange={(e) => setToHubId(e.target.value)}
                    required
                  >
                    {hubs.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Notas */}
              <div className="flex flex-col gap-1">
                <label className="text-sm text-zinc-400">Notas (opcional)</label>
                <textarea
                  className="bg-zinc-950 border border-zinc-800 rounded-md py-2 px-3 text-sm text-zinc-100 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Observaciones del movimiento..."
                />
              </div>

              {error && <p className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 rounded-md p-3">{error}</p>}
              {success && <p className="text-emerald-400 text-sm bg-emerald-950/30 border border-emerald-900/50 rounded-md p-3">{success}</p>}

              <Button type="submit" disabled={loading || products.length === 0} className="w-full mt-2">
                <Plus size={16} className="mr-2" />
                {loading ? 'Registrando...' : 'Registrar Movimiento'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* MOVIMIENTOS RECIENTES */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Últimos Movimientos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
            {recentMovements.length === 0 ? (
              <p className="text-zinc-500 text-center py-8">Sin movimientos registrados aún</p>
            ) : recentMovements.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between border-b border-zinc-800/50 pb-3">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      m.movementType === 'INGRESO' ? 'border-emerald-500 text-emerald-400' :
                      m.movementType === 'SALIDA' ? 'border-red-500 text-red-400' :
                      m.movementType === 'TRASLADO' ? 'border-blue-500 text-blue-400' :
                      'border-zinc-500 text-zinc-400'
                    }>
                      {m.movementType}
                    </Badge>
                    <span className="font-mono text-sm text-primary">{m.product?.sku}</span>
                    <span className="text-[10px] text-zinc-600 bg-zinc-800 px-1 rounded uppercase tracking-wider">
                      {m.product?.companyName}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <span className="text-xs text-zinc-500">{m.product?.name}</span>
                    <div className="flex items-center gap-1.5 text-[10px] font-medium">
                      {m.movementType === 'INGRESO' && <span className="text-emerald-500">Bodega: {m.toHubName}</span>}
                      {m.movementType === 'SALIDA' && <span className="text-red-500">Bodega: {m.fromHubName}</span>}
                      {m.movementType === 'TRASLADO' && <span className="text-blue-500">{m.fromHubName} → {m.toHubName}</span>}
                      {m.movementType === 'AJUSTE' && <span className="text-zinc-500">Bodega: {m.toHubName || m.fromHubName}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`font-mono font-bold text-sm ${m.movementType === 'SALIDA' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {m.movementType === 'SALIDA' ? '-' : '+'}{m.quantity}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {new Date(m.createdAt).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
