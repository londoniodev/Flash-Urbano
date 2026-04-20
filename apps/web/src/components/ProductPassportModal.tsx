import { useEffect, useState } from 'react';
import { X, Download, PackageSearch, ArrowDownRight, ArrowUpRight, ArrowRightLeft, Settings2 } from 'lucide-react';
import { api } from '../lib/axios';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { exportToExcel } from '../utils/exportExcel';

interface PassportData {
  product: {
    id: string;
    sku: string;
    name: string;
    category?: string;
    brand?: string;
    imageUrl?: string;
    barcode?: string;
    description?: string;
    companyId: string;
    companyName: string;
  };
  totalUnits: number;
  stockBySede: {
    hubId: string;
    hubName: string;
    hubCity: string;
    quantity: number;
  }[];
  movements: {
    id: string;
    movementType: string;
    quantity: number;
    notes?: string;
    createdAt: string;
    operatorId: string;
  }[];
}

interface Props {
  productId: string | null;
  onClose: () => void;
}

export default function ProductPassportModal({ productId, onClose }: Props) {
  const [data, setData] = useState<PassportData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    api.get(`/products/${productId}/passport`)
      .then((res) => setData(res.data))
      .catch((e) => console.error('Error loading passport', e))
      .finally(() => setLoading(false));
  }, [productId]);

  if (!productId) return null;

  const movementIcon = (type: string) => {
    switch (type) {
      case 'INGRESO': return <ArrowDownRight size={14} className="text-emerald-400" />;
      case 'SALIDA': return <ArrowUpRight size={14} className="text-red-400" />;
      case 'TRASLADO': return <ArrowRightLeft size={14} className="text-blue-400" />;
      default: return <Settings2 size={14} className="text-zinc-400" />;
    }
  };

  const movementColor = (type: string) => {
    switch (type) {
      case 'INGRESO': return 'border-emerald-500 text-emerald-400';
      case 'SALIDA': return 'border-red-500 text-red-400';
      case 'TRASLADO': return 'border-blue-500 text-blue-400';
      default: return 'border-zinc-500 text-zinc-400';
    }
  };

  const handleExport = () => {
    if (!data) return;
    const rows = data.movements.map(m => ({
      Tipo: m.movementType,
      Cantidad: m.quantity,
      Fecha: new Date(m.createdAt).toLocaleString(),
      Notas: m.notes || '',
      Operador: m.operatorId,
    }));
    exportToExcel(rows, `historial_${data.product.sku}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <PackageSearch size={20} className="text-primary" />
            <h2 className="text-lg font-bold text-zinc-100">Hoja de Vida del Producto</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : data ? (
          <div className="flex-1 overflow-y-auto">
            {/* Producto Info */}
            <div className="px-6 py-5 border-b border-zinc-800">
              <div className="flex gap-5">
                {data.product.imageUrl ? (
                  <img src={data.product.imageUrl} alt={data.product.name} className="w-20 h-20 rounded-xl object-cover border border-zinc-700" />
                ) : (
                  <div className="w-20 h-20 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-600 text-2xl font-bold">
                    {data.product.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-primary font-bold">{data.product.sku}</span>
                    {data.product.barcode && <span className="text-xs text-zinc-600">({data.product.barcode})</span>}
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 truncate">{data.product.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded uppercase">
                      {data.product.companyName}
                    </span>
                    {data.product.category && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{data.product.category}</span>}
                    {data.product.brand && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{data.product.brand}</span>}
                  </div>
                  {data.product.description && <p className="text-sm text-zinc-500 mt-2 line-clamp-2">{data.product.description}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-3xl font-bold text-primary">{data.totalUnits}</p>
                  <p className="text-xs text-zinc-500">unidades totales</p>
                </div>
              </div>
            </div>

            {/* Stock por Sede */}
            <div className="px-6 py-4 border-b border-zinc-800">
              <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Stock por Sede</h4>
              {data.stockBySede.length === 0 ? (
                <p className="text-sm text-zinc-600">Sin stock registrado</p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {data.stockBySede.map((s) => (
                    <div key={s.hubId} className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-zinc-200">{s.hubName}</p>
                        <p className="text-xs text-zinc-500">{s.hubCity}</p>
                      </div>
                      <span className="font-mono text-lg font-bold text-primary">{s.quantity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Historial de Movimientos */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Historial de Movimientos</h4>
                <Button variant="outline" size="sm" onClick={handleExport} className="gap-1 border-zinc-700 text-zinc-400 hover:bg-zinc-800 h-7 text-xs">
                  <Download size={12} /> Excel
                </Button>
              </div>
              {data.movements.length === 0 ? (
                <p className="text-sm text-zinc-600 text-center py-4">Sin movimientos registrados</p>
              ) : (
                <div className="space-y-1.5 max-h-[250px] overflow-y-auto pr-1">
                  {data.movements.map((m) => (
                    <div key={m.id} className="flex items-center justify-between bg-zinc-950 border border-zinc-800/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        {movementIcon(m.movementType)}
                        <Badge variant="outline" className={`text-xs ${movementColor(m.movementType)}`}>{m.movementType}</Badge>
                        {m.notes && <span className="text-xs text-zinc-600 truncate max-w-[150px]">{m.notes}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-mono text-sm font-bold ${m.movementType === 'SALIDA' ? 'text-red-400' : 'text-emerald-400'}`}>
                          {m.movementType === 'SALIDA' ? '-' : '+'}{m.quantity}
                        </span>
                        <span className="text-xs text-zinc-600">
                          {new Date(m.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center py-16 text-zinc-500">Error cargando datos</div>
        )}
      </div>
    </div>
  );
}
